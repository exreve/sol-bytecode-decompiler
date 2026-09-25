// Native SOL pool with shares: share-price division by supply / reserve, per-user share record (owner-checked account
// data), raw lamport payout.
// pool (program-owned): reserve: u64 (0..8), supply: u64 (8..16)
// record (program-owned): owner: Pubkey (0..32), shares: u64 (32..40)
use solana_program::{
	account_info::{next_account_info, AccountInfo}, entrypoint, entrypoint::ProgramResult, program::invoke,
	program_error::ProgramError, pubkey::Pubkey, system_instruction, system_program,
};

entrypoint!(process);

fn amount_of(data: &[u8]) -> Result<u64, ProgramError> {
	Ok(u64::from_le_bytes(data.get(1..9).ok_or(ProgramError::InvalidInstructionData)?.try_into().unwrap()))
}

fn rd(d: &[u8], o: usize) -> u64 { u64::from_le_bytes(d[o..o + 8].try_into().unwrap()) }
fn wr(d: &mut [u8], o: usize, v: u64) { d[o..o + 8].copy_from_slice(&v.to_le_bytes()) }

pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	match data.first() {
		Some(0) => deposit(program_id, accounts, amount_of(data)?),
		Some(1) => redeem(program_id, accounts, amount_of(data)?),
		_ => Err(ProgramError::InvalidInstructionData),
	}
}

// accounts: user (signer, writable), pool (writable), record (writable), system_program
fn deposit(program_id: &Pubkey, accounts: &[AccountInfo], amount: u64) -> ProgramResult {
	let it = &mut accounts.iter();
	let user = next_account_info(it)?;
	let pool = next_account_info(it)?;
	let record = next_account_info(it)?;
	let system = next_account_info(it)?;
	if !user.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	if pool.owner != program_id || record.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	if *system.key != system_program::ID { return Err(ProgramError::IncorrectProgramId) }
	let mut p = pool.try_borrow_mut_data()?;
	let mut r = record.try_borrow_mut_data()?;
	if r[0..32] != user.key.as_ref()[..] { return Err(ProgramError::InvalidAccountData) }
	let (reserve, supply) = (rd(&p, 0), rd(&p, 8));
	let shares = if supply == 0 || reserve == 0 { amount } else { ((amount as u128) * (supply as u128) / (reserve as u128)) as u64 };
	invoke(&system_instruction::transfer(user.key, pool.key, amount), &[user.clone(), pool.clone(), system.clone()])?;
	wr(&mut p, 0, reserve.checked_add(amount).ok_or(ProgramError::ArithmeticOverflow)?);
	wr(&mut p, 8, supply.checked_add(shares).ok_or(ProgramError::ArithmeticOverflow)?);
	let s = rd(&r, 32);
	wr(&mut r, 32, s.checked_add(shares).ok_or(ProgramError::ArithmeticOverflow)?);
	Ok(())
}

// accounts: user (signer, writable), pool (writable), record (writable)
fn redeem(program_id: &Pubkey, accounts: &[AccountInfo], shares: u64) -> ProgramResult {
	let it = &mut accounts.iter();
	let user = next_account_info(it)?;
	let pool = next_account_info(it)?;
	let record = next_account_info(it)?;
	if !user.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	if pool.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	#[cfg(not(feature = "v_no_owner"))]
	if record.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	let mut p = pool.try_borrow_mut_data()?;
	let mut r = record.try_borrow_mut_data()?;
	if r[0..32] != user.key.as_ref()[..] { return Err(ProgramError::InvalidAccountData) }
	let held = rd(&r, 32);
	if held < shares { return Err(ProgramError::InsufficientFunds) }
	let (reserve, supply) = (rd(&p, 0), rd(&p, 8));
	#[cfg(not(feature = "v_div_no_zero"))]
	if supply == 0 { return Err(ProgramError::InvalidAccountData) }
	let amount = ((shares as u128) * (reserve as u128) / (supply as u128)) as u64;
	wr(&mut r, 32, held - shares);
	#[cfg(not(feature = "v_wrapping_sub"))]
	{
		wr(&mut p, 0, reserve.checked_sub(amount).ok_or(ProgramError::InsufficientFunds)?);
		wr(&mut p, 8, supply.checked_sub(shares).ok_or(ProgramError::InsufficientFunds)?);
	}
	#[cfg(feature = "v_wrapping_sub")]
	{
		wr(&mut p, 0, reserve.wrapping_sub(amount));
		wr(&mut p, 8, supply.wrapping_sub(shares));
	}
	drop(p);
	**pool.try_borrow_mut_lamports()? = pool.lamports().checked_sub(amount).ok_or(ProgramError::InsufficientFunds)?;
	**user.try_borrow_mut_lamports()? = user.lamports().checked_add(amount).ok_or(ProgramError::ArithmeticOverflow)?;
	Ok(())
}
