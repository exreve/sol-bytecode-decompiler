//! Native (solana-program) and pinocchio instruction templates.
//! Each unit is one instruction, clean as written; each variant (cargo feature v_<id>) removes exactly one
//! property. See bench/README.md (Generated programs).

use super::*;

pub const AMM_HEADER: &str = r"use solana_program::{
	account_info::{next_account_info, AccountInfo}, entrypoint, entrypoint::ProgramResult, program::{invoke, invoke_signed},
	program_error::ProgramError, program_pack::Pack, pubkey::Pubkey,
};

entrypoint!(process);

const POOL: u8 = 2;

fn u64_at(d: &[u8], o: usize) -> Result<u64, ProgramError> {
	Ok(u64::from_le_bytes(d.get(o..o + 8).ok_or(ProgramError::InvalidInstructionData)?.try_into().unwrap()))
}
";

pub const AMM_UNITS: &[Unit] = &[
	Unit {
		name: "deposit",
		tag: Some(0),
		types: None,
		idl: "",
		args: &[],
		fund_mover: None,
		variants: &[
			Variant { id: "div_zero", rules: &["share-price-zero-supply"], idl: None, not_exploitable: None },
		],
		code: r#"// accounts: user (signer), pool (writable), user_token (writable), vault (writable), token_program; data: amount u64
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
}"#,
		accounts: None,
	},
	Unit {
		name: "payout",
		tag: Some(1),
		types: None,
		idl: "",
		args: &[],
		fund_mover: None,
		variants: &[
			Variant { id: "cpi_unchecked", rules: &["cpi-unchecked-program"], idl: None, not_exploitable: Some("spl_token::instruction::transfer(token_program.key, ..) rejects any program id other than spl_token::ID, so the removed check is redundant") },
			Variant { id: "bump_from_ix", rules: &["pda-bump-from-ix"], idl: None, not_exploitable: None },
			Variant { id: "recipient_unbound", rules: &["recipient-unbound", "token-mint-unrelated"], idl: None, not_exploitable: None },
		],
		code: r#"// accounts: admin (signer), pool (writable), vault (writable), dest (writable token account of the admin), pool_auth, token_program;
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
}"#,
		accounts: None,
	},
];

pub const BANK_HEADER: &str = r"use solana_program::{
	account_info::{next_account_info, AccountInfo}, clock::Clock, entrypoint, entrypoint::ProgramResult, program_error::ProgramError,
	pubkey::Pubkey, sysvar::Sysvar,
};

entrypoint!(process);

const BANK: u8 = 1;

fn u64_at(d: &[u8], o: usize) -> Result<u64, ProgramError> {
	Ok(u64::from_le_bytes(d.get(o..o + 8).ok_or(ProgramError::InvalidInstructionData)?.try_into().unwrap()))
}
";

