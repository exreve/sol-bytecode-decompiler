// Realistic clean program (bench/README.md, bench/expected/r_n_vesting.json): SOL vesting schedules with a fee registry,
// solana-program 2.2.1. Validation the way native programs write it: small assert_* helpers returning custom errors,
// loaders that check owner, length, type tag and the PDA (re-derived from the stored bump), stored-key comparisons,
// a hard-coded admin for the one-time init, the Clock sysvar account's address, system program CPIs through
// invoke_signed, checked / u128 arithmetic, a permissionless release (destinations bound to stored keys) and a batch
// release over remaining accounts validated pair by pair. Every instruction is meant to be correct as written.
use solana_program::{
	account_info::{next_account_info, AccountInfo},
	clock::Clock,
	entrypoint,
	entrypoint::ProgramResult,
	msg,
	program::invoke_signed,
	program_error::ProgramError,
	pubkey,
	pubkey::Pubkey,
	rent::Rent,
	system_instruction, system_program,
	sysvar::{self, Sysvar},
};

entrypoint!(process);

pub const ADMIN: Pubkey = pubkey!("9TRNreAZ2ULPqoyyxt2TdS2WoJXUpemQCU7S6qvnTLt2");
pub const REGISTRY_SEED: &[u8] = b"registry";
pub const VESTING_SEED: &[u8] = b"vesting";
pub const TAG_REGISTRY: u8 = 1;
pub const TAG_VESTING: u8 = 2;
pub const MAX_FEE_BPS: u16 = 500;

#[repr(u32)]
pub enum VestError {
	NotAdmin = 1,
	WrongAccount,
	BadSchedule,
	NotRevocable,
	AlreadyRevoked,
	NotFullyReleased,
	FeeTooHigh,
	MathOverflow,
	NothingToRelease,
}

impl From<VestError> for ProgramError {
	fn from(e: VestError) -> Self {
		ProgramError::Custom(e as u32)
	}
}

// registry: tag u8 @0, admin @1, pending_admin @33, fee_collector @65, fee_bps u16 @97, bump u8 @99
pub const REGISTRY_LEN: usize = 100;
pub struct Registry {
	pub admin: Pubkey,
	pub pending_admin: Pubkey,
	pub fee_collector: Pubkey,
	pub fee_bps: u16,
	pub bump: u8,
}

// vesting: tag u8 @0, funder @1, beneficiary @33, total u64 @65, released u64 @73, start i64 @81, cliff i64 @89,
// end i64 @97, revocable u8 @105, revoked u8 @106, bump u8 @107, seed u64 @108
pub const VESTING_LEN: usize = 116;
pub struct Vesting {
	pub funder: Pubkey,
	pub beneficiary: Pubkey,
	pub total: u64,
	pub released: u64,
	pub start: i64,
	pub cliff: i64,
	pub end: i64,
	pub revocable: bool,
	pub revoked: bool,
	pub bump: u8,
	pub seed: u64,
}

fn key_at(d: &[u8], at: usize) -> Pubkey {
	Pubkey::new_from_array(d[at..at + 32].try_into().unwrap())
}
fn u64_at(d: &[u8], at: usize) -> u64 {
	u64::from_le_bytes(d[at..at + 8].try_into().unwrap())
}
fn i64_at(d: &[u8], at: usize) -> i64 {
	i64::from_le_bytes(d[at..at + 8].try_into().unwrap())
}

impl Registry {
	fn pack(&self, d: &mut [u8]) {
		d[0] = TAG_REGISTRY;
		d[1..33].copy_from_slice(self.admin.as_ref());
		d[33..65].copy_from_slice(self.pending_admin.as_ref());
		d[65..97].copy_from_slice(self.fee_collector.as_ref());
		d[97..99].copy_from_slice(&self.fee_bps.to_le_bytes());
		d[99] = self.bump;
	}
}

