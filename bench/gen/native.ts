// solana-program 2.2.1 and pinocchio 0.8.4 instruction templates: one `fn` per instruction, dispatched on the first
// instruction-data byte (the unit's tag); each variant (cargo feature v_<id>) removes exactly one property.
import type { Unit } from './gen.ts'

// ---- native bank: bank (program-owned): [0] tag (0 uninitialized, 1 bank), [1..33] authority, [33..41] balance,
// [41..49] limit, [49..51] fee, [51] paused, [52..60] last slot ----

export const bankHeader = `use solana_program::{
	account_info::{next_account_info, AccountInfo}, clock::Clock, entrypoint, entrypoint::ProgramResult, program_error::ProgramError,
	pubkey::Pubkey, sysvar::Sysvar,
};

entrypoint!(process);

const BANK: u8 = 1;

fn u64_at(d: &[u8], o: usize) -> Result<u64, ProgramError> {
	Ok(u64::from_le_bytes(d.get(o..o + 8).ok_or(ProgramError::InvalidInstructionData)?.try_into().unwrap()))
}
`

/** signer / owner / tag / stored authority checks of a bank instruction, each removable by its feature */
const bankChecks = (feat: { signer?: string; owner?: string; tag?: string; key?: string }) => `	${feat.signer ? `#[cfg(not(feature = "v_${feat.signer}"))]\n\t` : ''}if !authority.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	${feat.owner ? `#[cfg(not(feature = "v_${feat.owner}"))]\n\t` : ''}if bank.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	let _ = program_id;
	let mut d = bank.try_borrow_mut_data()?;
	if d.len() < 60 { return Err(ProgramError::AccountDataTooSmall) }
	${feat.tag ? `#[cfg(not(feature = "v_${feat.tag}"))]\n\t` : ''}if d[0] != BANK { return Err(ProgramError::InvalidAccountData) }
	${feat.key ? `#[cfg(not(feature = "v_${feat.key}"))]\n\t` : ''}if d[1..33] != authority.key.as_ref()[..] { return Err(ProgramError::InvalidAccountData) }`

const two = `	let it = &mut accounts.iter();
	let authority = next_account_info(it)?;
	let bank = next_account_info(it)?;`

const setter = (name: string, tag: number, range: string, arg: string, inconsistent: boolean): Unit => ({
	name, tag, idl: 'authority:s bank:w', args: [],
	code: `// accounts: authority (signer), bank (writable)
fn ${name}(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
${two}
${bankChecks(inconsistent ? { owner: 'inconsistent' } : {})}
	d[${range}].copy_from_slice(${arg});
	Ok(())
}`,
	variants: inconsistent ? [{ id: 'inconsistent', rules: ['~consistency', 'unverified-account-data'] }] : [],
})

export const bankUnits: Unit[] = [
	{
		name: 'init', tag: 0, idl: '', args: [],
		code: `// accounts: authority (signer), bank (writable, program-owned, allocated by the client)
fn init(program_id: &Pubkey, accounts: &[AccountInfo], _data: &[u8]) -> ProgramResult {
${two}
	if !authority.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	if bank.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	let mut d = bank.try_borrow_mut_data()?;
	if d.len() < 60 { return Err(ProgramError::AccountDataTooSmall) }
	#[cfg(not(feature = "v_reinit_unchecked"))]
	if d[0] != 0 { return Err(ProgramError::AccountAlreadyInitialized) }
	d[0] = BANK;
	d[1..33].copy_from_slice(authority.key.as_ref());
	d[33..60].fill(0);
	Ok(())
}`,
		variants: [{ id: 'reinit_unchecked', rules: ['reinit-unchecked'] }],
	},
	{
		name: 'withdraw', tag: 1, idl: '', args: [],
		code: `// accounts: authority (signer, writable), bank (writable); data: amount u64