pub const BANK_UNITS: &[Unit] = &[
	Unit {
		name: "init",
		tag: Some(0),
		types: None,
		idl: "",
		args: &[],
		fund_mover: None,
		variants: &[
			Variant { id: "reinit_unchecked", rules: &["reinit-unchecked"], idl: None, not_exploitable: None },
		],
		code: r#"// accounts: authority (signer), bank (writable, program-owned, allocated by the client)
fn init(program_id: &Pubkey, accounts: &[AccountInfo], _data: &[u8]) -> ProgramResult {
	let it = &mut accounts.iter();
	let authority = next_account_info(it)?;
	let bank = next_account_info(it)?;
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
}"#,
		accounts: None,
	},
	Unit {
		name: "withdraw",
		tag: Some(1),
		types: None,
		idl: "",
		args: &[],
		fund_mover: None,
		variants: &[
			Variant { id: "no_signer", rules: &["value-move-no-signer", "state-write-ungated"], idl: None, not_exploitable: None },
			Variant { id: "no_owner", rules: &["unverified-account-data"], idl: None, not_exploitable: Some("the unowned account is debited and its data written; the runtime rejects both for an account the program does not own") },
			Variant { id: "no_tag", rules: &["account-type-unchecked", "unverified-account-data"], idl: None, not_exploitable: None },
			Variant { id: "no_key", rules: &["signer-not-related-to-authority"], idl: None, not_exploitable: None },
			Variant { id: "wrapping_sub", rules: &["unchecked-arithmetic"], idl: None, not_exploitable: None },
		],
		code: r#"// accounts: authority (signer, writable), bank (writable); data: amount u64
fn withdraw(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let amount = u64_at(data, 1)?;
	let it = &mut accounts.iter();
	let authority = next_account_info(it)?;
	let bank = next_account_info(it)?;
	{
		#[cfg(not(feature = "v_no_signer"))]
		if !authority.is_signer { return Err(ProgramError::MissingRequiredSignature) }
		#[cfg(not(feature = "v_no_owner"))]
		if bank.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
		let _ = program_id;
		let mut d = bank.try_borrow_mut_data()?;
		if d.len() < 60 { return Err(ProgramError::AccountDataTooSmall) }
		#[cfg(not(feature = "v_no_tag"))]
		if d[0] != BANK { return Err(ProgramError::InvalidAccountData) }
		#[cfg(not(feature = "v_no_key"))]
		if d[1..33] != authority.key.as_ref()[..] { return Err(ProgramError::InvalidAccountData) }
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
}"#,
		accounts: None,
	},
	Unit {
		name: "close",
		tag: Some(2),
		types: None,
		idl: "",
		args: &[],
		fund_mover: None,
		variants: &[
			Variant { id: "close_no_zero", rules: &["close-without-zeroing"], idl: None, not_exploitable: None },
		],
		code: r#"// accounts: authority (signer, writable), bank (writable)
fn close(program_id: &Pubkey, accounts: &[AccountInfo], _data: &[u8]) -> ProgramResult {
	let it = &mut accounts.iter();
	let authority = next_account_info(it)?;
	let bank = next_account_info(it)?;
	{
		if !authority.is_signer { return Err(ProgramError::MissingRequiredSignature) }
		if bank.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
		let _ = program_id;
		let mut d = bank.try_borrow_mut_data()?;
		if d.len() < 60 { return Err(ProgramError::AccountDataTooSmall) }
		if d[0] != BANK { return Err(ProgramError::InvalidAccountData) }
		if d[1..33] != authority.key.as_ref()[..] { return Err(ProgramError::InvalidAccountData) }
		#[cfg(not(feature = "v_close_no_zero"))]
		d.fill(0);
	}
	let n = bank.lamports();
	let to = authority.lamports().checked_add(n).ok_or(ProgramError::ArithmeticOverflow)?;
	**bank.try_borrow_mut_lamports()? = 0;
	**authority.try_borrow_mut_lamports()? = to;
	Ok(())
}"#,
		accounts: None,
	},
	Unit {
		name: "settle",
		tag: Some(3),
		types: None,
		idl: "",
		args: &[],
		fund_mover: None,
		variants: &[
			Variant { id: "sysvar_unchecked", rules: &["sysvar-account-unchecked"], idl: None, not_exploitable: None },
		],
		code: r#"// accounts: authority (signer), bank (writable), clock sysvar
fn settle(program_id: &Pubkey, accounts: &[AccountInfo], _data: &[u8]) -> ProgramResult {
	let it = &mut accounts.iter();
	let authority = next_account_info(it)?;
	let bank = next_account_info(it)?;
	let clock = next_account_info(it)?;
	if !authority.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	if bank.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	let _ = program_id;
	let mut d = bank.try_borrow_mut_data()?;
	if d.len() < 60 { return Err(ProgramError::AccountDataTooSmall) }
	if d[0] != BANK { return Err(ProgramError::InvalidAccountData) }
	if d[1..33] != authority.key.as_ref()[..] { return Err(ProgramError::InvalidAccountData) }
	#[cfg(not(feature = "v_sysvar_unchecked"))]
	let slot = Clock::from_account_info(clock)?.slot;
	#[cfg(feature = "v_sysvar_unchecked")]
	let slot = u64_at(&clock.try_borrow_data()?, 0)?;
	d[52..60].copy_from_slice(&slot.to_le_bytes());
	Ok(())
}"#,
		accounts: None,
	},
	Unit {
		name: "set_limit",
		tag: Some(4),
		types: None,
		idl: "authority:s bank:w",
		args: &[],
		fund_mover: None,
		variants: &[],
		code: r"// accounts: authority (signer), bank (writable)
fn set_limit(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let it = &mut accounts.iter();
	let authority = next_account_info(it)?;
	let bank = next_account_info(it)?;
	if !authority.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	if bank.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	let _ = program_id;
	let mut d = bank.try_borrow_mut_data()?;
	if d.len() < 60 { return Err(ProgramError::AccountDataTooSmall) }
	if d[0] != BANK { return Err(ProgramError::InvalidAccountData) }
	if d[1..33] != authority.key.as_ref()[..] { return Err(ProgramError::InvalidAccountData) }
	d[41..49].copy_from_slice(data.get(1..9).ok_or(ProgramError::InvalidInstructionData)?);
	Ok(())
}",
		accounts: None,
	},
	Unit {
		name: "set_fee",
		tag: Some(5),
		types: None,
		idl: "authority:s bank:w",
		args: &[],
		fund_mover: None,
		variants: &[
			Variant { id: "inconsistent", rules: &["~consistency", "unverified-account-data"], idl: None, not_exploitable: None },
		],
		code: r#"// accounts: authority (signer), bank (writable)
fn set_fee(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let it = &mut accounts.iter();
	let authority = next_account_info(it)?;
	let bank = next_account_info(it)?;
	if !authority.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	#[cfg(not(feature = "v_inconsistent"))]
	if bank.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	let _ = program_id;
	let mut d = bank.try_borrow_mut_data()?;
	if d.len() < 60 { return Err(ProgramError::AccountDataTooSmall) }
	if d[0] != BANK { return Err(ProgramError::InvalidAccountData) }
	if d[1..33] != authority.key.as_ref()[..] { return Err(ProgramError::InvalidAccountData) }
	d[49..51].copy_from_slice(data.get(1..3).ok_or(ProgramError::InvalidInstructionData)?);
	Ok(())
}"#,
		accounts: None,
	},
	Unit {
		name: "set_paused",
		tag: Some(6),
		types: None,
		idl: "authority:s bank:w",
		args: &[],
		fund_mover: None,
		variants: &[],
		code: r"// accounts: authority (signer), bank (writable)
fn set_paused(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	let it = &mut accounts.iter();
	let authority = next_account_info(it)?;
	let bank = next_account_info(it)?;
	if !authority.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	if bank.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	let _ = program_id;
	let mut d = bank.try_borrow_mut_data()?;
	if d.len() < 60 { return Err(ProgramError::AccountDataTooSmall) }
	if d[0] != BANK { return Err(ProgramError::InvalidAccountData) }
	if d[1..33] != authority.key.as_ref()[..] { return Err(ProgramError::InvalidAccountData) }
	d[51..52].copy_from_slice(data.get(1..2).ok_or(ProgramError::InvalidInstructionData)?);
	Ok(())
}",
		accounts: None,
	},
	Unit {
		name: "move_balance",
		tag: Some(7),
		types: None,
		idl: "",
		args: &[],
		fund_mover: None,
		variants: &[
			Variant { id: "dup_mut", rules: &["duplicate-mutable-accounts"], idl: None, not_exploitable: None },
		],
		code: r#"// accounts: authority (signer), from (writable), to (writable); data: amount u64 (bookkeeping between two banks of one authority)
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
}"#,
		accounts: None,
	},
];

