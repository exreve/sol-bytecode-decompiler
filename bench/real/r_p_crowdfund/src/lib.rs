// Realistic clean program (bench/README.md, bench/expected/r_p_crowdfund.json): SOL crowdfunding campaigns with
// per-contributor receipts, pinocchio 0.8.4 + pinocchio-system. Hand-written checks: signer, owner (is_owned_by),
// length and type tag, PDA addresses re-derived from stored bumps, stored-key comparisons, the system program id,
// checked arithmetic, a state machine (active -> succeeded / failed -> withdrawn), a permissionless finalize crank
// and a permissionless batch refund over remaining accounts (each receipt checked against its campaign and its
// contributor). Every instruction is meant to be correct as written.
use pinocchio::{
	account_info::AccountInfo,
	entrypoint,
	instruction::{Seed, Signer},
	msg,
	program_error::ProgramError,
	pubkey::{self, Pubkey},
	sysvars::{clock::Clock, rent::Rent, Sysvar},
	ProgramResult,
};
use pinocchio_system::instructions::{Allocate, Assign, CreateAccount, Transfer};

entrypoint!(process);

pub const CAMPAIGN_SEED: &[u8] = b"campaign";
pub const RECEIPT_SEED: &[u8] = b"receipt";
pub const TAG_CAMPAIGN: u8 = 1;
pub const TAG_RECEIPT: u8 = 2;
pub const ACTIVE: u8 = 0;
pub const SUCCEEDED: u8 = 1;
pub const FAILED: u8 = 2;
pub const WITHDRAWN: u8 = 3;
pub const MAX_DURATION: i64 = 90 * 24 * 3600;

pub const ERR_UNAUTHORIZED: u32 = 1;
pub const ERR_WRONG_ACCOUNT: u32 = 2;
pub const ERR_BAD_STATE: u32 = 3;
pub const ERR_BAD_PARAMS: u32 = 4;
pub const ERR_OVERFLOW: u32 = 5;
pub const ERR_DEADLINE: u32 = 6;

fn err(code: u32) -> ProgramError {
	ProgramError::Custom(code)
}

// campaign: tag @0, creator @1, goal u64 @33, raised u64 @41, refunded u64 @49, deadline i64 @57, state u8 @65,
// bump u8 @66, id u64 @67, contributors u32 @75
pub const CAMPAIGN_LEN: usize = 79;
pub struct Campaign {
	pub creator: Pubkey,
	pub goal: u64,
	pub raised: u64,
	pub refunded: u64,
	pub deadline: i64,
	pub state: u8,
	pub bump: u8,
	pub id: u64,
	pub contributors: u32,
}

// receipt: tag @0, campaign @1, contributor @33, amount u64 @65, bump u8 @73
pub const RECEIPT_LEN: usize = 74;
pub struct Receipt {
	pub campaign: Pubkey,
	pub contributor: Pubkey,
	pub amount: u64,
	pub bump: u8,
}

fn rd<const N: usize>(d: &[u8], at: usize) -> [u8; N] {
	d[at..at + N].try_into().unwrap()
}

impl Campaign {
	fn pack(&self, d: &mut [u8]) {
		d[0] = TAG_CAMPAIGN;
		d[1..33].copy_from_slice(&self.creator);
		d[33..41].copy_from_slice(&self.goal.to_le_bytes());
		d[41..49].copy_from_slice(&self.raised.to_le_bytes());
		d[49..57].copy_from_slice(&self.refunded.to_le_bytes());
		d[57..65].copy_from_slice(&self.deadline.to_le_bytes());
		d[65] = self.state;
		d[66] = self.bump;
		d[67..75].copy_from_slice(&self.id.to_le_bytes());
		d[75..79].copy_from_slice(&self.contributors.to_le_bytes());
	}
}