fn withdraw(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let amount = u64_at(data, 1)?;
${two}
	{
${bankChecks({ signer: 'no_signer', owner: 'no_owner', tag: 'no_tag', key: 'no_key' }).replace(/^/gm, '\t')}
		let bal = u64_at(&d, 33)?;
		#[cfg(not(feature = "v_wrapping_sub"))]
		let bal = bal.checked_sub(amount).ok_or(ProgramError::InsufficientFunds)?;
		#[cfg(feature = "v_wrapping_sub")]
		let bal = bal.wrapping_sub(amount);
		d[33..41].copy_from_slice(&bal.to_le_bytes());
	}
	let from = bank.lamports().checked_sub(amount).ok_or(ProgramError::InsufficientFunds)?;
	let to = authority.lamports().checked_add(amount).ok_or(ProgramError::ArithmeticOverflow)?;
	**bank.try_borrow_mut_lamports()? = from;
	**authority.try_borrow_mut_lamports()? = to;
	Ok(())
}`,
		variants: [
			{ id: 'no_signer', rules: ['value-move-no-signer', 'state-write-ungated'] },
			{ id: 'no_owner', rules: ['unverified-account-data'] },
			{ id: 'no_tag', rules: ['account-type-unchecked', 'unverified-account-data'] },
			{ id: 'no_key', rules: ['signer-not-related-to-authority'] },
			{ id: 'wrapping_sub', rules: ['unchecked-arithmetic'] },
		],
	},
	{
		name: 'close', tag: 2, idl: '', args: [],
		code: `// accounts: authority (signer, writable), bank (writable)
fn close(program_id: &Pubkey, accounts: &[AccountInfo], _data: &[u8]) -> ProgramResult {
${two}
	{
${bankChecks({}).replace(/^/gm, '\t')}
		#[cfg(not(feature = "v_close_no_zero"))]
		d.fill(0);
	}
	let n = bank.lamports();
	let to = authority.lamports().checked_add(n).ok_or(ProgramError::ArithmeticOverflow)?;
	**bank.try_borrow_mut_lamports()? = 0;
	**authority.try_borrow_mut_lamports()? = to;
	Ok(())
}`,
		variants: [{ id: 'close_no_zero', rules: ['close-without-zeroing'] }],
	},
	{
		name: 'settle', tag: 3, idl: '', args: [],
		code: `// accounts: authority (signer), bank (writable), clock sysvar
fn settle(program_id: &Pubkey, accounts: &[AccountInfo], _data: &[u8]) -> ProgramResult {
${two}
	let clock = next_account_info(it)?;
${bankChecks({})}
	#[cfg(not(feature = "v_sysvar_unchecked"))]
	let slot = Clock::from_account_info(clock)?.slot;
	#[cfg(feature = "v_sysvar_unchecked")]
	let slot = u64_at(&clock.try_borrow_data()?, 0)?;
	d[52..60].copy_from_slice(&slot.to_le_bytes());
	Ok(())
}`,
		variants: [{ id: 'sysvar_unchecked', rules: ['sysvar-account-unchecked'] }],
	},
	setter('set_limit', 4, '41..49', 'data.get(1..9).ok_or(ProgramError::InvalidInstructionData)?', false),
	setter('set_fee', 5, '49..51', 'data.get(1..3).ok_or(ProgramError::InvalidInstructionData)?', true),
	setter('set_paused', 6, '51..52', 'data.get(1..2).ok_or(ProgramError::InvalidInstructionData)?', false),
	{
		name: 'move_balance', tag: 7, idl: '', args: [],
		code: `// accounts: authority (signer), from (writable), to (writable); data: amount u64 (bookkeeping between two banks of one authority)