pub const JAR_HEADER: &str = r"use pinocchio::{account_info::AccountInfo, entrypoint, program_error::ProgramError, pubkey::Pubkey, ProgramResult};

entrypoint!(process);

fn u64_at(d: &[u8], o: usize) -> Result<u64, ProgramError> {
	Ok(u64::from_le_bytes(d.get(o..o + 8).ok_or(ProgramError::InvalidInstructionData)?.try_into().unwrap()))
}
";

pub const JAR_UNITS: &[Unit] = &[
	Unit {
		name: "init",
		tag: Some(0),
		types: None,
		idl: "",
		args: &[],
		fund_mover: None,
		variants: &[
			Variant { id: "reinit_unchecked", rules: &["reinit-unchecked"], idl: None, not_exploitable: None },
		],
		code: r#"// accounts: admin (signer), jar (writable, program-owned); data: share supply u64
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
}"#,
		accounts: None,
	},
	Unit {
		name: "withdraw",
		tag: Some(1),
		types: None,
		idl: "",
		args: &[],
		fund_mover: None,
		variants: &[
			Variant { id: "no_signer", rules: &["value-move-no-signer", "state-write-ungated"], idl: None, not_exploitable: None },
			Variant { id: "no_owner", rules: &["unverified-account-data"], idl: None, not_exploitable: Some("the unowned account is debited and its data written; the runtime rejects both for an account the program does not own") },
			Variant { id: "no_key", rules: &["signer-not-related-to-authority"], idl: None, not_exploitable: None },
			Variant { id: "wrapping_sub", rules: &["unchecked-arithmetic"], idl: None, not_exploitable: None },
		],
		code: r#"// accounts: admin (signer, writable), jar (writable); data: lamports u64
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
}"#,
		accounts: None,
	},
	Unit {
		name: "close",
		tag: Some(2),
		types: None,
		idl: "",
		args: &[],
		fund_mover: None,
		variants: &[
			Variant { id: "close_no_zero", rules: &["close-without-zeroing"], idl: None, not_exploitable: None },
		],
		code: r#"// accounts: admin (signer, writable), jar (writable)
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
}"#,
		accounts: None,
	},
	Unit {
		name: "redeem",
		tag: Some(3),
		types: None,
		idl: "",
		args: &[],
		fund_mover: None,
		variants: &[
			Variant { id: "div_zero", rules: &["share-price-zero-supply"], idl: None, not_exploitable: None },
		],
		code: r#"// accounts: admin (signer, writable), jar (writable); data: shares u64 (lamports out = shares * jar lamports / supply)
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
}"#,
		accounts: None,
	},
];