impl Vesting {
	fn pack(&self, d: &mut [u8]) {
		d[0] = TAG_VESTING;
		d[1..33].copy_from_slice(self.funder.as_ref());
		d[33..65].copy_from_slice(self.beneficiary.as_ref());
		d[65..73].copy_from_slice(&self.total.to_le_bytes());
		d[73..81].copy_from_slice(&self.released.to_le_bytes());
		d[81..89].copy_from_slice(&self.start.to_le_bytes());
		d[89..97].copy_from_slice(&self.cliff.to_le_bytes());
		d[97..105].copy_from_slice(&self.end.to_le_bytes());
		d[105] = self.revocable as u8;
		d[106] = self.revoked as u8;
		d[107] = self.bump;
		d[108..116].copy_from_slice(&self.seed.to_le_bytes());
	}

	/// Lamports vested at `now`: nothing before the cliff, linear from start to end; all of `total` once revoked
	/// (revoke shrinks total to what had vested).
	fn vested(&self, now: i64) -> Result<u64, ProgramError> {
		if self.revoked || now >= self.end {
			return Ok(self.total);
		}
		if now < self.cliff {
			return Ok(0);
		}
		let elapsed = (now - self.start) as u128;
		let duration = (self.end - self.start) as u128;
		let v = (self.total as u128).checked_mul(elapsed).ok_or(VestError::MathOverflow)? / duration;
		u64::try_from(v).map_err(|_| VestError::MathOverflow.into())
	}
}

fn assert_signer(a: &AccountInfo) -> ProgramResult {
	if !a.is_signer {
		return Err(ProgramError::MissingRequiredSignature);
	}
	Ok(())
}

fn assert_key(a: &AccountInfo, expected: &Pubkey) -> ProgramResult {
	if a.key != expected {
		msg!("unexpected account {}", a.key);
		return Err(VestError::WrongAccount.into());
	}
	Ok(())
}

fn assert_writable(a: &AccountInfo) -> ProgramResult {
	if !a.is_writable {
		return Err(ProgramError::InvalidAccountData);
	}
	Ok(())
}

/// The registry PDA: owned by this program, the right size and tag, at the address its stored bump derives.
fn load_registry(program_id: &Pubkey, a: &AccountInfo) -> Result<Registry, ProgramError> {
	if a.owner != program_id {
		return Err(ProgramError::IncorrectProgramId);
	}
	let d = a.try_borrow_data()?;
	if d.len() != REGISTRY_LEN || d[0] != TAG_REGISTRY {
		return Err(ProgramError::InvalidAccountData);
	}
	let r = Registry { admin: key_at(&d, 1), pending_admin: key_at(&d, 33), fee_collector: key_at(&d, 65), fee_bps: u16::from_le_bytes([d[97], d[98]]), bump: d[99] };
	let expected = Pubkey::create_program_address(&[REGISTRY_SEED, &[r.bump]], program_id)?;
	assert_key(a, &expected)?;
	Ok(r)
}

/// A vesting PDA: owned by this program, right size and tag, at [vesting, funder, seed] with the stored bump.
fn load_vesting(program_id: &Pubkey, a: &AccountInfo) -> Result<Vesting, ProgramError> {
	if a.owner != program_id {
		return Err(ProgramError::IncorrectProgramId);
	}
	let d = a.try_borrow_data()?;
	if d.len() != VESTING_LEN || d[0] != TAG_VESTING {
		return Err(ProgramError::InvalidAccountData);
	}
	let v = Vesting {
		funder: key_at(&d, 1),
		beneficiary: key_at(&d, 33),
		total: u64_at(&d, 65),
		released: u64_at(&d, 73),
		start: i64_at(&d, 81),
		cliff: i64_at(&d, 89),
		end: i64_at(&d, 97),
		revocable: d[105] != 0,
		revoked: d[106] != 0,
		bump: d[107],
		seed: u64_at(&d, 108),
	};
	let expected = Pubkey::create_program_address(&[VESTING_SEED, v.funder.as_ref(), &v.seed.to_le_bytes(), &[v.bump]], program_id)?;
	assert_key(a, &expected)?;
	Ok(v)
}

fn store_vesting(a: &AccountInfo, v: &Vesting) -> ProgramResult {
	v.pack(&mut a.try_borrow_mut_data()?);
	Ok(())
}

fn store_registry(a: &AccountInfo, r: &Registry) -> ProgramResult {
	r.pack(&mut a.try_borrow_mut_data()?);
	Ok(())
}