fn move_balance(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let amount = u64_at(data, 1)?;
	let it = &mut accounts.iter();
	let authority = next_account_info(it)?;
	let from = next_account_info(it)?;
	let to = next_account_info(it)?;
	if !authority.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	if from.owner != program_id || to.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	#[cfg(not(feature = "v_dup_mut"))]
	if from.key == to.key { return Err(ProgramError::InvalidArgument) }
	let fb = {
		let d = from.try_borrow_data()?;
		if d.len() < 60 || d[0] != BANK || d[1..33] != authority.key.as_ref()[..] { return Err(ProgramError::InvalidAccountData) }
		u64_at(&d, 33)?.checked_sub(amount).ok_or(ProgramError::InsufficientFunds)?
	};
	let tb = {
		let d = to.try_borrow_data()?;
		if d.len() < 60 || d[0] != BANK || d[1..33] != authority.key.as_ref()[..] { return Err(ProgramError::InvalidAccountData) }
		u64_at(&d, 33)?.checked_add(amount).ok_or(ProgramError::ArithmeticOverflow)?
	};
	from.try_borrow_mut_data()?[33..41].copy_from_slice(&fb.to_le_bytes());
	to.try_borrow_mut_data()?[33..41].copy_from_slice(&tb.to_le_bytes());
	Ok(())
}`,
		variants: [{ id: 'dup_mut', rules: ['duplicate-mutable-accounts'] }],
	},
]

// ---- native amm (spl-token): pool (program-owned): [0] tag 2, [1..33] admin, [33..65] mint, [65..97] vault token account,
// [97..105] reserve, [105..113] supply, [113] authority bump (PDA ["auth", pool]) ----

export const ammHeader = `use solana_program::{
	account_info::{next_account_info, AccountInfo}, entrypoint, entrypoint::ProgramResult, program::{invoke, invoke_signed},
	program_error::ProgramError, program_pack::Pack, pubkey::Pubkey,
};

entrypoint!(process);

const POOL: u8 = 2;

fn u64_at(d: &[u8], o: usize) -> Result<u64, ProgramError> {
	Ok(u64::from_le_bytes(d.get(o..o + 8).ok_or(ProgramError::InvalidInstructionData)?.try_into().unwrap()))
}
`

export const ammUnits: Unit[] = [
	{
		name: 'deposit', tag: 0, idl: '', args: [],
		code: `// accounts: user (signer), pool (writable), user_token (writable), vault (writable), token_program; data: amount u64
fn deposit(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let amount = u64_at(data, 1)?;
	let it = &mut accounts.iter();
	let user = next_account_info(it)?;
	let pool = next_account_info(it)?;
	let user_token = next_account_info(it)?;
	let vault = next_account_info(it)?;
	let token_program = next_account_info(it)?;
	if !user.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	if pool.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	if *token_program.key != spl_token::ID { return Err(ProgramError::IncorrectProgramId) }
	let (reserve, supply) = {
		let d = pool.try_borrow_data()?;
		if d.len() < 114 || d[0] != POOL { return Err(ProgramError::InvalidAccountData) }
		if d[65..97] != vault.key.as_ref()[..] { return Err(ProgramError::InvalidAccountData) }
		(u64_at(&d, 97)?, u64_at(&d, 105)?)
	};
	#[cfg(not(feature = "v_div_zero"))]
	let shares = if supply == 0 || reserve == 0 { amount } else { ((amount as u128) * (supply as u128) / (reserve as u128)) as u64 };
	#[cfg(feature = "v_div_zero")]
	let shares = ((amount as u128) * (supply as u128) / (reserve as u128)) as u64;
	invoke(
		&spl_token::instruction::transfer(token_program.key, user_token.key, vault.key, user.key, &[], amount)?,
		&[user_token.clone(), vault.clone(), user.clone(), token_program.clone()],
	)?;
	let mut d = pool.try_borrow_mut_data()?;
	d[97..105].copy_from_slice(&reserve.checked_add(amount).ok_or(ProgramError::ArithmeticOverflow)?.to_le_bytes());
	d[105..113].copy_from_slice(&supply.checked_add(shares).ok_or(ProgramError::ArithmeticOverflow)?.to_le_bytes());
	Ok(())
}`,
		variants: [{ id: 'div_zero', rules: ['share-price-zero-supply'] }],
	},
	{
		name: 'payout', tag: 1, idl: '', args: [],
		code: `// accounts: admin (signer), pool (writable), vault (writable), dest (writable token account of the admin), pool_auth, token_program;
