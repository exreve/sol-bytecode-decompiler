// Incident-class templates (Anchor 0.31 + solana-program 2.2.1): instruction introspection, stale data after a CPI,
// Token-2022 received amount, oracle validation, signer / PDA authority forwarded to an account-supplied program,
// rounding direction, and an authority-only drain (informational). Each unit is clean as written; each variant (cargo
// feature v_<id>) removes one property. Rule ids without a rule yet are pseudo ids (bench/README.md, Incident classes).
import type { Unit } from './gen.ts'

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
/** base58 pubkey -> `[u8; 32]` literal */
const bytes = (s: string) => {
	let n = 0n
	for (const c of s) n = n * 58n + BigInt(B58.indexOf(c))
	const out: number[] = []
	for (let i = 0; i < 32; i++) { out.unshift(Number(n & 255n)); n >>= 8n }
	return `[${out.join(', ')}]`
}
const PYTH = bytes('FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH') // Pyth oracle program (mainnet)
const TOKEN = bytes('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const TOKEN_2022 = bytes('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')

const RULES = {
	intro: ['introspection-unchecked', 'sysvar-account-unchecked'],
	introProg: ['introspection-unchecked'],
	introIndex: ['introspection-unchecked'],
	repay: ['flash-repay-unbound', 'introspection-unchecked'],
	stale: ['stale-after-cpi'],
	t22: ['token2022-amount-assumed'],
	oracle: ['oracle-unvalidated'],
	forward: ['signer-to-untrusted-program', 'cpi-unchecked-program'],
	round: ['rounding-favors-user'],
}

/** shared by both programs: a hand-written reader of the Instructions sysvar (as the *_checked helpers of solana-program
 * read it, minus the key check: the caller checks the key or not) and little-endian field readers */
const readers = (err: string) => `fn rd16(d: &[u8], o: usize) -> core::result::Result<usize, ${err}> {
	Ok(u16::from_le_bytes(d.get(o..o + 2).ok_or(BAD_IX)?.try_into().unwrap()) as usize)
}
fn u32_at(d: &[u8], o: usize) -> core::result::Result<u32, ${err}> { Ok(u32::from_le_bytes(d.get(o..o + 4).ok_or(BAD_DATA)?.try_into().unwrap())) }
fn i32_at(d: &[u8], o: usize) -> core::result::Result<i32, ${err}> { Ok(i32::from_le_bytes(d.get(o..o + 4).ok_or(BAD_DATA)?.try_into().unwrap())) }
fn i64_at(d: &[u8], o: usize) -> core::result::Result<i64, ${err}> { Ok(i64::from_le_bytes(d.get(o..o + 8).ok_or(BAD_DATA)?.try_into().unwrap())) }
fn u64_at(d: &[u8], o: usize) -> core::result::Result<u64, ${err}> { Ok(u64::from_le_bytes(d.get(o..o + 8).ok_or(BAD_DATA)?.try_into().unwrap())) }
/** index of the executing instruction (last two bytes of the Instructions sysvar) */
fn ix_current(d: &[u8]) -> core::result::Result<usize, ${err}> {
	if d.len() < 2 { return Err(BAD_IX) }
	rd16(d, d.len() - 2)
}
/** (program id, account keys, data) of the transaction's instruction at absolute index i */
fn ix_at(d: &[u8], i: usize) -> core::result::Result<(Pubkey, Vec<Pubkey>, &[u8]), ${err}> {
	if i >= rd16(d, 0)? { return Err(BAD_IX) }
	let mut o = rd16(d, 2 + 2 * i)?;
	let n = rd16(d, o)?;
	o += 2;
	let mut keys = Vec::with_capacity(n);
	for _ in 0..n {
		keys.push(Pubkey::new_from_array(d.get(o + 1..o + 33).ok_or(BAD_IX)?.try_into().unwrap()));
		o += 33;
	}
	let program = Pubkey::new_from_array(d.get(o..o + 32).ok_or(BAD_IX)?.try_into().unwrap());
	let len = rd16(d, o + 32)?;
	Ok((program, keys, d.get(o + 34..o + 34 + len).ok_or(BAD_IX)?))
}
/** Pyth v2 price account (hand-written layout): magic @0, type @8 (3 = price), expo @20, timestamp @96,
 * aggregate price @208, confidence @216, status @224 (1 = trading) */
const PYTH_MAGIC: u32 = 0xa1b2c3d4;
const MAX_AGE: i64 = 60;
`

// ---- Anchor 0.31 lending reserve ----

export const riskAnchorHeader = `use anchor_lang::solana_program::{instruction::{AccountMeta, Instruction}, program::{invoke, invoke_signed}};
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};

pub const PYTH_PROGRAM: Pubkey = Pubkey::new_from_array(${PYTH});
/** the swap program the reserve routes through */
pub const SWAP_PROGRAM: Pubkey = Pubkey::new_from_array([7u8; 32]);
const BAD_IX: GenError = GenError::BadIx;
const BAD_DATA: GenError = GenError::BadOracle;

${readers('GenError')}
fn xfer<'info>(tp: &Interface<'info, TokenInterface>, from: AccountInfo<'info>, mint: &InterfaceAccount<'info, Mint>, to: AccountInfo<'info>, authority: AccountInfo<'info>, seeds: &[&[&[u8]]], amount: u64) -> Result<()> {
	token_interface::transfer_checked(
		CpiContext::new_with_signer(tp.to_account_info(), TransferChecked { from, mint: mint.to_account_info(), to, authority }, seeds),
		amount,
		mint.decimals,
	)
}
`

const AUTH = `	/// CHECK: PDA authority of the vault
	#[account(seeds = [b"auth", reserve.key().as_ref()], bump)]
	pub reserve_auth: UncheckedAccount<'info>,`
const SEEDS = `	let key = ctx.accounts.reserve.key();
	let seeds: &[&[u8]] = &[b"auth", key.as_ref(), &[ctx.bumps.reserve_auth]];`
const TOKENS = `	pub mint: InterfaceAccount<'info, Mint>,
	pub token_program: Interface<'info, TokenInterface>,`

export const riskAnchorUnits: Unit[] = [
	{
		name: 'init_reserve', types: ['Reserve'], idl: 'admin:ws reserve:w mint reserve_auth vault oracle system_program', args: [['min_liquidity', 'u64']],
		code: `pub fn init_reserve(ctx: Context<InitReserve>, min_liquidity: u64) -> Result<()> {
	let r = &mut ctx.accounts.reserve;
	r.admin = ctx.accounts.admin.key();
	r.mint = ctx.accounts.mint.key();
	r.vault = ctx.accounts.vault.key();
	r.oracle = ctx.accounts.oracle.key();
	r.total_assets = 0;
	r.total_shares = 0;
	r.min_liquidity = min_liquidity;
	r.bump = ctx.bumps.reserve;
	Ok(())
}`,
		accounts: `pub struct InitReserve<'info> {
	#[account(mut)]
	pub admin: Signer<'info>,
	#[account(init, payer = admin, space = 8 + 32 * 4 + 8 * 3 + 1, seeds = [b"reserve", mint.key().as_ref()], bump)]
	pub reserve: Account<'info, Reserve>,
	pub mint: InterfaceAccount<'info, Mint>,
${AUTH}
	#[account(token::mint = mint, token::authority = reserve_auth)]
	pub vault: InterfaceAccount<'info, TokenAccount>,
	/// CHECK: the Pyth price account of the mint, stored (borrow checks the key)
	#[account(owner = PYTH_PROGRAM)]
	pub oracle: UncheckedAccount<'info>,
	pub system_program: Program<'info, System>,
}`,
		variants: [],
	},
	{
		name: 'open_ledger', types: ['Reserve', 'Ledger'], idl: 'owner:ws reserve ledger:w system_program', args: [],
		code: `pub fn open_ledger(ctx: Context<OpenLedger>) -> Result<()> {
	let l = &mut ctx.accounts.ledger;
	l.owner = ctx.accounts.owner.key();
	l.reserve = ctx.accounts.reserve.key();
	l.shares = 0;
	l.deposited = 0;
	l.borrowed = 0;
	Ok(())
}`,
		accounts: `pub struct OpenLedger<'info> {
	#[account(mut)]
	pub owner: Signer<'info>,
	pub reserve: Account<'info, Reserve>,
	#[account(init, payer = owner, space = 8 + 32 * 2 + 8 * 3, seeds = [b"ledger", reserve.key().as_ref(), owner.key().as_ref()], bump)]
	pub ledger: Account<'info, Ledger>,
	pub system_program: Program<'info, System>,
}`,
		variants: [],
	},
	{
		// Token-2022 (transfer fee): credit what the vault received; shares minted rounded down
		name: 'deposit', types: ['Reserve', 'Ledger'], idl: 'reserve:w ledger:w owner:s src:w vault:w mint token_program', args: [['amount', 'u64']],
		code: `pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
	let before = ctx.accounts.vault.amount;
	xfer(&ctx.accounts.token_program, ctx.accounts.src.to_account_info(), &ctx.accounts.mint, ctx.accounts.vault.to_account_info(), ctx.accounts.owner.to_account_info(), &[], amount)?;
	#[cfg(not(feature = "v_nominal_amount"))]
	let received = {
		ctx.accounts.vault.reload()?;
		ctx.accounts.vault.amount.checked_sub(before).ok_or(GenError::Math)?
	};
	#[cfg(feature = "v_nominal_amount")]
	let received = {
		let _ = before;
		amount
	};
	let r = &mut ctx.accounts.reserve;
	let shares = if r.total_shares == 0 || r.total_assets == 0 {
		received
	} else {
		let num = (received as u128) * (r.total_shares as u128);
		#[cfg(not(feature = "v_round_mint_ceil"))]
		let s = num / (r.total_assets as u128);
		#[cfg(feature = "v_round_mint_ceil")]
		let s = (num + r.total_assets as u128 - 1) / (r.total_assets as u128);
		u64::try_from(s).map_err(|_| GenError::Math)?
	};
	require!(shares > 0, GenError::Empty);
	r.total_assets = r.total_assets.checked_add(received).ok_or(GenError::Math)?;
	r.total_shares = r.total_shares.checked_add(shares).ok_or(GenError::Math)?;
	let l = &mut ctx.accounts.ledger;
	l.shares = l.shares.checked_add(shares).ok_or(GenError::Math)?;
	l.deposited = l.deposited.checked_add(received).ok_or(GenError::Math)?;
	Ok(())
}`,
		accounts: `pub struct Deposit<'info> {
	#[account(mut, has_one = vault, has_one = mint)]
	pub reserve: Account<'info, Reserve>,
	#[account(mut, has_one = owner, has_one = reserve)]
	pub ledger: Account<'info, Ledger>,
	pub owner: Signer<'info>,
	#[account(mut, token::mint = mint, token::authority = owner)]
	pub src: InterfaceAccount<'info, TokenAccount>,
	#[account(mut)]
	pub vault: InterfaceAccount<'info, TokenAccount>,
${TOKENS}
}`,
		variants: [
			{ id: 'nominal_amount', rules: RULES.t22 },
			{ id: 'round_mint_ceil', rules: RULES.round },
		],
	},
	{
		// shares burned rounded up; the liquidity floor is checked on the vault balance reloaded after the transfer
		name: 'withdraw', types: ['Reserve', 'Ledger'], idl: 'reserve:w ledger:w owner:s reserve_auth vault:w dest:w mint token_program', args: [['assets', 'u64']],
		code: `pub fn withdraw(ctx: Context<Withdraw>, assets: u64) -> Result<()> {
	{
		let r = &mut ctx.accounts.reserve;
		require!(r.total_assets > 0 && r.total_shares > 0, GenError::Empty);
		let num = (assets as u128) * (r.total_shares as u128);
		#[cfg(not(feature = "v_round_burn_floor"))]
		let burn = (num + r.total_assets as u128 - 1) / (r.total_assets as u128);
		#[cfg(feature = "v_round_burn_floor")]
		let burn = num / (r.total_assets as u128);
		let burn = u64::try_from(burn).map_err(|_| GenError::Math)?;
		r.total_assets = r.total_assets.checked_sub(assets).ok_or(GenError::Math)?;
		r.total_shares = r.total_shares.checked_sub(burn).ok_or(GenError::Math)?;
		let l = &mut ctx.accounts.ledger;
		require!(l.borrowed == 0, GenError::Limit);
		l.shares = l.shares.checked_sub(burn).ok_or(GenError::Math)?;
		l.deposited = l.deposited.saturating_sub(assets);
	}
${SEEDS}
	xfer(&ctx.accounts.token_program, ctx.accounts.vault.to_account_info(), &ctx.accounts.mint, ctx.accounts.dest.to_account_info(), ctx.accounts.reserve_auth.to_account_info(), &[seeds], assets)?;
	#[cfg(not(feature = "v_no_reload"))]
	ctx.accounts.vault.reload()?;
	require!(ctx.accounts.vault.amount >= ctx.accounts.reserve.min_liquidity, GenError::Limit);
	Ok(())
}`,
		accounts: `pub struct Withdraw<'info> {
	#[account(mut, has_one = vault, has_one = mint)]
	pub reserve: Account<'info, Reserve>,
	#[account(mut, has_one = owner, has_one = reserve)]
	pub ledger: Account<'info, Ledger>,
	pub owner: Signer<'info>,
${AUTH}
	#[account(mut)]
	pub vault: InterfaceAccount<'info, TokenAccount>,
	#[account(mut, token::mint = mint, token::authority = owner)]
	pub dest: InterfaceAccount<'info, TokenAccount>,
${TOKENS}
}`,
		variants: [
			{ id: 'round_burn_floor', rules: RULES.round },
			{ id: 'no_reload', rules: RULES.stale },
		],
	},
	{
		// flash loan: the next instruction of the transaction must be this program's flash_repay of the same reserve and amount
		name: 'flash_borrow', types: ['Reserve'], idl: 'reserve borrower:s reserve_auth vault:w dest:w instructions mint token_program', args: [['amount', 'u64'], ['repay_index', 'u16']],
		code: `pub fn flash_borrow(ctx: Context<FlashBorrow>, amount: u64, repay_index: u16) -> Result<()> {
	{
		let d = ctx.accounts.instructions.try_borrow_data()?;
		let current = ix_current(&d)?;
		#[cfg(not(feature = "v_ix_absolute_index"))]
		let at = {
			let _ = repay_index;
			current + 1
		};
		#[cfg(feature = "v_ix_absolute_index")]
		let at = {
			let _ = current;
			repay_index as usize
		};
		let (program, keys, data) = ix_at(&d, at)?;
		#[cfg(not(feature = "v_ix_program_unchecked"))]
		require_keys_eq!(program, crate::ID, GenError::BadRepay);
		let _ = program;
		require!(data.len() >= 16 && &data[..8] == <crate::instruction::FlashRepay as anchor_lang::Discriminator>::DISCRIMINATOR, GenError::BadRepay);
		#[cfg(not(feature = "v_ix_repay_unbound"))]
		require!(keys.first() == Some(&ctx.accounts.reserve.key()) && u64_at(data, 8)? == amount, GenError::BadRepay);
		let _ = keys;
	}
${SEEDS}
	xfer(&ctx.accounts.token_program, ctx.accounts.vault.to_account_info(), &ctx.accounts.mint, ctx.accounts.dest.to_account_info(), ctx.accounts.reserve_auth.to_account_info(), &[seeds], amount)
}`,
		accounts: `pub struct FlashBorrow<'info> {
	#[account(has_one = vault, has_one = mint)]
	pub reserve: Account<'info, Reserve>,
	pub borrower: Signer<'info>,
${AUTH}
	#[account(mut)]
	pub vault: InterfaceAccount<'info, TokenAccount>,
	#[account(mut, token::mint = mint, token::authority = borrower)]
	pub dest: InterfaceAccount<'info, TokenAccount>,
	/// CHECK: the Instructions sysvar (v_ix_sysvar_unchecked: its key is not checked)
	#[cfg_attr(not(feature = "v_ix_sysvar_unchecked"), account(address = anchor_lang::solana_program::sysvar::instructions::ID))]
	pub instructions: UncheckedAccount<'info>,
${TOKENS}
}`,
		variants: [
			{ id: 'ix_sysvar_unchecked', rules: RULES.intro },
			{ id: 'ix_program_unchecked', rules: RULES.introProg },
			{ id: 'ix_absolute_index', rules: RULES.introIndex },
			{ id: 'ix_repay_unbound', rules: RULES.repay },
		],
	},
	{
		name: 'flash_repay', types: ['Reserve'], idl: 'reserve payer:s src:w vault:w mint token_program', args: [['amount', 'u64']],
		code: `pub fn flash_repay(ctx: Context<FlashRepay>, amount: u64) -> Result<()> {
	xfer(&ctx.accounts.token_program, ctx.accounts.src.to_account_info(), &ctx.accounts.mint, ctx.accounts.vault.to_account_info(), ctx.accounts.payer.to_account_info(), &[], amount)
}`,
		accounts: `pub struct FlashRepay<'info> {
	#[account(has_one = vault, has_one = mint)]
	pub reserve: Account<'info, Reserve>,
	pub payer: Signer<'info>,
	#[account(mut, token::mint = mint, token::authority = payer)]
	pub src: InterfaceAccount<'info, TokenAccount>,
	#[account(mut)]
	pub vault: InterfaceAccount<'info, TokenAccount>,
${TOKENS}
}`,
		variants: [],
	},
	{
		// borrow limit from the reserve's Pyth price: status trading, confidence <= 2 %, published within MAX_AGE s
		name: 'borrow', types: ['Reserve', 'Ledger'], idl: 'reserve ledger:w owner:s oracle reserve_auth vault:w dest:w mint token_program', args: [['amount', 'u64']],
		code: `pub fn borrow(ctx: Context<Borrow>, amount: u64) -> Result<()> {
	let (price, expo) = {
		let d = ctx.accounts.oracle.try_borrow_data()?;
		require!(d.len() >= 240 && u32_at(&d, 0)? == PYTH_MAGIC && u32_at(&d, 8)? == 3, GenError::BadOracle);
		let price = i64_at(&d, 208)?;
		#[cfg(not(feature = "v_oracle_no_status"))]
		require!(u32_at(&d, 224)? == 1, GenError::BadOracle);
		#[cfg(not(feature = "v_oracle_no_conf"))]
		require!((u64_at(&d, 216)? as u128) * 50 <= price.max(0) as u128, GenError::BadOracle);
		#[cfg(not(feature = "v_oracle_no_staleness"))]
		require!(Clock::get()?.unix_timestamp.saturating_sub(i64_at(&d, 96)?) <= MAX_AGE, GenError::Stale);
		(price, i32_at(&d, 20)?)
	};
	require!(price > 0 && (-12..=0).contains(&expo), GenError::BadOracle);
	{
		let l = &mut ctx.accounts.ledger;
		let value = (l.deposited as u128) * (price as u128) / 10u128.pow(expo.unsigned_abs());
		let owed = l.borrowed.checked_add(amount).ok_or(GenError::Math)?;
		require!((owed as u128) * 2 <= value, GenError::Limit);
		l.borrowed = owed;
	}
${SEEDS}
	xfer(&ctx.accounts.token_program, ctx.accounts.vault.to_account_info(), &ctx.accounts.mint, ctx.accounts.dest.to_account_info(), ctx.accounts.reserve_auth.to_account_info(), &[seeds], amount)
}`,
		accounts: `pub struct Borrow<'info> {
	#[account(has_one = vault, has_one = mint, has_one = oracle)]
	pub reserve: Account<'info, Reserve>,
	#[account(mut, has_one = owner, has_one = reserve)]
	pub ledger: Account<'info, Ledger>,
	pub owner: Signer<'info>,
	/// CHECK: the reserve's Pyth price account (stored key, Pyth-owned)
	#[account(owner = PYTH_PROGRAM)]
	pub oracle: UncheckedAccount<'info>,
${AUTH}
	#[account(mut)]
	pub vault: InterfaceAccount<'info, TokenAccount>,
	#[account(mut, token::mint = mint, token::authority = owner)]
	pub dest: InterfaceAccount<'info, TokenAccount>,
${TOKENS}
}`,
		variants: [
			{ id: 'oracle_no_status', rules: RULES.oracle },
			{ id: 'oracle_no_conf', rules: RULES.oracle },
			{ id: 'oracle_no_staleness', rules: RULES.oracle },
		],
	},
	{
		// the vault authority PDA signs a swap instruction of SWAP_PROGRAM for up to the caller's deposit
		name: 'route', types: ['Reserve', 'Ledger'], idl: 'reserve ledger owner:s reserve_auth vault:w swap_program', args: [['amount', 'u64']],
		code: `pub fn route(ctx: Context<Route>, amount: u64) -> Result<()> {
	require!(amount <= ctx.accounts.ledger.deposited, GenError::Limit);
${SEEDS}
	let ix = Instruction {
		program_id: ctx.accounts.swap_program.key(),
		accounts: vec![AccountMeta::new(ctx.accounts.vault.key(), false), AccountMeta::new_readonly(ctx.accounts.reserve_auth.key(), true)],
		data: amount.to_le_bytes().to_vec(),
	};
	invoke_signed(&ix, &[ctx.accounts.vault.to_account_info(), ctx.accounts.reserve_auth.to_account_info(), ctx.accounts.swap_program.to_account_info()], &[seeds])?;
	Ok(())
}`,
		accounts: `pub struct Route<'info> {
	#[account(has_one = vault)]
	pub reserve: Account<'info, Reserve>,
	#[account(has_one = owner, has_one = reserve)]
	pub ledger: Account<'info, Ledger>,
	pub owner: Signer<'info>,
${AUTH}
	#[account(mut)]
	pub vault: InterfaceAccount<'info, TokenAccount>,
	/// CHECK: SWAP_PROGRAM (v_signer_untrusted_pda: not checked)
	#[cfg_attr(not(feature = "v_signer_untrusted_pda"), account(address = SWAP_PROGRAM))]
	pub swap_program: UncheckedAccount<'info>,
}`,
		variants: [{ id: 'signer_untrusted_pda', rules: RULES.forward }],
	},
	{
		// the caller's signature is forwarded to SWAP_PROGRAM with its token account
		name: 'swap_user', types: [], idl: 'owner:s src:w swap_program', args: [['amount', 'u64']],
		code: `pub fn swap_user(ctx: Context<SwapUser>, amount: u64) -> Result<()> {
	let ix = Instruction {
		program_id: ctx.accounts.swap_program.key(),
		accounts: vec![AccountMeta::new(ctx.accounts.src.key(), false), AccountMeta::new_readonly(ctx.accounts.owner.key(), true)],
		data: amount.to_le_bytes().to_vec(),
	};
	invoke(&ix, &[ctx.accounts.src.to_account_info(), ctx.accounts.owner.to_account_info(), ctx.accounts.swap_program.to_account_info()])?;
	Ok(())
}`,
		accounts: `pub struct SwapUser<'info> {
	pub owner: Signer<'info>,
	#[account(mut, token::authority = owner)]
	pub src: InterfaceAccount<'info, TokenAccount>,
	/// CHECK: SWAP_PROGRAM (v_user_signer_untrusted: not checked)
	#[cfg_attr(not(feature = "v_user_signer_untrusted"), account(address = SWAP_PROGRAM))]
	pub swap_program: UncheckedAccount<'info>,
}`,
		variants: [{ id: 'user_signer_untrusted', rules: RULES.forward }],
	},
	{
		// informational: the reserve admin can move the whole vault to any token account of the mint (no finding expected)
		name: 'admin_sweep', types: ['Reserve'], idl: 'reserve admin:s reserve_auth vault:w dest:w mint token_program', args: [],
		fundMover: { authority: 'admin', from: 'vault' },
		code: `pub fn admin_sweep(ctx: Context<AdminSweep>) -> Result<()> {
	let all = ctx.accounts.vault.amount;
${SEEDS}
	xfer(&ctx.accounts.token_program, ctx.accounts.vault.to_account_info(), &ctx.accounts.mint, ctx.accounts.dest.to_account_info(), ctx.accounts.reserve_auth.to_account_info(), &[seeds], all)
}`,
		accounts: `pub struct AdminSweep<'info> {
	#[account(has_one = admin, has_one = vault, has_one = mint)]
	pub reserve: Account<'info, Reserve>,
	pub admin: Signer<'info>,
${AUTH}
	#[account(mut)]
	pub vault: InterfaceAccount<'info, TokenAccount>,
	#[account(mut, token::mint = mint)]
	pub dest: InterfaceAccount<'info, TokenAccount>,
${TOKENS}
}`,
		variants: [],
	},
]

// ---- native (solana-program 2.2.1) lending reserve: token CPIs built by hand (TransferChecked, SPL Token or Token-2022).
// reserve (program-owned): [0] tag 4, [1..33] admin, [33..65] vault, [65..97] oracle, [97..105] total assets,
// [105..113] total shares, [113..121] min liquidity, [121] auth bump, [122..154] mint.
// ledger (program-owned): [0] tag 5, [1..33] owner, [33..65] reserve, [65..73] shares, [73..81] deposited, [81..89] borrowed ----

export const riskNativeHeader = `use solana_program::{
	account_info::{next_account_info, AccountInfo}, clock::Clock, entrypoint, entrypoint::ProgramResult,
	instruction::{AccountMeta, Instruction}, program::{invoke, invoke_signed}, program_error::ProgramError, pubkey::Pubkey,
	sysvar::{self, Sysvar},
};

entrypoint!(process);

const RESERVE: u8 = 4;
const LEDGER: u8 = 5;
const TOKEN: Pubkey = Pubkey::new_from_array(${TOKEN});
const TOKEN_2022: Pubkey = Pubkey::new_from_array(${TOKEN_2022});
const PYTH_PROGRAM: Pubkey = Pubkey::new_from_array(${PYTH});
const SWAP_PROGRAM: Pubkey = Pubkey::new_from_array([7u8; 32]);
const BAD_IX: ProgramError = ProgramError::InvalidInstructionData;
const BAD_DATA: ProgramError = ProgramError::InvalidAccountData;

${readers('ProgramError')}
fn key_at(d: &[u8], o: usize) -> Pubkey { Pubkey::new_from_array(d[o..o + 32].try_into().unwrap()) }

struct Res { admin: Pubkey, vault: Pubkey, oracle: Pubkey, mint: Pubkey, assets: u64, shares: u64, min: u64, bump: u8 }

fn load_reserve(program_id: &Pubkey, reserve: &AccountInfo) -> Result<Res, ProgramError> {
	if reserve.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	let d = reserve.try_borrow_data()?;
	if d.len() < 154 || d[0] != RESERVE { return Err(BAD_DATA) }
	Ok(Res { admin: key_at(&d, 1), vault: key_at(&d, 33), oracle: key_at(&d, 65), assets: u64_at(&d, 97)?, shares: u64_at(&d, 105)?, min: u64_at(&d, 113)?, bump: d[121], mint: key_at(&d, 122) })
}

/** (shares, deposited, borrowed) of the owner's ledger of this reserve */
fn load_ledger(program_id: &Pubkey, ledger: &AccountInfo, owner: &AccountInfo, reserve: &AccountInfo) -> Result<(u64, u64, u64), ProgramError> {
	if !owner.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	if ledger.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	let d = ledger.try_borrow_data()?;
	if d.len() < 89 || d[0] != LEDGER || d[1..33] != owner.key.as_ref()[..] || d[33..65] != reserve.key.as_ref()[..] { return Err(BAD_DATA) }
	Ok((u64_at(&d, 65)?, u64_at(&d, 73)?, u64_at(&d, 81)?))
}

/** the reserve's vault and mint, an SPL Token / Token-2022 program; returns the mint decimals */
fn check_vault(r: &Res, vault: &AccountInfo, mint: &AccountInfo, token_program: &AccountInfo) -> Result<u8, ProgramError> {
	if *vault.key != r.vault || *mint.key != r.mint { return Err(BAD_DATA) }
	if *token_program.key != TOKEN && *token_program.key != TOKEN_2022 { return Err(ProgramError::IncorrectProgramId) }
	if mint.owner != token_program.key { return Err(ProgramError::IncorrectProgramId) }
	let d = mint.try_borrow_data()?;
	if d.len() < 82 { return Err(BAD_DATA) }
	Ok(d[44])
}

fn check_auth(program_id: &Pubkey, r: &Res, reserve: &AccountInfo, reserve_auth: &AccountInfo) -> ProgramResult {
	let auth = Pubkey::create_program_address(&[b"auth", reserve.key.as_ref(), &[r.bump]], program_id).map_err(|_| ProgramError::InvalidSeeds)?;
	if auth != *reserve_auth.key { return Err(ProgramError::InvalidSeeds) }
	Ok(())
}

/** a token account of the mint (and of \`owner\` when given) */
fn check_dest(dest: &AccountInfo, token_program: &AccountInfo, mint: &Pubkey, owner: Option<&Pubkey>) -> ProgramResult {
	if dest.owner != token_program.key { return Err(ProgramError::IncorrectProgramId) }
	let d = dest.try_borrow_data()?;
	if d.len() < 165 || key_at(&d, 0) != *mint { return Err(BAD_DATA) }
	if let Some(o) = owner { if key_at(&d, 32) != *o { return Err(BAD_DATA) } }
	Ok(())
}

fn token_amount(a: &AccountInfo) -> Result<u64, ProgramError> { u64_at(&a.try_borrow_data()?, 64) }

fn xfer<'a>(tp: &AccountInfo<'a>, from: &AccountInfo<'a>, mint: &AccountInfo<'a>, to: &AccountInfo<'a>, auth: &AccountInfo<'a>, amount: u64, decimals: u8, seeds: &[&[&[u8]]]) -> ProgramResult {
	let mut data = vec![12u8];
	data.extend_from_slice(&amount.to_le_bytes());
	data.push(decimals);
	let ix = Instruction {
		program_id: *tp.key,
		accounts: vec![AccountMeta::new(*from.key, false), AccountMeta::new_readonly(*mint.key, false), AccountMeta::new(*to.key, false), AccountMeta::new_readonly(*auth.key, true)],
		data,
	};
	invoke_signed(&ix, &[from.clone(), mint.clone(), to.clone(), auth.clone(), tp.clone()], seeds)
}
`

const acc = (names: string) => names.split(' ').map(n => `\tlet ${n} = next_account_info(it)?;`).join('\n')

export const riskNativeUnits: Unit[] = [
	{
		name: 'flash_borrow', tag: 0, idl: '', args: [],
		code: `// accounts: reserve, reserve_auth, vault (w), dest (w, borrower's), mint, borrower (s), instructions sysvar, token_program;
// data: amount u64, repay_index u16. The next instruction must be this program's flash_repay (tag 1) of this reserve and amount.
fn flash_borrow(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let amount = u64_at(data, 1)?;
	let repay_index = rd16(data, 9)?;
	let it = &mut accounts.iter();
${acc('reserve reserve_auth vault dest mint borrower ixs token_program')}
	if !borrower.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	let r = load_reserve(program_id, reserve)?;
	let decimals = check_vault(&r, vault, mint, token_program)?;
	check_auth(program_id, &r, reserve, reserve_auth)?;
	check_dest(dest, token_program, &r.mint, Some(borrower.key))?;
	#[cfg(not(feature = "v_ix_sysvar_unchecked"))]
	if *ixs.key != sysvar::instructions::ID { return Err(ProgramError::UnsupportedSysvar) }
	{
		let d = ixs.try_borrow_data()?;
		let current = ix_current(&d)?;
		#[cfg(not(feature = "v_ix_absolute_index"))]
		let at = {
			let _ = repay_index;
			current + 1
		};
		#[cfg(feature = "v_ix_absolute_index")]
		let at = {
			let _ = current;
			repay_index
		};
		let (program, keys, ix) = ix_at(&d, at)?;
		#[cfg(not(feature = "v_ix_program_unchecked"))]
		if program != *program_id { return Err(ProgramError::IncorrectProgramId) }
		let _ = program;
		if ix.first() != Some(&1) { return Err(BAD_IX) }
		#[cfg(not(feature = "v_ix_repay_unbound"))]
		if keys.first() != Some(reserve.key) || u64_at(ix, 1)? != amount { return Err(BAD_IX) }
		let _ = keys;
	}
	xfer(token_program, vault, mint, dest, reserve_auth, amount, decimals, &[&[b"auth", reserve.key.as_ref(), &[r.bump]]])
}`,
		variants: [
			{ id: 'ix_sysvar_unchecked', rules: RULES.intro },
			{ id: 'ix_program_unchecked', rules: RULES.introProg },
			{ id: 'ix_absolute_index', rules: RULES.introIndex },
			{ id: 'ix_repay_unbound', rules: RULES.repay },
		],
	},
	{
		name: 'flash_repay', tag: 1, idl: '', args: [],
		code: `// accounts: reserve, vault (w), src (w), mint, payer (s), token_program; data: amount u64
fn flash_repay(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let amount = u64_at(data, 1)?;
	let it = &mut accounts.iter();
${acc('reserve vault src mint payer token_program')}
	if !payer.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	let r = load_reserve(program_id, reserve)?;
	let decimals = check_vault(&r, vault, mint, token_program)?;
	xfer(token_program, src, mint, vault, payer, amount, decimals, &[])
}`,
		variants: [],
	},
	{
		name: 'deposit', tag: 2, idl: '', args: [],
		code: `// accounts: reserve (w), ledger (w), owner (s), src (w), vault (w), mint, token_program; data: amount u64.
// Credits what the vault received (Token-2022 transfer fee); shares minted rounded down.
fn deposit(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let amount = u64_at(data, 1)?;
	let it = &mut accounts.iter();
${acc('reserve ledger owner src vault mint token_program')}
	let r = load_reserve(program_id, reserve)?;
	let (shares0, deposited, _) = load_ledger(program_id, ledger, owner, reserve)?;
	let decimals = check_vault(&r, vault, mint, token_program)?;
	let before = token_amount(vault)?;
	xfer(token_program, src, mint, vault, owner, amount, decimals, &[])?;
	#[cfg(not(feature = "v_nominal_amount"))]
	let received = token_amount(vault)?.checked_sub(before).ok_or(ProgramError::ArithmeticOverflow)?;
	#[cfg(feature = "v_nominal_amount")]
	let received = {
		let _ = before;
		amount
	};
	let shares = if r.shares == 0 || r.assets == 0 {
		received
	} else {
		let num = (received as u128) * (r.shares as u128);
		#[cfg(not(feature = "v_round_mint_ceil"))]
		let s = num / (r.assets as u128);
		#[cfg(feature = "v_round_mint_ceil")]
		let s = (num + r.assets as u128 - 1) / (r.assets as u128);
		u64::try_from(s).map_err(|_| ProgramError::ArithmeticOverflow)?
	};
	if shares == 0 { return Err(ProgramError::InsufficientFunds) }
	{
		let mut d = reserve.try_borrow_mut_data()?;
		d[97..105].copy_from_slice(&r.assets.checked_add(received).ok_or(ProgramError::ArithmeticOverflow)?.to_le_bytes());
		d[105..113].copy_from_slice(&r.shares.checked_add(shares).ok_or(ProgramError::ArithmeticOverflow)?.to_le_bytes());
	}
	let mut d = ledger.try_borrow_mut_data()?;
	d[65..73].copy_from_slice(&shares0.checked_add(shares).ok_or(ProgramError::ArithmeticOverflow)?.to_le_bytes());
	d[73..81].copy_from_slice(&deposited.checked_add(received).ok_or(ProgramError::ArithmeticOverflow)?.to_le_bytes());
	Ok(())
}`,
		variants: [
			{ id: 'nominal_amount', rules: RULES.t22 },
			{ id: 'round_mint_ceil', rules: RULES.round },
		],
	},
	{
		name: 'withdraw', tag: 3, idl: '', args: [],
		code: `// accounts: reserve (w), ledger (w), owner (s), reserve_auth, vault (w), dest (w, owner's), mint, token_program; data: assets u64.
// Shares burned rounded up; the liquidity floor is checked on the vault balance read after the transfer.
fn withdraw(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let assets = u64_at(data, 1)?;
	let it = &mut accounts.iter();
${acc('reserve ledger owner reserve_auth vault dest mint token_program')}
	let r = load_reserve(program_id, reserve)?;
	let (shares0, deposited, borrowed) = load_ledger(program_id, ledger, owner, reserve)?;
	let decimals = check_vault(&r, vault, mint, token_program)?;
	check_auth(program_id, &r, reserve, reserve_auth)?;
	check_dest(dest, token_program, &r.mint, Some(owner.key))?;
	if r.assets == 0 || r.shares == 0 || borrowed != 0 { return Err(BAD_DATA) }
	let num = (assets as u128) * (r.shares as u128);
	#[cfg(not(feature = "v_round_burn_floor"))]
	let burn = (num + r.assets as u128 - 1) / (r.assets as u128);
	#[cfg(feature = "v_round_burn_floor")]
	let burn = num / (r.assets as u128);
	let burn = u64::try_from(burn).map_err(|_| ProgramError::ArithmeticOverflow)?;
	{
		let mut d = reserve.try_borrow_mut_data()?;
		d[97..105].copy_from_slice(&r.assets.checked_sub(assets).ok_or(ProgramError::InsufficientFunds)?.to_le_bytes());
		d[105..113].copy_from_slice(&r.shares.checked_sub(burn).ok_or(ProgramError::InsufficientFunds)?.to_le_bytes());
		let mut l = ledger.try_borrow_mut_data()?;
		l[65..73].copy_from_slice(&shares0.checked_sub(burn).ok_or(ProgramError::InsufficientFunds)?.to_le_bytes());
		l[73..81].copy_from_slice(&deposited.saturating_sub(assets).to_le_bytes());
	}
	let before = token_amount(vault)?;
	xfer(token_program, vault, mint, dest, reserve_auth, assets, decimals, &[&[b"auth", reserve.key.as_ref(), &[r.bump]]])?;
	#[cfg(not(feature = "v_stale_copy"))]
	let left = {
		let _ = before;
		token_amount(vault)?
	};
	#[cfg(feature = "v_stale_copy")]
	let left = before;
	if left < r.min { return Err(ProgramError::InsufficientFunds) }
	Ok(())
}`,
		variants: [
			{ id: 'round_burn_floor', rules: RULES.round },
			{ id: 'stale_copy', rules: RULES.stale },
		],
	},
	{
		name: 'borrow', tag: 4, idl: '', args: [],
		code: `// accounts: reserve, ledger (w), owner (s), oracle (the reserve's Pyth price account), reserve_auth, vault (w), dest (w, owner's), mint,
// token_program; data: amount u64. Price: status trading, confidence <= 2 %, published within MAX_AGE s.
fn borrow(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let amount = u64_at(data, 1)?;
	let it = &mut accounts.iter();
${acc('reserve ledger owner oracle reserve_auth vault dest mint token_program')}
	let r = load_reserve(program_id, reserve)?;
	let (_, deposited, borrowed) = load_ledger(program_id, ledger, owner, reserve)?;
	let decimals = check_vault(&r, vault, mint, token_program)?;
	check_auth(program_id, &r, reserve, reserve_auth)?;
	check_dest(dest, token_program, &r.mint, Some(owner.key))?;
	if *oracle.key != r.oracle || *oracle.owner != PYTH_PROGRAM { return Err(BAD_DATA) }
	let (price, expo) = {
		let d = oracle.try_borrow_data()?;
		if d.len() < 240 || u32_at(&d, 0)? != PYTH_MAGIC || u32_at(&d, 8)? != 3 { return Err(BAD_DATA) }
		let price = i64_at(&d, 208)?;
		#[cfg(not(feature = "v_oracle_no_status"))]
		if u32_at(&d, 224)? != 1 { return Err(BAD_DATA) }
		#[cfg(not(feature = "v_oracle_no_conf"))]
		if (u64_at(&d, 216)? as u128) * 50 > price.max(0) as u128 { return Err(BAD_DATA) }
		#[cfg(not(feature = "v_oracle_no_staleness"))]
		if Clock::get()?.unix_timestamp.saturating_sub(i64_at(&d, 96)?) > MAX_AGE { return Err(BAD_DATA) }
		(price, i32_at(&d, 20)?)
	};
	if price <= 0 || !(-12..=0).contains(&expo) { return Err(BAD_DATA) }
	let value = (deposited as u128) * (price as u128) / 10u128.pow(expo.unsigned_abs());
	let owed = borrowed.checked_add(amount).ok_or(ProgramError::ArithmeticOverflow)?;
	if (owed as u128) * 2 > value { return Err(ProgramError::InsufficientFunds) }
	ledger.try_borrow_mut_data()?[81..89].copy_from_slice(&owed.to_le_bytes());
	xfer(token_program, vault, mint, dest, reserve_auth, amount, decimals, &[&[b"auth", reserve.key.as_ref(), &[r.bump]]])
}`,
		variants: [
			{ id: 'oracle_no_status', rules: RULES.oracle },
			{ id: 'oracle_no_conf', rules: RULES.oracle },
			{ id: 'oracle_no_staleness', rules: RULES.oracle },
		],
	},
	{
		name: 'route', tag: 5, idl: '', args: [],
		code: `// accounts: reserve, ledger, owner (s), reserve_auth, vault (w), swap_program; data: amount u64.
// The vault authority PDA signs a swap instruction of SWAP_PROGRAM for up to the caller's deposit.
fn route(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let amount = u64_at(data, 1)?;
	let it = &mut accounts.iter();
${acc('reserve ledger owner reserve_auth vault swap_program')}
	let r = load_reserve(program_id, reserve)?;
	let (_, deposited, _) = load_ledger(program_id, ledger, owner, reserve)?;
	check_auth(program_id, &r, reserve, reserve_auth)?;
	if *vault.key != r.vault || amount > deposited { return Err(BAD_DATA) }
	#[cfg(not(feature = "v_signer_untrusted_pda"))]
	if *swap_program.key != SWAP_PROGRAM { return Err(ProgramError::IncorrectProgramId) }
	let ix = Instruction {
		program_id: *swap_program.key,
		accounts: vec![AccountMeta::new(*vault.key, false), AccountMeta::new_readonly(*reserve_auth.key, true)],
		data: amount.to_le_bytes().to_vec(),
	};
	invoke_signed(&ix, &[vault.clone(), reserve_auth.clone(), swap_program.clone()], &[&[b"auth", reserve.key.as_ref(), &[r.bump]]])
}`,
		variants: [{ id: 'signer_untrusted_pda', rules: RULES.forward }],
	},
	{
		name: 'swap_user', tag: 6, idl: '', args: [],
		code: `// accounts: owner (s), src (w), swap_program; data: amount u64. The caller's signature is forwarded to SWAP_PROGRAM.
fn swap_user(_program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let amount = u64_at(data, 1)?;
	let it = &mut accounts.iter();
${acc('owner src swap_program')}
	if !owner.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	#[cfg(not(feature = "v_user_signer_untrusted"))]
	if *swap_program.key != SWAP_PROGRAM { return Err(ProgramError::IncorrectProgramId) }
	let ix = Instruction {
		program_id: *swap_program.key,
		accounts: vec![AccountMeta::new(*src.key, false), AccountMeta::new_readonly(*owner.key, true)],
		data: amount.to_le_bytes().to_vec(),
	};
	invoke(&ix, &[src.clone(), owner.clone(), swap_program.clone()])
}`,
		variants: [{ id: 'user_signer_untrusted', rules: RULES.forward }],
	},
	{
		name: 'admin_sweep', tag: 7, idl: '', args: [],
		fundMover: { authority: 'admin', from: 'vault', index: 1 },
		code: `// accounts: reserve, admin (s), reserve_auth, vault (w), dest (w, any token account of the mint), mint, token_program.
// Informational: the reserve admin can move the whole vault anywhere (no finding expected).
fn admin_sweep(program_id: &Pubkey, accounts: &[AccountInfo], _data: &[u8]) -> ProgramResult {
	let it = &mut accounts.iter();
${acc('reserve admin reserve_auth vault dest mint token_program')}
	if !admin.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	let r = load_reserve(program_id, reserve)?;
	if *admin.key != r.admin { return Err(BAD_DATA) }
	let decimals = check_vault(&r, vault, mint, token_program)?;
	check_auth(program_id, &r, reserve, reserve_auth)?;
	check_dest(dest, token_program, &r.mint, None)?;
	let all = token_amount(vault)?;
	xfer(token_program, vault, mint, dest, reserve_auth, all, decimals, &[&[b"auth", reserve.key.as_ref(), &[r.bump]]])
}`,
		variants: [],
	},
]