impl Receipt {
	fn pack(&self, d: &mut [u8]) {
		d[0] = TAG_RECEIPT;
		d[1..33].copy_from_slice(&self.campaign);
		d[33..65].copy_from_slice(&self.contributor);
		d[65..73].copy_from_slice(&self.amount.to_le_bytes());
		d[73] = self.bump;
	}
}

fn require_signer(a: &AccountInfo) -> ProgramResult {
	if !a.is_signer() {
		return Err(ProgramError::MissingRequiredSignature);
	}
	Ok(())
}

fn require_key(a: &AccountInfo, expected: &Pubkey) -> ProgramResult {
	if a.key() != expected {
		return Err(err(ERR_WRONG_ACCOUNT));
	}
	Ok(())
}

/// A campaign: owned by this program, right length and tag, at [campaign, creator, id] with its stored bump.
fn load_campaign(program_id: &Pubkey, a: &AccountInfo) -> Result<Campaign, ProgramError> {
	if !a.is_owned_by(program_id) {
		return Err(ProgramError::IncorrectProgramId);
	}
	let d = a.try_borrow_data()?;
	if d.len() != CAMPAIGN_LEN || d[0] != TAG_CAMPAIGN {
		return Err(ProgramError::InvalidAccountData);
	}
	let c = Campaign {
		creator: rd::<32>(&d, 1),
		goal: u64::from_le_bytes(rd(&d, 33)),
		raised: u64::from_le_bytes(rd(&d, 41)),
		refunded: u64::from_le_bytes(rd(&d, 49)),
		deadline: i64::from_le_bytes(rd(&d, 57)),
		state: d[65],
		bump: d[66],
		id: u64::from_le_bytes(rd(&d, 67)),
		contributors: u32::from_le_bytes(rd(&d, 75)),
	};
	let expected = pubkey::create_program_address(&[CAMPAIGN_SEED, &c.creator, &c.id.to_le_bytes(), &[c.bump]], program_id)?;
	require_key(a, &expected)?;
	Ok(c)
}

/// A receipt of `campaign`: owned by this program, right length and tag, recording this campaign, at
/// [receipt, campaign, contributor] with its stored bump.
fn load_receipt(program_id: &Pubkey, campaign: &Pubkey, a: &AccountInfo) -> Result<Receipt, ProgramError> {
	if !a.is_owned_by(program_id) {
		return Err(ProgramError::IncorrectProgramId);
	}
	let d = a.try_borrow_data()?;
	if d.len() != RECEIPT_LEN || d[0] != TAG_RECEIPT {
		return Err(ProgramError::InvalidAccountData);
	}
	let r = Receipt { campaign: rd::<32>(&d, 1), contributor: rd::<32>(&d, 33), amount: u64::from_le_bytes(rd(&d, 65)), bump: d[73] };
	if &r.campaign != campaign {
		return Err(err(ERR_WRONG_ACCOUNT));
	}
	let expected = pubkey::create_program_address(&[RECEIPT_SEED, campaign, &r.contributor, &[r.bump]], program_id)?;
	require_key(a, &expected)?;
	Ok(r)
}

fn store_campaign(a: &AccountInfo, c: &Campaign) -> ProgramResult {
	c.pack(&mut a.try_borrow_mut_data()?);
	Ok(())
}

fn move_lamports(from: &AccountInfo, to: &AccountInfo, amount: u64) -> ProgramResult {
	let from_balance = from.lamports().checked_sub(amount).ok_or(err(ERR_OVERFLOW))?;
	let to_balance = to.lamports().checked_add(amount).ok_or(err(ERR_OVERFLOW))?;
	*from.try_borrow_mut_lamports()? = from_balance;
	*to.try_borrow_mut_lamports()? = to_balance;
	Ok(())
}

/// Moves every lamport of a program-owned account to `to`, wipes its data and closes it.
fn close_to(a: &AccountInfo, to: &AccountInfo) -> ProgramResult {
	a.try_borrow_mut_data()?.fill(0);
	move_lamports(a, to, a.lamports())?;
	a.close()
}

