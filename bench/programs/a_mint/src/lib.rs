// Token mint wrapper: mint authority is a config PDA (PDA-signed mint_to), admin-gated minting, user burns.
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount};

declare_id!("BMint11111111111111111111111111111111111111");

#[program]
pub mod a_mint {
	use super::*;

	pub fn init_config(ctx: Context<InitConfig>) -> Result<()> {
		let c = &mut ctx.accounts.config;
		c.admin = ctx.accounts.admin.key();
		c.mint = ctx.accounts.mint.key();
		c.bump = ctx.bumps.config;
		c.minted = 0;
		Ok(())
	}

	pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
		let mint = ctx.accounts.mint.key();
		let seeds: &[&[u8]] = &[b"config", mint.as_ref(), &[ctx.accounts.config.bump]];
		token::mint_to(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), MintTo {
			mint: ctx.accounts.mint.to_account_info(),
			to: ctx.accounts.dest.to_account_info(),
			authority: ctx.accounts.config.to_account_info(),
		}, &[seeds]), amount)?;
		let c = &mut ctx.accounts.config;
		c.minted = c.minted.checked_add(amount).ok_or(MintError::Overflow)?;
		Ok(())
	}

	pub fn burn_tokens(ctx: Context<BurnTokens>, amount: u64) -> Result<()> {
		token::burn(CpiContext::new(ctx.accounts.token_program.to_account_info(), Burn {
			mint: ctx.accounts.mint.to_account_info(),
			from: ctx.accounts.from.to_account_info(),
			authority: ctx.accounts.owner.to_account_info(),
		}), amount)?;
		let c = &mut ctx.accounts.config;
		c.minted = c.minted.checked_sub(amount).ok_or(MintError::Overflow)?;
		Ok(())
	}
}

#[account]
pub struct Config {
	pub admin: Pubkey,
	pub mint: Pubkey,
	pub minted: u64,
	pub bump: u8,
}

#[derive(Accounts)]
pub struct InitConfig<'info> {
	#[account(init, payer = admin, space = 8 + 32 * 2 + 8 + 1, seeds = [b"config", mint.key().as_ref()], bump)]
	pub config: Account<'info, Config>,
	#[account(init, payer = admin, mint::decimals = 6, mint::authority = config)]
	pub mint: Account<'info, Mint>,
	#[account(mut)]
	pub admin: Signer<'info>,
	pub token_program: Program<'info, Token>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
	#[cfg_attr(not(feature = "v_no_has_one"), account(mut, has_one = admin, has_one = mint, seeds = [b"config", mint.key().as_ref()], bump = config.bump))]
	#[cfg_attr(feature = "v_no_has_one", account(mut, has_one = mint, seeds = [b"config", mint.key().as_ref()], bump = config.bump))]
	pub config: Account<'info, Config>,
	#[account(mut)]
	pub mint: Account<'info, Mint>,
	#[account(mut, token::mint = mint)]
	pub dest: Account<'info, TokenAccount>,
	#[cfg(not(feature = "v_no_signer"))]
	pub admin: Signer<'info>,
	/// CHECK: bench variant (signer check removed)
	#[cfg(feature = "v_no_signer")]
	pub admin: UncheckedAccount<'info>,
	pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnTokens<'info> {
	#[account(mut, has_one = mint)]
	pub config: Account<'info, Config>,
	#[account(mut)]
	pub mint: Account<'info, Mint>,
	#[account(mut, token::mint = mint, token::authority = owner)]
	pub from: Account<'info, TokenAccount>,
	pub owner: Signer<'info>,
	pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum MintError {
	Overflow,
}
