// Native SOL vault: next_account_info, manual signer / owner / key / PDA checks, invoke_signed create_account,
// system transfer CPI, raw lamport moves, close with zeroing.
// state (program-owned, PDA ["state", owner]): owner: Pubkey (0..32), vault_bump: u8 (32), balance: u64 (33..41)
// vault (program-owned, PDA ["vault", state]): lamports only
use solana_program::{
	account_info::{next_account_info, AccountInfo}, entrypoint, entrypoint::ProgramResult, program::{invoke, invoke_signed},
	program_error::ProgramError, pubkey::Pubkey, rent::Rent, system_instruction, system_program, sysvar::Sysvar,
};

entrypoint!(process);

fn amount_of(data: &[u8]) -> Result<u64, ProgramError> {
	Ok(u64::from_le_bytes(data.get(1..9).ok_or(ProgramError::InvalidInstructionData)?.try_into().unwrap()))
}

pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	match data.first() {
		Some(0) => init(program_id, accounts),
		Some(1) => deposit(program_id, accounts, amount_of(data)?),
		Some(2) => withdraw(program_id, accounts, amount_of(data)?),
		Some(3) => close(program_id, accounts),
		_ => Err(ProgramError::InvalidInstructionData),
	}
}

// accounts: owner (signer, writable), state (writable), vault (writable), system_program
fn init(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
	let it = &mut accounts.iter();
	let owner = next_account_info(it)?;
	let state = next_account_info(it)?;
	let vault = next_account_info(it)?;
	let system = next_account_info(it)?;
	if !owner.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	if *system.key != system_program::ID { return Err(ProgramError::IncorrectProgramId) }
	let (state_key, state_bump) = Pubkey::find_program_address(&[b"state", owner.key.as_ref()], program_id);
	if state_key != *state.key { return Err(ProgramError::InvalidSeeds) }
	let (vault_key, vault_bump) = Pubkey::find_program_address(&[b"vault", state.key.as_ref()], program_id);
	if vault_key != *vault.key { return Err(ProgramError::InvalidSeeds) }
	let rent = Rent::get()?;
	invoke_signed(&system_instruction::create_account(owner.key, state.key, rent.minimum_balance(41), 41, program_id),
		&[owner.clone(), state.clone(), system.clone()], &[&[b"state", owner.key.as_ref(), &[state_bump]]])?;
	invoke_signed(&system_instruction::create_account(owner.key, vault.key, rent.minimum_balance(0), 0, program_id),
		&[owner.clone(), vault.clone(), system.clone()], &[&[b"vault", state.key.as_ref(), &[vault_bump]]])?;
	let mut d = state.try_borrow_mut_data()?;
	d[0..32].copy_from_slice(owner.key.as_ref());
	d[32] = vault_bump;
	d[33..41].copy_from_slice(&0u64.to_le_bytes());
	Ok(())
}

// accounts: payer (signer, writable), state (writable), vault (writable), system_program
fn deposit(program_id: &Pubkey, accounts: &[AccountInfo], amount: u64) -> ProgramResult {
	let it = &mut accounts.iter();
	let payer = next_account_info(it)?;
	let state = next_account_info(it)?;
	let vault = next_account_info(it)?;
	let system = next_account_info(it)?;
	if !payer.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	if state.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	let mut d = state.try_borrow_mut_data()?;
	let vault_key = Pubkey::create_program_address(&[b"vault", state.key.as_ref(), &[d[32]]], program_id)?;
	if vault_key != *vault.key { return Err(ProgramError::InvalidSeeds) }
	if *system.key != system_program::ID { return Err(ProgramError::IncorrectProgramId) }
	invoke(&system_instruction::transfer(payer.key, vault.key, amount), &[payer.clone(), vault.clone(), system.clone()])?;
	let bal = u64::from_le_bytes(d[33..41].try_into().unwrap());
	d[33..41].copy_from_slice(&bal.checked_add(amount).ok_or(ProgramError::ArithmeticOverflow)?.to_le_bytes());
	Ok(())
}

// accounts: owner (signer), state (writable), vault (writable), dest (writable)
fn withdraw(program_id: &Pubkey, accounts: &[AccountInfo], amount: u64) -> ProgramResult {
	let it = &mut accounts.iter();
	let owner = next_account_info(it)?;
	let state = next_account_info(it)?;
	let vault = next_account_info(it)?;
	let dest = next_account_info(it)?;
	#[cfg(not(feature = "v_no_signer"))]
	if !owner.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	#[cfg(not(feature = "v_no_owner"))]
	if state.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	let mut d = state.try_borrow_mut_data()?;
	#[cfg(not(feature = "v_no_key"))]
	if d[0..32] != owner.key.as_ref()[..] { return Err(ProgramError::InvalidAccountData) }
	let vault_key = Pubkey::create_program_address(&[b"vault", state.key.as_ref(), &[d[32]]], program_id)?;
	if vault_key != *vault.key { return Err(ProgramError::InvalidSeeds) }
	let bal = u64::from_le_bytes(d[33..41].try_into().unwrap());
	#[cfg(not(feature = "v_wrapping_sub"))]
	let bal = bal.checked_sub(amount).ok_or(ProgramError::InsufficientFunds)?;
	#[cfg(feature = "v_wrapping_sub")]
	let bal = bal.wrapping_sub(amount);
	d[33..41].copy_from_slice(&bal.to_le_bytes());
	**vault.try_borrow_mut_lamports()? = vault.lamports().checked_sub(amount).ok_or(ProgramError::InsufficientFunds)?;
	**dest.try_borrow_mut_lamports()? = dest.lamports().checked_add(amount).ok_or(ProgramError::ArithmeticOverflow)?;
	Ok(())
}

// accounts: owner (signer), state (writable), dest (writable)
fn close(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
	let it = &mut accounts.iter();
	let owner = next_account_info(it)?;
	let state = next_account_info(it)?;
	let dest = next_account_info(it)?;
	if !owner.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	if state.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	{
		let d = state.try_borrow_data()?;
		if d[0..32] != owner.key.as_ref()[..] { return Err(ProgramError::InvalidAccountData) }
		if u64::from_le_bytes(d[33..41].try_into().unwrap()) != 0 { return Err(ProgramError::InvalidAccountData) }
	}
	let l = state.lamports();
	**dest.try_borrow_mut_lamports()? = dest.lamports().checked_add(l).ok_or(ProgramError::ArithmeticOverflow)?;
	**state.try_borrow_mut_lamports()? = 0;
	#[cfg(not(feature = "v_close_no_zero"))]
	{
		state.try_borrow_mut_data()?.fill(0);
		state.assign(&system_program::ID);
	}
	Ok(())
}