fn move_lamports(from: &AccountInfo, to: &AccountInfo, amount: u64) -> ProgramResult {
	let from_balance = from.lamports().checked_sub(amount).ok_or(VestError::MathOverflow)?;
	let to_balance = to.lamports().checked_add(amount).ok_or(VestError::MathOverflow)?;
	**from.try_borrow_mut_lamports()? = from_balance;
	**to.try_borrow_mut_lamports()? = to_balance;
	Ok(())
}

fn args<const N: usize>(data: &[u8], at: usize) -> Result<[u8; N], ProgramError> {
	data.get(at..at + N).and_then(|s| s.try_into().ok()).ok_or(ProgramError::InvalidInstructionData)
}

pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	match data.first() {
		Some(0) => init_registry(program_id, accounts, u16::from_le_bytes(args(data, 1)?), Pubkey::new_from_array(args(data, 3)?)),
		Some(1) => set_fee(program_id, accounts, u16::from_le_bytes(args(data, 1)?)),
		Some(2) => propose_admin(program_id, accounts, Pubkey::new_from_array(args(data, 1)?)),
		Some(3) => accept_admin(program_id, accounts),
		Some(4) => set_fee_collector(program_id, accounts, Pubkey::new_from_array(args(data, 1)?)),
		Some(5) => create_vesting(
			program_id,
			accounts,
			u64::from_le_bytes(args(data, 1)?),
			u64::from_le_bytes(args(data, 9)?),
			i64::from_le_bytes(args(data, 17)?),
			i64::from_le_bytes(args(data, 25)?),
			i64::from_le_bytes(args(data, 33)?),
			args::<1>(data, 41)?[0] != 0,
		),
		Some(6) => release(program_id, accounts),
		Some(7) => revoke(program_id, accounts),
		Some(8) => transfer_beneficiary(program_id, accounts),
		Some(9) => close_vesting(program_id, accounts),
		Some(10) => batch_release(program_id, accounts),
		_ => Err(ProgramError::InvalidInstructionData),
	}
}

// 0 accounts: admin (signer, writable, == ADMIN), registry (writable, PDA [registry]), system_program
fn init_registry(program_id: &Pubkey, accounts: &[AccountInfo], fee_bps: u16, fee_collector: Pubkey) -> ProgramResult {
	let it = &mut accounts.iter();
	let admin = next_account_info(it)?;
	let registry = next_account_info(it)?;
	let system = next_account_info(it)?;
	assert_signer(admin)?;
	if admin.key != &ADMIN {
		return Err(VestError::NotAdmin.into());
	}
	assert_key(system, &system_program::ID)?;
	if fee_bps > MAX_FEE_BPS {
		return Err(VestError::FeeTooHigh.into());
	}
	let (expected, bump) = Pubkey::find_program_address(&[REGISTRY_SEED], program_id);
	assert_key(registry, &expected)?;
	let lamports = Rent::get()?.minimum_balance(REGISTRY_LEN);
	invoke_signed(
		&system_instruction::create_account(admin.key, registry.key, lamports, REGISTRY_LEN as u64, program_id),
		&[admin.clone(), registry.clone(), system.clone()],
		&[&[REGISTRY_SEED, &[bump]]],
	)?;
	store_registry(registry, &Registry { admin: *admin.key, pending_admin: Pubkey::default(), fee_collector, fee_bps, bump })
}

/// admin (signer) + registry (writable): the registry, loaded and checked, whose stored admin signed
fn admin_registry<'a, 'b>(program_id: &Pubkey, accounts: &'a [AccountInfo<'b>]) -> Result<(&'a AccountInfo<'b>, Registry), ProgramError> {
	let it = &mut accounts.iter();
	let admin = next_account_info(it)?;
	let registry = next_account_info(it)?;
	assert_signer(admin)?;
	assert_writable(registry)?;
	let r = load_registry(program_id, registry)?;
	if admin.key != &r.admin {
		return Err(VestError::NotAdmin.into());
	}
	Ok((registry, r))
}

// 1 accounts: admin (signer), registry (writable)
fn set_fee(program_id: &Pubkey, accounts: &[AccountInfo], fee_bps: u16) -> ProgramResult {
	let (registry, mut r) = admin_registry(program_id, accounts)?;
	if fee_bps > MAX_FEE_BPS {
		return Err(VestError::FeeTooHigh.into());
	}
	r.fee_bps = fee_bps;
	store_registry(registry, &r)
}