// data: amount u64, bump u8 (unused unless v_bump_from_ix)
fn payout(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let amount = u64_at(data, 1)?;
	let it = &mut accounts.iter();
	let admin = next_account_info(it)?;
	let pool = next_account_info(it)?;
	let vault = next_account_info(it)?;
	let dest = next_account_info(it)?;
	let pool_auth = next_account_info(it)?;
	let token_program = next_account_info(it)?;
	if !admin.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	if pool.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	#[cfg(not(feature = "v_cpi_unchecked"))]
	if *token_program.key != spl_token::ID { return Err(ProgramError::IncorrectProgramId) }
	let (reserve, stored_bump, mint) = {
		let d = pool.try_borrow_data()?;
		if d.len() < 114 || d[0] != POOL { return Err(ProgramError::InvalidAccountData) }
		if d[1..33] != admin.key.as_ref()[..] || d[65..97] != vault.key.as_ref()[..] { return Err(ProgramError::InvalidAccountData) }
		(u64_at(&d, 97)?, d[113], Pubkey::new_from_array(d[33..65].try_into().unwrap()))
	};
	#[cfg(not(feature = "v_bump_from_ix"))]
	let bump = stored_bump;
	#[cfg(feature = "v_bump_from_ix")]
	let bump = { let _ = stored_bump; *data.get(9).ok_or(ProgramError::InvalidInstructionData)? };
	let auth = Pubkey::create_program_address(&[b"auth", pool.key.as_ref(), &[bump]], program_id).map_err(|_| ProgramError::InvalidSeeds)?;
	if auth != *pool_auth.key { return Err(ProgramError::InvalidSeeds) }
	#[cfg(not(feature = "v_recipient_unbound"))]
	{
		if dest.owner != &spl_token::ID { return Err(ProgramError::IncorrectProgramId) }
		let t = spl_token::state::Account::unpack(&dest.try_borrow_data()?)?;
		if t.owner != *admin.key || t.mint != mint { return Err(ProgramError::InvalidAccountData) }
	}
	let _ = mint;
	invoke_signed(
		&spl_token::instruction::transfer(token_program.key, vault.key, dest.key, pool_auth.key, &[], amount)?,
		&[vault.clone(), dest.clone(), pool_auth.clone(), token_program.clone()],
		&[&[b"auth", pool.key.as_ref(), &[bump]]],
	)?;
	pool.try_borrow_mut_data()?[97..105].copy_from_slice(&reserve.checked_sub(amount).ok_or(ProgramError::InsufficientFunds)?.to_le_bytes());
	Ok(())
}`,
		variants: [
			{ id: 'cpi_unchecked', rules: ['cpi-unchecked-program'] },
			{ id: 'bump_from_ix', rules: ['pda-bump-from-ix'] },
			{ id: 'recipient_unbound', rules: ['recipient-unbound', 'token-mint-unrelated'] },
		],
	},
]

// ---- pinocchio jar: jar (program-owned): [0] tag (0 uninitialized, 1 jar), [1..33] admin, [33..41] share supply ----

export const jarHeader = `use pinocchio::{account_info::AccountInfo, entrypoint, program_error::ProgramError, pubkey::Pubkey, ProgramResult};

entrypoint!(process);

fn u64_at(d: &[u8], o: usize) -> Result<u64, ProgramError> {
	Ok(u64::from_le_bytes(d.get(o..o + 8).ok_or(ProgramError::InvalidInstructionData)?.try_into().unwrap()))
}
`

export const jarUnits: Unit[] = [
	{
		name: 'init', tag: 0, idl: '', args: [],
		code: `// accounts: admin (signer), jar (writable, program-owned); data: share supply u64
