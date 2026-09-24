use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo}, entrypoint, entrypoint::ProgramResult, msg,
    program::{invoke, invoke_signed}, program_error::ProgramError, pubkey::Pubkey, rent::Rent,
    system_instruction, sysvar::Sysvar, clock::Clock, program_pack::Pack,
};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum Ix { Init { amount: u64, name: String }, Deposit { amount: u64 }, Withdraw { amount: u64, bump: u8 } }

#[derive(BorshSerialize, BorshDeserialize, Debug, Default)]
pub struct State { pub owner: Pubkey, pub amount: u64, pub name: String, pub ts: i64 }

entrypoint!(process);
pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    let ix = Ix::try_from_slice(data).map_err(|_| ProgramError::InvalidInstructionData)?;
    let it = &mut accounts.iter();
    let payer = next_account_info(it)?;
    let state = next_account_info(it)?;
    if !payer.is_signer { return Err(ProgramError::MissingRequiredSignature); }
    match ix {
        Ix::Init { amount, name } => {
            msg!("init {} {}", amount, name);
            let rent = Rent::get()?;
            let space = 128;
            invoke(&system_instruction::create_account(payer.key, state.key, rent.minimum_balance(space), space as u64, program_id), &[payer.clone(), state.clone()])?;
            let s = State { owner: *payer.key, amount, name, ts: Clock::get()?.unix_timestamp };
            s.serialize(&mut &mut state.data.borrow_mut()[..]).map_err(|_| ProgramError::InvalidAccountData)?;
        }
        Ix::Deposit { amount } => {
            let mut s = State::try_from_slice(&state.data.borrow()).map_err(|_| ProgramError::InvalidAccountData)?;
            s.amount = s.amount.checked_add(amount).ok_or(ProgramError::ArithmeticOverflow)?;
            let src = next_account_info(it)?; let dst = next_account_info(it)?; let tp = next_account_info(it)?;
            let acc = spl_token::state::Account::unpack(&src.data.borrow())?;
            msg!("bal {}", acc.amount);
            invoke(&spl_token::instruction::transfer(tp.key, src.key, dst.key, payer.key, &[], amount)?, &[src.clone(), dst.clone(), payer.clone()])?;
            s.serialize(&mut &mut state.data.borrow_mut()[..]).map_err(|_| ProgramError::InvalidAccountData)?;
        }
        Ix::Withdraw { amount, bump } => {
            let (pda, b) = Pubkey::find_program_address(&[b"vault", payer.key.as_ref()], program_id);
            if b != bump || pda != *state.key { return Err(ProgramError::InvalidSeeds); }
            msg!("pda {}", pda);
            invoke_signed(&system_instruction::transfer(state.key, payer.key, amount), &[state.clone(), payer.clone()], &[&[b"vault", payer.key.as_ref(), &[b]]])?;
        }
    }
    Ok(())
}