// 2 accounts: admin (signer), registry (writable)
fn propose_admin(program_id: &Pubkey, accounts: &[AccountInfo], new_admin: Pubkey) -> ProgramResult {
	let (registry, mut r) = admin_registry(program_id, accounts)?;
	r.pending_admin = new_admin;
	store_registry(registry, &r)
}

// 3 accounts: new_admin (signer, == registry.pending_admin), registry (writable)
fn accept_admin(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
	let it = &mut accounts.iter();
	let new_admin = next_account_info(it)?;
	let registry = next_account_info(it)?;
	assert_signer(new_admin)?;
	let mut r = load_registry(program_id, registry)?;
	assert_key(new_admin, &r.pending_admin)?;
	r.admin = *new_admin.key;
	r.pending_admin = Pubkey::default();
	msg!("admin is now {}", new_admin.key);
	store_registry(registry, &r)
}

// 4 accounts: admin (signer), registry (writable)
fn set_fee_collector(program_id: &Pubkey, accounts: &[AccountInfo], fee_collector: Pubkey) -> ProgramResult {
	let (registry, mut r) = admin_registry(program_id, accounts)?;
	r.fee_collector = fee_collector;
	store_registry(registry, &r)
}

// 5 accounts: funder (signer, writable), beneficiary, vesting (writable, PDA [vesting, funder, seed]), system_program.
// Permissionless: the funder locks its own lamports for any beneficiary.
#[allow(clippy::too_many_arguments)]
fn create_vesting(program_id: &Pubkey, accounts: &[AccountInfo], seed: u64, total: u64, start: i64, cliff: i64, end: i64, revocable: bool) -> ProgramResult {
	let it = &mut accounts.iter();
	let funder = next_account_info(it)?;
	let beneficiary = next_account_info(it)?;
	let vesting = next_account_info(it)?;
	let system = next_account_info(it)?;
	assert_signer(funder)?;
	assert_key(system, &system_program::ID)?;
	if total == 0 || start >= end || cliff < start || cliff > end {
		return Err(VestError::BadSchedule.into());
	}
	let (expected, bump) = Pubkey::find_program_address(&[VESTING_SEED, funder.key.as_ref(), &seed.to_le_bytes()], program_id);
	assert_key(vesting, &expected)?;
	let lamports = Rent::get()?.minimum_balance(VESTING_LEN).checked_add(total).ok_or(VestError::MathOverflow)?;
	invoke_signed(
		&system_instruction::create_account(funder.key, vesting.key, lamports, VESTING_LEN as u64, program_id),
		&[funder.clone(), vesting.clone(), system.clone()],
		&[&[VESTING_SEED, funder.key.as_ref(), &seed.to_le_bytes(), &[bump]]],
	)?;
	let v = Vesting { funder: *funder.key, beneficiary: *beneficiary.key, total, released: 0, start, cliff, end, revocable, revoked: false, bump, seed };
	store_vesting(vesting, &v)
}

/// Pays what has vested and not been released to the stored beneficiary, minus the registry fee to the stored fee
/// collector. Returns the amount released.
fn release_one(program_id: &Pubkey, r: &Registry, vesting: &AccountInfo, beneficiary: &AccountInfo, fee_collector: &AccountInfo, now: i64) -> Result<u64, ProgramError> {
	assert_writable(vesting)?;
	let mut v = load_vesting(program_id, vesting)?;
	assert_key(beneficiary, &v.beneficiary)?;
	let amount = v.vested(now)?.checked_sub(v.released).ok_or(VestError::MathOverflow)?;
	if amount == 0 {
		return Ok(0);
	}
	let fee = u64::try_from((amount as u128) * (r.fee_bps as u128) / 10_000).map_err(|_| VestError::MathOverflow)?;
	v.released = v.released.checked_add(amount).ok_or(VestError::MathOverflow)?;
	store_vesting(vesting, &v)?;
	move_lamports(vesting, beneficiary, amount.checked_sub(fee).ok_or(VestError::MathOverflow)?)?;
	if fee > 0 {
		move_lamports(vesting, fee_collector, fee)?;
	}
	Ok(amount)
}

