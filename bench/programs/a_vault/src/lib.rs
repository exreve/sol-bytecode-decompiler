// SOL vault: PDA per owner holding lamports; has_one owner, seeds/bump, Signer, system transfer, raw lamport moves, close.
use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("BVau1t1111111111111111111111111111111111111");

#[program]
pub mod a_vault {
	use super::*;

	pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
		let v = &mut ctx.accounts.vault;
		v.owner = ctx.accounts.owner.key();
		v.bump = ctx.bumps.vault;
		v.balance = 0;
		Ok(())
	}

	pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
		system_program::transfer(CpiContext::new(ctx.accounts.system_program.to_account_info(), system_program::Transfer {
			from: ctx.accounts.owner.to_account_info(),
			to: ctx.accounts.vault.to_account_info(),
		}), amount)?;
		let v = &mut ctx.accounts.vault;
		v.balance = v.balance.checked_add(amount).ok_or(VaultError::Overflow)?;
		Ok(())
	}

	pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
		let v = &mut ctx.accounts.vault;
		#[cfg(not(feature = "v_wrapping_sub"))]
		{ v.balance = v.balance.checked_sub(amount).ok_or(VaultError::Insufficient)?; }
		#[cfg(feature = "v_wrapping_sub")]
		{ v.balance = v.balance.wrapping_sub(amount); }
		**v.to_account_info().try_borrow_mut_lamports()? -= amount;
		**ctx.accounts.owner.to_account_info().try_borrow_mut_lamports()? += amount;
		Ok(())
	}

	pub fn close_vault(ctx: Context<CloseVault>) -> Result<()> {
		#[cfg(feature = "v_close_no_zero")]
		{
			let v = ctx.accounts.vault.to_account_info();
			let o = ctx.accounts.owner.to_account_info();
			let l = v.lamports();
			**o.try_borrow_mut_lamports()? += l;
			**v.try_borrow_mut_lamports()? = 0;
		}
		let _ = &ctx;
		Ok(())
	}
}

#[account]
pub struct Vault {
	pub owner: Pubkey,
	pub balance: u64,
	pub bump: u8,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
	#[account(init, payer = owner, space = 8 + 32 + 8 + 1, seeds = [b"vault", owner.key().as_ref()], bump)]
	pub vault: Account<'info, Vault>,
	#[account(mut)]
	pub owner: Signer<'info>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
	#[account(mut, seeds = [b"vault", owner.key().as_ref()], bump = vault.bump)]
	pub vault: Account<'info, Vault>,
	#[account(mut)]
	pub owner: Signer<'info>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
	#[cfg_attr(not(feature = "v_no_has_one"), account(mut, seeds = [b"vault", owner.key().as_ref()], bump = vault.bump, has_one = owner))]
	#[cfg_attr(feature = "v_no_has_one", account(mut))]
	pub vault: Account<'info, Vault>,
	#[cfg(not(feature = "v_no_signer"))]
	#[account(mut)]
	pub owner: Signer<'info>,
	/// CHECK: bench variant (signer check removed)
	#[cfg(feature = "v_no_signer")]
	#[account(mut)]
	pub owner: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct CloseVault<'info> {
	#[cfg_attr(not(feature = "v_close_no_zero"), account(mut, has_one = owner, close = owner))]
	#[cfg_attr(feature = "v_close_no_zero", account(mut, has_one = owner))]
	pub vault: Account<'info, Vault>,
	#[account(mut)]
	pub owner: Signer<'info>,
}

#[error_code]
pub enum VaultError {
	Overflow,
	Insufficient,
}
