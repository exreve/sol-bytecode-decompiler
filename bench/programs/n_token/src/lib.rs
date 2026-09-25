// Native token treasury: spl-token CPIs (transfer / mint_to with a PDA authority via invoke_signed, burn), token program id
// check, destination mint binding by unpacking the token account.
// config (program-owned): admin: Pubkey (0..32), mint: Pubkey (32..64), bump: u8 (64); PDA authority ["auth", config]
use solana_program::{
	account_info::{next_account_info, AccountInfo}, entrypoint, entrypoint::ProgramResult, program::{invoke, invoke_signed},
	program_error::ProgramError, program_pack::Pack, pubkey::Pubkey,
};
use spl_token::state::Account as TokenAccount;

entrypoint!(process);

fn amount_of(data: &[u8]) -> Result<u64, ProgramError> {
	Ok(u64::from_le_bytes(data.get(1..9).ok_or(ProgramError::InvalidInstructionData)?.try_into().unwrap()))
}

pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
	match data.first() {
		Some(0) => payout(program_id, accounts, amount_of(data)?),
		Some(1) => mint(program_id, accounts, amount_of(data)?),
		Some(2) => burn(accounts, amount_of(data)?),
		_ => Err(ProgramError::InvalidInstructionData),
	}
}

struct Config { admin: Pubkey, mint: Pubkey, bump: u8 }

fn load_config(program_id: &Pubkey, config: &AccountInfo) -> Result<Config, ProgramError> {
	if config.owner != program_id { return Err(ProgramError::IncorrectProgramId) }
	let d = config.try_borrow_data()?;
	if d.len() < 65 { return Err(ProgramError::InvalidAccountData) }
	Ok(Config { admin: Pubkey::new_from_array(d[0..32].try_into().unwrap()), mint: Pubkey::new_from_array(d[32..64].try_into().unwrap()), bump: d[64] })
}

// accounts: admin (signer), config, vault (writable, token account owned by the PDA), dest (writable, token account), authority (PDA), token_program
fn payout(program_id: &Pubkey, accounts: &[AccountInfo], amount: u64) -> ProgramResult {
	let it = &mut accounts.iter();
	let admin = next_account_info(it)?;
	let config = next_account_info(it)?;
	let vault = next_account_info(it)?;
	let dest = next_account_info(it)?;
	let authority = next_account_info(it)?;
	let token_program = next_account_info(it)?;
	#[cfg(not(feature = "v_no_signer"))]
	if !admin.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	let c = load_config(program_id, config)?;
	if c.admin != *admin.key { return Err(ProgramError::InvalidAccountData) }
	#[cfg(not(feature = "v_cpi_unchecked"))]
	if *token_program.key != spl_token::ID { return Err(ProgramError::IncorrectProgramId) }
	#[cfg(not(feature = "v_recipient_unbound"))]
	{
		if *dest.owner != spl_token::ID { return Err(ProgramError::IncorrectProgramId) }
		let d = TokenAccount::unpack(&dest.try_borrow_data()?)?;
		if d.mint != c.mint { return Err(ProgramError::InvalidAccountData) }
	}
	let pda = Pubkey::create_program_address(&[b"auth", config.key.as_ref(), &[c.bump]], program_id)?;
	if pda != *authority.key { return Err(ProgramError::InvalidSeeds) }
	invoke_signed(&spl_token::instruction::transfer(token_program.key, vault.key, dest.key, authority.key, &[], amount)?,
		&[vault.clone(), dest.clone(), authority.clone(), token_program.clone()], &[&[b"auth", config.key.as_ref(), &[c.bump]]])
}

// accounts: admin (signer), config, mint (writable), dest (writable), authority (PDA), token_program
fn mint(program_id: &Pubkey, accounts: &[AccountInfo], amount: u64) -> ProgramResult {
	let it = &mut accounts.iter();
	let admin = next_account_info(it)?;
	let config = next_account_info(it)?;
	let mint = next_account_info(it)?;
	let dest = next_account_info(it)?;
	let authority = next_account_info(it)?;
	let token_program = next_account_info(it)?;
	if !admin.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	let c = load_config(program_id, config)?;
	if c.admin != *admin.key { return Err(ProgramError::InvalidAccountData) }
	if c.mint != *mint.key { return Err(ProgramError::InvalidAccountData) }
	if *token_program.key != spl_token::ID { return Err(ProgramError::IncorrectProgramId) }
	let pda = Pubkey::create_program_address(&[b"auth", config.key.as_ref(), &[c.bump]], program_id)?;
	if pda != *authority.key { return Err(ProgramError::InvalidSeeds) }
	invoke_signed(&spl_token::instruction::mint_to(token_program.key, mint.key, dest.key, authority.key, &[], amount)?,
		&[mint.clone(), dest.clone(), authority.clone(), token_program.clone()], &[&[b"auth", config.key.as_ref(), &[c.bump]]])
}

// accounts: owner (signer), source (writable), mint (writable), token_program
fn burn(accounts: &[AccountInfo], amount: u64) -> ProgramResult {
	let it = &mut accounts.iter();
	let owner = next_account_info(it)?;
	let source = next_account_info(it)?;
	let mint = next_account_info(it)?;
	let token_program = next_account_info(it)?;
	if !owner.is_signer { return Err(ProgramError::MissingRequiredSignature) }
	if *token_program.key != spl_token::ID { return Err(ProgramError::IncorrectProgramId) }
	invoke(&spl_token::instruction::burn(token_program.key, source.key, mint.key, owner.key, &[], amount)?,
		&[source.clone(), mint.clone(), owner.clone(), token_program.clone()])
}
