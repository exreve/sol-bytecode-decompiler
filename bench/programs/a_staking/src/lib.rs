// Staking pool: token deposits for shares; share-price division, PDA-signed token transfer out, token mint binding.
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("BStake1111111111111111111111111111111111111");

#[program]
pub mod a_staking {
	use super::*;

	pub fn init_pool(ctx: Context<InitPool>) -> Result<()> {
		let p = &mut ctx.accounts.pool;
		p.admin = ctx.accounts.admin.key();
		p.mint = ctx.accounts.mint.key();
		p.vault = ctx.accounts.vault.key();
		p.total_staked = 0;
		p.total_shares = 0;
		p.bump = ctx.bumps.pool;
		Ok(())
	}

	pub fn open_stake(ctx: Context<OpenStake>) -> Result<()> {
		let s = &mut ctx.accounts.user_stake;
		s.owner = ctx.accounts.user.key();
		s.pool = ctx.accounts.pool.key();
		s.shares = 0;
		Ok(())
	}

	pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
		let p = &ctx.accounts.pool;
		let shares = if p.total_shares == 0 {
			amount
		} else {
			#[cfg(not(feature = "v_div_no_zero"))]
			require!(p.total_staked > 0, StakeError::EmptyPool);
			((amount as u128) * (p.total_shares as u128) / (p.total_staked as u128)) as u64
		};
		token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
			from: ctx.accounts.user_token.to_account_info(),
			to: ctx.accounts.vault.to_account_info(),
			authority: ctx.accounts.owner.to_account_info(),
		}), amount)?;
		let p = &mut ctx.accounts.pool;
		p.total_staked = p.total_staked.checked_add(amount).ok_or(StakeError::Overflow)?;
		p.total_shares = p.total_shares.checked_add(shares).ok_or(StakeError::Overflow)?;
		let s = &mut ctx.accounts.user_stake;
		s.shares = s.shares.checked_add(shares).ok_or(StakeError::Overflow)?;
		Ok(())
	}

	pub fn unstake(ctx: Context<Unstake>, shares: u64) -> Result<()> {
		let p = &ctx.accounts.pool;
		require!(p.total_shares > 0, StakeError::EmptyPool);
		let amount = ((shares as u128) * (p.total_staked as u128) / (p.total_shares as u128)) as u64;
		let s = &mut ctx.accounts.user_stake;
		s.shares = s.shares.checked_sub(shares).ok_or(StakeError::Insufficient)?;
		let mint = p.mint;
		let seeds: &[&[u8]] = &[b"pool", mint.as_ref(), &[p.bump]];
		token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), Transfer {
			from: ctx.accounts.vault.to_account_info(),
			to: ctx.accounts.user_token.to_account_info(),
			authority: ctx.accounts.pool.to_account_info(),
		}, &[seeds]), amount)?;
		let p = &mut ctx.accounts.pool;
		p.total_staked = p.total_staked.checked_sub(amount).ok_or(StakeError::Insufficient)?;
		p.total_shares = p.total_shares.checked_sub(shares).ok_or(StakeError::Insufficient)?;
		Ok(())
	}
}

#[account]
pub struct Pool {
	pub admin: Pubkey,
	pub mint: Pubkey,
	pub vault: Pubkey,
	pub total_staked: u64,
	pub total_shares: u64,
	pub bump: u8,
}

#[account]
pub struct UserStake {
	pub owner: Pubkey,
	pub pool: Pubkey,
	pub shares: u64,
}

#[derive(Accounts)]
pub struct InitPool<'info> {
	#[account(init, payer = admin, space = 8 + 32 * 3 + 8 * 2 + 1, seeds = [b"pool", mint.key().as_ref()], bump)]
	pub pool: Account<'info, Pool>,
	pub mint: Account<'info, Mint>,
	#[account(init, payer = admin, token::mint = mint, token::authority = pool, seeds = [b"vault", mint.key().as_ref()], bump)]
	pub vault: Account<'info, TokenAccount>,
	#[account(mut)]
	pub admin: Signer<'info>,
	pub token_program: Program<'info, Token>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct OpenStake<'info> {
	pub pool: Account<'info, Pool>,
	#[account(init, payer = user, space = 8 + 32 * 2 + 8, seeds = [b"stake", pool.key().as_ref(), user.key().as_ref()], bump)]
	pub user_stake: Account<'info, UserStake>,
	#[account(mut)]
	pub user: Signer<'info>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
	#[account(mut, has_one = vault)]
	pub pool: Account<'info, Pool>,
	#[account(mut, has_one = owner, has_one = pool)]
	pub user_stake: Account<'info, UserStake>,
	#[account(mut)]
	pub vault: Account<'info, TokenAccount>,
	#[account(mut, token::mint = pool.mint, token::authority = owner)]
	pub user_token: Account<'info, TokenAccount>,
	pub owner: Signer<'info>,
	pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
	#[account(mut, has_one = vault)]
	pub pool: Account<'info, Pool>,
	#[cfg_attr(not(feature = "v_no_has_one"), account(mut, has_one = owner, has_one = pool))]
	#[cfg_attr(feature = "v_no_has_one", account(mut, has_one = pool))]
	pub user_stake: Account<'info, UserStake>,
	#[account(mut)]
	pub vault: Account<'info, TokenAccount>,
	#[cfg_attr(not(feature = "v_recipient_unbound"), account(mut, token::mint = pool.mint, token::authority = owner))]
	#[cfg_attr(feature = "v_recipient_unbound", account(mut))]
	pub user_token: Account<'info, TokenAccount>,
	pub owner: Signer<'info>,
	pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum StakeError {
	Overflow,
	Insufficient,
	EmptyPool,
}