/// Creates the program account `target` (its address checked by the caller) at `space` bytes, rent paid by `payer`,
/// signed with the PDA seeds. An address someone pre-funded (a system account with lamports) is topped up,
/// allocated and assigned instead, so nobody can block the creation by sending lamports to it.
fn create_pda(program_id: &Pubkey, payer: &AccountInfo, target: &AccountInfo, space: usize, signer: Signer) -> ProgramResult {
	let rent = Rent::get()?.minimum_balance(space);
	let signers = [signer];
	if target.lamports() == 0 {
		return CreateAccount { from: payer, to: target, lamports: rent, space: space as u64, owner: program_id }.invoke_signed(&signers);
	}
	let missing = rent.saturating_sub(target.lamports());
	if missing > 0 {
		Transfer { from: payer, to: target, lamports: missing }.invoke()?;
	}
	Allocate { account: target, space: space as u64 }.invoke_signed(&signers)?;
	Assign { account: target, owner: program_id }.invoke_signed(&signers)
}

fn arg<const N: usize>(data: &[u8], at: usize) -> Result<[u8; N], ProgramError> {
	data.get(at..at + N).and_then(|s| s.try_into().ok()).ok_or(ProgramError::InvalidInstructionData)
}

fn now() -> Result<i64, ProgramError> {
	Ok(Clock::get()?.unix_timestamp)
}

pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	match data.first() {
		Some(0) => create_campaign(program_id, accounts, u64::from_le_bytes(arg(data, 1)?), u64::from_le_bytes(arg(data, 9)?), i64::from_le_bytes(arg(data, 17)?)),
		Some(1) => contribute(program_id, accounts, u64::from_le_bytes(arg(data, 1)?)),
		Some(2) => reduce_contribution(program_id, accounts, u64::from_le_bytes(arg(data, 1)?)),
		Some(3) => finalize(program_id, accounts),
		Some(4) => withdraw(program_id, accounts),
		Some(5) => refund(program_id, accounts),
		Some(6) => batch_refund(program_id, accounts),
		Some(7) => cancel(program_id, accounts),
		Some(8) => update_campaign(program_id, accounts, u64::from_le_bytes(arg(data, 1)?), i64::from_le_bytes(arg(data, 9)?)),
		Some(9) => close_campaign(program_id, accounts),
		_ => Err(ProgramError::InvalidInstructionData),
	}
}

fn check_schedule(goal: u64, deadline: i64) -> ProgramResult {
	let t = now()?;
	if goal == 0 || deadline <= t || deadline > t.saturating_add(MAX_DURATION) {
		return Err(err(ERR_BAD_PARAMS));
	}
	Ok(())
}