// 6 accounts: vesting (writable), beneficiary (writable, == vesting.beneficiary), registry, fee_collector (writable,
// == registry.fee_collector). Permissionless crank: every destination is a stored key.
fn release(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
	let it = &mut accounts.iter();
	let vesting = next_account_info(it)?;
	let beneficiary = next_account_info(it)?;
	let registry = next_account_info(it)?;
	let fee_collector = next_account_info(it)?;
	let r = load_registry(program_id, registry)?;
	assert_key(fee_collector, &r.fee_collector)?;
	let released = release_one(program_id, &r, vesting, beneficiary, fee_collector, Clock::get()?.unix_timestamp)?;
	if released == 0 {
		return Err(VestError::NothingToRelease.into());
	}
	msg!("released {}", released);
	Ok(())
}

// 7 accounts: funder (signer, writable, == vesting.funder), vesting (writable), clock sysvar
fn revoke(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
	let it = &mut accounts.iter();
	let funder = next_account_info(it)?;
	let vesting = next_account_info(it)?;
	let clock = next_account_info(it)?;
	assert_signer(funder)?;
	assert_writable(vesting)?;
	assert_key(clock, &sysvar::clock::ID)?;
	let now = Clock::from_account_info(clock)?.unix_timestamp;
	let mut v = load_vesting(program_id, vesting)?;
	assert_key(funder, &v.funder)?;
	if !v.revocable {
		return Err(VestError::NotRevocable.into());
	}
	if v.revoked {
		return Err(VestError::AlreadyRevoked.into());
	}
	let vested = v.vested(now)?;
	let unvested = v.total.checked_sub(vested).ok_or(VestError::MathOverflow)?;
	v.total = vested;
	v.revoked = true;
	store_vesting(vesting, &v)?;
	move_lamports(vesting, funder, unvested)
}

// 8 accounts: beneficiary (signer, == vesting.beneficiary), vesting (writable), new_beneficiary
fn transfer_beneficiary(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
	let it = &mut accounts.iter();
	let beneficiary = next_account_info(it)?;
	let vesting = next_account_info(it)?;
	let new_beneficiary = next_account_info(it)?;
	assert_signer(beneficiary)?;
	assert_writable(vesting)?;
	let mut v = load_vesting(program_id, vesting)?;
	assert_key(beneficiary, &v.beneficiary)?;
	v.beneficiary = *new_beneficiary.key;
	store_vesting(vesting, &v)
}

// 9 accounts: beneficiary (signer, == vesting.beneficiary), vesting (writable), funder (writable, == vesting.funder)
// Closes a fully released schedule: the rent goes back to the funder who paid it; data zeroed.
fn close_vesting(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
	let it = &mut accounts.iter();
	let beneficiary = next_account_info(it)?;
	let vesting = next_account_info(it)?;
	let funder = next_account_info(it)?;
	assert_signer(beneficiary)?;
	assert_writable(vesting)?;
	let v = load_vesting(program_id, vesting)?;
	assert_key(beneficiary, &v.beneficiary)?;
	assert_key(funder, &v.funder)?;
	if v.released != v.total {
		return Err(VestError::NotFullyReleased.into());
	}
	vesting.try_borrow_mut_data()?.fill(0);
	move_lamports(vesting, funder, vesting.lamports())
}

// 10 accounts: registry, fee_collector (writable, == registry.fee_collector), then pairs (vesting (writable),
// beneficiary (writable, == vesting.beneficiary)). Permissionless batch of release.
fn batch_release(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
	let (registry, rest) = accounts.split_first().ok_or(ProgramError::NotEnoughAccountKeys)?;
	let (fee_collector, pairs) = rest.split_first().ok_or(ProgramError::NotEnoughAccountKeys)?;
	let r = load_registry(program_id, registry)?;
	assert_key(fee_collector, &r.fee_collector)?;
	if pairs.is_empty() || pairs.len() % 2 != 0 {
		return Err(ProgramError::NotEnoughAccountKeys);
	}
	let now = Clock::get()?.unix_timestamp;
	let mut total: u64 = 0;
	for pair in pairs.chunks_exact(2) {
		let released = release_one(program_id, &r, &pair[0], &pair[1], fee_collector, now)?;
		total = total.checked_add(released).ok_or(VestError::MathOverflow)?;
	}
	msg!("batch released {}", total);
	Ok(())
}
