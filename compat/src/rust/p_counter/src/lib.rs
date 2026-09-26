// Pinocchio counter with an admin and a tip jar: signer / owner / stored-key checks, pinocchio-system transfer CPI,
// raw lamport withdrawal.
// counter (program-owned): admin: Pubkey (0..32), count: u64 (32..40)
use pinocchio::{account_info::AccountInfo, entrypoint, program_error::ProgramError, pubkey::Pubkey, ProgramResult};
use pinocchio_system::instructions::Transfer;

entrypoint!(process);

fn arg(data: &[u8]) -> Result<u64, ProgramError> {
	Ok(u64::from_le_bytes(data.get(1..9).ok_or(ProgramError::InvalidInstructionData)?.try_into().unwrap()))
}

pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	match data.first() {
		Some(0) => init(program_id, accounts),
		Some(1) => bump(program_id, accounts, arg(data)?),
		Some(2) => tip(accounts, arg(data)?),
		Some(3) => withdraw(program_id, accounts, arg(data)?),
		_ => Err(ProgramError::InvalidInstructionData),
	}
}

// accounts: admin (signer), counter (writable)
fn init(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
	let [admin, counter, ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	if !admin.is_signer() { return Err(ProgramError::MissingRequiredSignature) }
	if !counter.is_owned_by(program_id) { return Err(ProgramError::IncorrectProgramId) }
	let mut d = counter.try_borrow_mut_data()?;
	if d[0..32] != [0u8; 32] { return Err(ProgramError::AccountAlreadyInitialized) }
	d[0..32].copy_from_slice(admin.key());
	Ok(())
}

// accounts: admin (signer), counter (writable)
fn bump(program_id: &Pubkey, accounts: &[AccountInfo], by: u64) -> ProgramResult {
	let [admin, counter, ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	#[cfg(not(feature = "v_ungated"))]
	{
		if !admin.is_signer() { return Err(ProgramError::MissingRequiredSignature) }
		if !counter.is_owned_by(program_id) { return Err(ProgramError::IncorrectProgramId) }
	}
	let mut d = counter.try_borrow_mut_data()?;
	#[cfg(not(feature = "v_ungated"))]
	if d[0..32] != admin.key()[..] { return Err(ProgramError::InvalidAccountData) }
	let _ = (admin, program_id);
	let c = u64::from_le_bytes(d[32..40].try_into().unwrap());
	d[32..40].copy_from_slice(&c.checked_add(by).ok_or(ProgramError::ArithmeticOverflow)?.to_le_bytes());
	Ok(())
}

// accounts: payer (signer, writable), counter (writable), system_program
fn tip(accounts: &[AccountInfo], lamports: u64) -> ProgramResult {
	let [payer, counter, _system, ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	Transfer { from: payer, to: counter, lamports }.invoke()
}

// accounts: admin (signer, writable), counter (writable)
fn withdraw(program_id: &Pubkey, accounts: &[AccountInfo], lamports: u64) -> ProgramResult {
	let [admin, counter, ..] = accounts else { return Err(ProgramError::NotEnoughAccountKeys) };
	#[cfg(not(feature = "v_no_signer"))]
	if !admin.is_signer() { return Err(ProgramError::MissingRequiredSignature) }
	if !counter.is_owned_by(program_id) { return Err(ProgramError::IncorrectProgramId) }
	if counter.try_borrow_data()?[0..32] != admin.key()[..] { return Err(ProgramError::InvalidAccountData) }
	let from = counter.lamports().checked_sub(lamports).ok_or(ProgramError::InsufficientFunds)?;
	let to = admin.lamports().checked_add(lamports).ok_or(ProgramError::ArithmeticOverflow)?;
	*counter.try_borrow_mut_lamports()? = from;
	*admin.try_borrow_mut_lamports()? = to;
	Ok(())
}
