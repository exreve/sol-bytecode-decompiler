// Token escrow: maker deposits mint A, taker pays mint B and receives A; PDA-signed transfers, token close_account, close = maker.
use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, Transfer};

declare_id!("BEscrow111111111111111111111111111111111111");

#[program]
pub mod a_escrow {
	use super::*;

	pub fn make(ctx: Context<Make>, amount_a: u64, amount_b: u64) -> Result<()> {
		let e = &mut ctx.accounts.escrow;
		e.maker = ctx.accounts.maker.key();
		e.mint_a = ctx.accounts.mint_a.key();
		e.mint_b = ctx.accounts.mint_b.key();
		e.amount_b = amount_b;
		e.bump = ctx.bumps.escrow;
		token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
			from: ctx.accounts.maker_ata_a.to_account_info(),
			to: ctx.accounts.vault.to_account_info(),
			authority: ctx.accounts.maker.to_account_info(),
		}), amount_a)?;
		Ok(())
	}

	pub fn take(ctx: Context<Take>) -> Result<()> {
		token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
			from: ctx.accounts.taker_ata_b.to_account_info(),
			to: ctx.accounts.maker_ata_b.to_account_info(),
			authority: ctx.accounts.taker.to_account_info(),
		}), ctx.accounts.escrow.amount_b)?;
		let maker = ctx.accounts.escrow.maker;
		let seeds: &[&[u8]] = &[b"escrow", maker.as_ref(), &[ctx.accounts.escrow.bump]];
		token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), Transfer {
			from: ctx.accounts.vault.to_account_info(),
			to: ctx.accounts.taker_ata_a.to_account_info(),
			authority: ctx.accounts.escrow.to_account_info(),
		}, &[seeds]), ctx.accounts.vault.amount)?;
		token::close_account(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), CloseAccount {
			account: ctx.accounts.vault.to_account_info(),
			destination: ctx.accounts.maker.to_account_info(),
			authority: ctx.accounts.escrow.to_account_info(),
		}, &[seeds]))?;
		Ok(())
	}

	pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
		let maker = ctx.accounts.escrow.maker;
		let seeds: &[&[u8]] = &[b"escrow", maker.as_ref(), &[ctx.accounts.escrow.bump]];
		token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), Transfer {
			from: ctx.accounts.vault.to_account_info(),
			to: ctx.accounts.maker_ata_a.to_account_info(),
			authority: ctx.accounts.escrow.to_account_info(),
		}, &[seeds]), ctx.accounts.vault.amount)?;
		token::close_account(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), CloseAccount {
			account: ctx.accounts.vault.to_account_info(),
			destination: ctx.accounts.maker.to_account_info(),
			authority: ctx.accounts.escrow.to_account_info(),
		}, &[seeds]))?;
		Ok(())
	}
}

#[account]
pub struct Escrow {
	pub maker: Pubkey,
	pub mint_a: Pubkey,
	pub mint_b: Pubkey,
	pub amount_b: u64,
	pub bump: u8,
}

#[derive(Accounts)]
pub struct Make<'info> {
	#[account(mut)]
	pub maker: Signer<'info>,
	pub mint_a: Account<'info, Mint>,
	pub mint_b: Account<'info, Mint>,
	#[account(init, payer = maker, space = 8 + 32 * 3 + 8 + 1, seeds = [b"escrow", maker.key().as_ref()], bump)]
	pub escrow: Account<'info, Escrow>,
	#[account(init, payer = maker, token::mint = mint_a, token::authority = escrow, seeds = [b"vault", escrow.key().as_ref()], bump)]
	pub vault: Account<'info, TokenAccount>,
	#[account(mut, token::mint = mint_a, token::authority = maker)]
	pub maker_ata_a: Account<'info, TokenAccount>,
	pub token_program: Program<'info, Token>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Take<'info> {
	pub taker: Signer<'info>,
	/// CHECK: bound by escrow.has_one = maker
	#[account(mut)]
	pub maker: UncheckedAccount<'info>,
	#[account(mut, has_one = maker, has_one = mint_a, has_one = mint_b, close = maker, seeds = [b"escrow", maker.key().as_ref()], bump = escrow.bump)]
	pub escrow: Account<'info, Escrow>,
	pub mint_a: Account<'info, Mint>,
	pub mint_b: Account<'info, Mint>,
	#[account(mut, seeds = [b"vault", escrow.key().as_ref()], bump)]
	pub vault: Account<'info, TokenAccount>,
	#[account(mut, token::mint = mint_a, token::authority = taker)]
	pub taker_ata_a: Account<'info, TokenAccount>,
	#[account(mut, token::mint = mint_b, token::authority = taker)]
	pub taker_ata_b: Account<'info, TokenAccount>,
	#[cfg_attr(not(feature = "v_recipient_unbound"), account(mut, token::mint = mint_b, token::authority = maker))]
	#[cfg_attr(feature = "v_recipient_unbound", account(mut))]
	pub maker_ata_b: Account<'info, TokenAccount>,
	pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Cancel<'info> {
	#[account(mut)]
	pub maker: Signer<'info>,
	#[cfg_attr(not(feature = "v_no_has_one"), account(mut, has_one = maker, close = maker))]
	#[cfg_attr(feature = "v_no_has_one", account(mut, close = maker))]
	pub escrow: Account<'info, Escrow>,
	#[account(mut, seeds = [b"vault", escrow.key().as_ref()], bump)]
	pub vault: Account<'info, TokenAccount>,
	#[account(mut, token::mint = escrow.mint_a, token::authority = maker)]
	pub maker_ata_a: Account<'info, TokenAccount>,
	pub token_program: Program<'info, Token>,
}