// 0 accounts: creator (signer, writable), campaign (writable, PDA [campaign, creator, id]), system_program
fn create_campaign(program_id: &Pubkey, accounts: &[AccountInfo], id: u64, goal: u64, deadline: i64) -> ProgramResult {
	let [creator, campaign, system, ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	require_signer(creator)?;
	require_key(system, &pinocchio_system::ID)?;
	check_schedule(goal, deadline)?;
	let id_bytes = id.to_le_bytes();
	let (expected, bump) = pubkey::find_program_address(&[CAMPAIGN_SEED, creator.key(), &id_bytes], program_id);
	require_key(campaign, &expected)?;
	let bump_bytes = [bump];
	let seeds = [Seed::from(CAMPAIGN_SEED), Seed::from(creator.key()), Seed::from(&id_bytes), Seed::from(&bump_bytes)];
	create_pda(program_id, creator, campaign, CAMPAIGN_LEN, Signer::from(&seeds))?;
	let c = Campaign { creator: *creator.key(), goal, raised: 0, refunded: 0, deadline, state: ACTIVE, bump, id, contributors: 0 };
	store_campaign(campaign, &c)
}

// 1 accounts: contributor (signer, writable), campaign (writable), receipt (writable, PDA [receipt, campaign,
// contributor]; created on the first contribution), system_program
fn contribute(program_id: &Pubkey, accounts: &[AccountInfo], amount: u64) -> ProgramResult {
	let [contributor, campaign, receipt, system, ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	require_signer(contributor)?;
	require_key(system, &pinocchio_system::ID)?;
	let mut c = load_campaign(program_id, campaign)?;
	if c.state != ACTIVE || now()? >= c.deadline {
		return Err(err(ERR_DEADLINE));
	}
	if amount == 0 {
		return Err(err(ERR_BAD_PARAMS));
	}
	let mut r = if !receipt.is_owned_by(program_id) {
		let (expected, bump) = pubkey::find_program_address(&[RECEIPT_SEED, campaign.key(), contributor.key()], program_id);
		require_key(receipt, &expected)?;
		let bump_bytes = [bump];
		let seeds = [Seed::from(RECEIPT_SEED), Seed::from(campaign.key()), Seed::from(contributor.key()), Seed::from(&bump_bytes)];
		create_pda(program_id, contributor, receipt, RECEIPT_LEN, Signer::from(&seeds))?;
		c.contributors = c.contributors.checked_add(1).ok_or(err(ERR_OVERFLOW))?;
		Receipt { campaign: *campaign.key(), contributor: *contributor.key(), amount: 0, bump }
	} else {
		let r = load_receipt(program_id, campaign.key(), receipt)?;
		require_key(contributor, &r.contributor)?;
		r
	};
	Transfer { from: contributor, to: campaign, lamports: amount }.invoke()?;
	r.amount = r.amount.checked_add(amount).ok_or(err(ERR_OVERFLOW))?;
	c.raised = c.raised.checked_add(amount).ok_or(err(ERR_OVERFLOW))?;
	r.pack(&mut receipt.try_borrow_mut_data()?);
	store_campaign(campaign, &c)
}

// 2 accounts: contributor (signer, writable), campaign (writable), receipt (writable). Before the deadline a
// contributor can take back part of its own contribution.
fn reduce_contribution(program_id: &Pubkey, accounts: &[AccountInfo], amount: u64) -> ProgramResult {
	let [contributor, campaign, receipt, ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	require_signer(contributor)?;
	let mut c = load_campaign(program_id, campaign)?;
	if c.state != ACTIVE || now()? >= c.deadline {
		return Err(err(ERR_DEADLINE));
	}
	let mut r = load_receipt(program_id, campaign.key(), receipt)?;
	require_key(contributor, &r.contributor)?;
	if amount == 0 || amount > r.amount {
		return Err(err(ERR_BAD_PARAMS));
	}
	r.amount -= amount;
	c.raised = c.raised.checked_sub(amount).ok_or(err(ERR_OVERFLOW))?;
	r.pack(&mut receipt.try_borrow_mut_data()?);
	store_campaign(campaign, &c)?;
	move_lamports(campaign, contributor, amount)
}

// 3 accounts: campaign (writable). Permissionless crank once the deadline has passed.
fn finalize(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
	let [campaign, ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	let mut c = load_campaign(program_id, campaign)?;
	if c.state != ACTIVE {
		return Err(err(ERR_BAD_STATE));
	}
	if now()? < c.deadline {
		return Err(err(ERR_DEADLINE));
	}
	c.state = if c.raised >= c.goal { SUCCEEDED } else { FAILED };
	msg!("campaign finalized");
	store_campaign(campaign, &c)
}

// 4 accounts: creator (signer, writable, == campaign.creator), campaign (writable)
fn withdraw(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
	let [creator, campaign, ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	require_signer(creator)?;
	let mut c = load_campaign(program_id, campaign)?;
	if creator.key() != &c.creator {
		return Err(err(ERR_UNAUTHORIZED));
	}
	if c.state != SUCCEEDED {
		return Err(err(ERR_BAD_STATE));
	}
	c.state = WITHDRAWN;
	store_campaign(campaign, &c)?;
	move_lamports(campaign, creator, c.raised)
}

/// Returns a receipt's contribution from the failed campaign to its contributor and closes the receipt (rent to the
/// contributor, who paid it). `c` is updated (refunded).
fn refund_one(program_id: &Pubkey, c: &mut Campaign, campaign: &AccountInfo, receipt: &AccountInfo, contributor: &AccountInfo) -> ProgramResult {
	let r = load_receipt(program_id, campaign.key(), receipt)?;
	require_key(contributor, &r.contributor)?;
	c.refunded = c.refunded.checked_add(r.amount).ok_or(err(ERR_OVERFLOW))?;
	move_lamports(campaign, contributor, r.amount)?;
	close_to(receipt, contributor)
}

// 5 accounts: contributor (signer, writable), campaign (writable), receipt (writable). Failed campaign: the
// contribution and the receipt's rent go back; withdrawn campaign: only the receipt's rent (the receipt is closed).
fn refund(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
	let [contributor, campaign, receipt, ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	require_signer(contributor)?;
	let mut c = load_campaign(program_id, campaign)?;
	match c.state {
		FAILED => {
			refund_one(program_id, &mut c, campaign, receipt, contributor)?;
			store_campaign(campaign, &c)
		}
		WITHDRAWN => {
			let r = load_receipt(program_id, campaign.key(), receipt)?;
			require_key(contributor, &r.contributor)?;
			close_to(receipt, contributor)
		}
		_ => Err(err(ERR_BAD_STATE)),
	}
}

// 6 accounts: campaign (writable), then pairs (receipt (writable), contributor (writable, == receipt.contributor)).
// Permissionless: each refund can only go to the receipt's own contributor.
fn batch_refund(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
	let [campaign, pairs @ ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	if pairs.is_empty() || pairs.len() % 2 != 0 {
		return Err(ProgramError::NotEnoughAccountKeys);
	}
	let mut c = load_campaign(program_id, campaign)?;
	if c.state != FAILED {
		return Err(err(ERR_BAD_STATE));
	}
	for pair in pairs.chunks_exact(2) {
		refund_one(program_id, &mut c, campaign, &pair[0], &pair[1])?;
	}
	store_campaign(campaign, &c)
}

// 7 accounts: creator (signer, == campaign.creator), campaign (writable). An active campaign can be cancelled by its
// creator: it fails and every contributor can take its contribution back.
fn cancel(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
	let [creator, campaign, ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	require_signer(creator)?;
	let mut c = load_campaign(program_id, campaign)?;
	require_key(creator, &c.creator)?;
	if c.state != ACTIVE {
		return Err(err(ERR_BAD_STATE));
	}
	c.state = FAILED;
	store_campaign(campaign, &c)
}

// 8 accounts: creator (signer, == campaign.creator), campaign (writable). Goal and deadline can change only while
// nothing has been raised.
fn update_campaign(program_id: &Pubkey, accounts: &[AccountInfo], goal: u64, deadline: i64) -> ProgramResult {
	let [creator, campaign, ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	require_signer(creator)?;
	let mut c = load_campaign(program_id, campaign)?;
	require_key(creator, &c.creator)?;
	if c.state != ACTIVE || c.raised != 0 || c.contributors != 0 {
		return Err(err(ERR_BAD_STATE));
	}
	check_schedule(goal, deadline)?;
	c.goal = goal;
	c.deadline = deadline;
	store_campaign(campaign, &c)
}

// 9 accounts: creator (signer, writable, == campaign.creator), campaign (writable). Only once the funds are gone:
// withdrawn, or failed with every contribution refunded.
fn close_campaign(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
	let [creator, campaign, ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	require_signer(creator)?;
	let c = load_campaign(program_id, campaign)?;
	require_key(creator, &c.creator)?;
	let done = c.state == WITHDRAWN || (c.state == FAILED && c.refunded == c.raised);
	if !done {
		return Err(err(ERR_BAD_STATE));
	}
	close_to(campaign, creator)
}