fn init(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let [admin, jar, ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	if !admin.is_signer() { return Err(ProgramError::MissingRequiredSignature) }
	if !jar.is_owned_by(program_id) { return Err(ProgramError::IncorrectProgramId) }
	let supply = u64_at(data, 1)?;
	let mut d = jar.try_borrow_mut_data()?;
	if d.len() < 41 { return Err(ProgramError::AccountDataTooSmall) }
	#[cfg(not(feature = "v_reinit_unchecked"))]
	if d[0] != 0 { return Err(ProgramError::AccountAlreadyInitialized) }
	d[0] = 1;
	d[1..33].copy_from_slice(admin.key());
	d[33..41].copy_from_slice(&supply.to_le_bytes());
	Ok(())
}`,
		variants: [{ id: 'reinit_unchecked', rules: ['reinit-unchecked'] }],
	},
	{
		name: 'withdraw', tag: 1, idl: '', args: [],
		code: `// accounts: admin (signer, writable), jar (writable); data: lamports u64
fn withdraw(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let [admin, jar, ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	let lamports = u64_at(data, 1)?;
	#[cfg(not(feature = "v_no_signer"))]
	if !admin.is_signer() { return Err(ProgramError::MissingRequiredSignature) }
	#[cfg(not(feature = "v_no_owner"))]
	if !jar.is_owned_by(program_id) { return Err(ProgramError::IncorrectProgramId) }
	let _ = program_id;
	{
		let d = jar.try_borrow_data()?;
		if d.len() < 41 || d[0] != 1 { return Err(ProgramError::InvalidAccountData) }
		#[cfg(not(feature = "v_no_key"))]
		if d[1..33] != admin.key()[..] { return Err(ProgramError::InvalidAccountData) }
	}
	#[cfg(not(feature = "v_wrapping_sub"))]
	let from = jar.lamports().checked_sub(lamports).ok_or(ProgramError::InsufficientFunds)?;
	#[cfg(feature = "v_wrapping_sub")]
	let from = jar.lamports().wrapping_sub(lamports);
	let to = admin.lamports().checked_add(lamports).ok_or(ProgramError::ArithmeticOverflow)?;
	*jar.try_borrow_mut_lamports()? = from;
	*admin.try_borrow_mut_lamports()? = to;
	Ok(())
}`,
		variants: [
			{ id: 'no_signer', rules: ['value-move-no-signer', 'state-write-ungated'] },
			{ id: 'no_owner', rules: ['unverified-account-data'] },
			{ id: 'no_key', rules: ['signer-not-related-to-authority'] },
			{ id: 'wrapping_sub', rules: ['unchecked-arithmetic'] },
		],
	},
	{
		name: 'close', tag: 2, idl: '', args: [],
		code: `// accounts: admin (signer, writable), jar (writable)
fn close(program_id: &Pubkey, accounts: &[AccountInfo], _data: &[u8]) -> ProgramResult {
	let [admin, jar, ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	if !admin.is_signer() { return Err(ProgramError::MissingRequiredSignature) }
	if !jar.is_owned_by(program_id) { return Err(ProgramError::IncorrectProgramId) }
	{
		let mut d = jar.try_borrow_mut_data()?;
		if d.len() < 41 || d[0] != 1 || d[1..33] != admin.key()[..] { return Err(ProgramError::InvalidAccountData) }
		#[cfg(not(feature = "v_close_no_zero"))]
		d.fill(0);
	}
	let to = admin.lamports().checked_add(jar.lamports()).ok_or(ProgramError::ArithmeticOverflow)?;
	*jar.try_borrow_mut_lamports()? = 0;
	*admin.try_borrow_mut_lamports()? = to;
	Ok(())
}`,
		variants: [{ id: 'close_no_zero', rules: ['close-without-zeroing'] }],
	},
	{
		name: 'redeem', tag: 3, idl: '', args: [],
		code: `// accounts: admin (signer, writable), jar (writable); data: shares u64 (lamports out = shares * jar lamports / supply)
fn redeem(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let [admin, jar, ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	let shares = u64_at(data, 1)?;
	if !admin.is_signer() { return Err(ProgramError::MissingRequiredSignature) }
	if !jar.is_owned_by(program_id) { return Err(ProgramError::IncorrectProgramId) }
	let out = {
		let mut d = jar.try_borrow_mut_data()?;
		if d.len() < 41 || d[0] != 1 || d[1..33] != admin.key()[..] { return Err(ProgramError::InvalidAccountData) }
		let supply = u64_at(&d, 33)?;
		#[cfg(not(feature = "v_div_zero"))]
		if supply == 0 { return Err(ProgramError::InvalidAccountData) }
		let out = ((shares as u128) * (jar.lamports() as u128) / (supply as u128)) as u64;
		d[33..41].copy_from_slice(&supply.checked_sub(shares).ok_or(ProgramError::InsufficientFunds)?.to_le_bytes());
		out
	};
	let from = jar.lamports().checked_sub(out).ok_or(ProgramError::InsufficientFunds)?;
	let to = admin.lamports().checked_add(out).ok_or(ProgramError::ArithmeticOverflow)?;
	*jar.try_borrow_mut_lamports()? = from;
	*admin.try_borrow_mut_lamports()? = to;
	Ok(())
}`,
		variants: [{ id: 'div_zero', rules: ['share-price-zero-supply'] }],
	},
]
