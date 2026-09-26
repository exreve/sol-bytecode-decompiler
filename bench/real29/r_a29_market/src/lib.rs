// Realistic clean program (bench/README.md, bench/expected/r_a29_market.json): a fixed-price SPL token marketplace
// paid in SOL, Anchor 0.29.0. Validation styles: `address =` a hard-coded admin for the init, has_one, constraint with
// custom errors, `address = listing.seller` on the payee, PDA escrow authority, token::mint / token::authority,
// system transfers into a PDA fee vault and out of it with the PDA's signature, token close_account, Anchor close,
// a permissionless sweep of sold-out listings (rent to the stored seller), checked u128 math, events.
// Every instruction is meant to be correct as written.
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, Transfer};

declare_id!("E8kSAFnyqQdXis8mCgX3pAXyG3ZLasYJX9AYEAVyRhZh");

pub const ADMIN: Pubkey = anchor_lang::solana_program::pubkey!("7V9AK5ajzwSUwFGigSKNU9BzSaEY9hggT65HgqmAR8dx");
pub const MARKET_SEED: &[u8] = b"market";
pub const FEE_VAULT_SEED: &[u8] = b"fee_vault";
pub const LISTING_SEED: &[u8] = b"listing";
pub const ESCROW_SEED: &[u8] = b"escrow";
pub const MAX_FEE_BPS: u16 = 500;

#[program]
pub mod token_market {
	use super::*;

	pub fn init_market(ctx: Context<InitMarket>, fee_bps: u16) -> Result<()> {
		require!(fee_bps <= MAX_FEE_BPS, MarketError::FeeTooHigh);
		let market = &mut ctx.accounts.market;
		market.admin = ctx.accounts.admin.key();
		market.fee_bps = fee_bps;
		market.paused = false;
		market.bump = ctx.bumps.market;
		market.fee_vault_bump = ctx.bumps.fee_vault;
		// fund the fee vault's rent-exempt minimum so that any fee can be paid into it
		let rent = Rent::get()?.minimum_balance(0).saturating_sub(ctx.accounts.fee_vault.lamports());
		if rent > 0 {
			system_program::transfer(
				CpiContext::new(ctx.accounts.system_program.to_account_info(), system_program::Transfer { from: ctx.accounts.admin.to_account_info(), to: ctx.accounts.fee_vault.to_account_info() }),
				rent,
			)?;
		}
		Ok(())
	}

	pub fn set_fee(ctx: Context<MarketAdmin>, fee_bps: u16) -> Result<()> {
		require!(fee_bps <= MAX_FEE_BPS, MarketError::FeeTooHigh);
		ctx.accounts.market.fee_bps = fee_bps;
		Ok(())
	}

	pub fn set_paused(ctx: Context<SetPaused>, paused: bool) -> Result<()> {
		ctx.accounts.market.paused = paused;
		Ok(())
	}

	/// Both the current and the new admin sign.
	pub fn transfer_admin(ctx: Context<TransferAdmin>) -> Result<()> {
		ctx.accounts.market.admin = ctx.accounts.new_admin.key();
		msg!("market admin changed");
		Ok(())
	}

	/// The admin withdraws collected fees to a destination of its choice; the vault stays rent-exempt.
	pub fn withdraw_fees(ctx: Context<WithdrawFees>, amount: u64) -> Result<()> {
		let rent = Rent::get()?.minimum_balance(0);
		let available = ctx.accounts.fee_vault.lamports().saturating_sub(rent);
		require!(amount <= available, MarketError::InsufficientFees);
		let seeds: &[&[u8]] = &[FEE_VAULT_SEED, &[ctx.accounts.market.fee_vault_bump]];
		system_program::transfer(
			CpiContext::new_with_signer(
				ctx.accounts.system_program.to_account_info(),
				system_program::Transfer { from: ctx.accounts.fee_vault.to_account_info(), to: ctx.accounts.destination.to_account_info() },
				&[seeds],
			),
			amount,
		)?;
		emit!(FeesWithdrawn { amount, destination: ctx.accounts.destination.key() });
		Ok(())
	}

	pub fn list(ctx: Context<List>, price: u64, amount: u64) -> Result<()> {
		require!(!ctx.accounts.market.paused, MarketError::Paused);
		require!(price > 0 && amount > 0, MarketError::InvalidAmount);
		token::transfer(
			CpiContext::new(
				ctx.accounts.token_program.to_account_info(),
				Transfer { from: ctx.accounts.seller_token.to_account_info(), to: ctx.accounts.escrow.to_account_info(), authority: ctx.accounts.seller.to_account_info() },
			),
			amount,
		)?;
		let listing = &mut ctx.accounts.listing;
		listing.seller = ctx.accounts.seller.key();
		listing.mint = ctx.accounts.mint.key();
		listing.escrow = ctx.accounts.escrow.key();
		listing.price = price;
		listing.remaining = amount;
		listing.bump = ctx.bumps.listing;
		listing.escrow_bump = ctx.bumps.escrow;
		emit!(Listed { listing: listing.key(), seller: listing.seller, mint: listing.mint, price, amount });
		Ok(())
	}

	pub fn update_price(ctx: Context<UpdatePrice>, price: u64) -> Result<()> {
		require!(price > 0, MarketError::InvalidAmount);
		ctx.accounts.listing.price = price;
		Ok(())
	}

	/// The seller takes back what is left and closes the listing.
	pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> {
		let listing = &ctx.accounts.listing;
		let (seller, mint) = (listing.seller, listing.mint);
		let seeds: &[&[u8]] = &[LISTING_SEED, seller.as_ref(), mint.as_ref(), &[listing.bump]];
		let program = ctx.accounts.token_program.to_account_info();
		let remaining = ctx.accounts.escrow.amount;
		if remaining > 0 {
			token::transfer(
				CpiContext::new_with_signer(
					program.clone(),
					Transfer { from: ctx.accounts.escrow.to_account_info(), to: ctx.accounts.seller_token.to_account_info(), authority: ctx.accounts.listing.to_account_info() },
					&[seeds],
				),
				remaining,
			)?;
		}
		token::close_account(CpiContext::new_with_signer(
			program,
			CloseAccount { account: ctx.accounts.escrow.to_account_info(), destination: ctx.accounts.seller.to_account_info(), authority: ctx.accounts.listing.to_account_info() },
			&[seeds],
		))?;
		Ok(())
	}

	pub fn buy(ctx: Context<Buy>, amount: u64, max_price: u64) -> Result<()> {
		require!(!ctx.accounts.market.paused, MarketError::Paused);
		let listing = &ctx.accounts.listing;
		require!(amount > 0 && amount <= listing.remaining, MarketError::InvalidAmount);
		require!(listing.price <= max_price, MarketError::PriceChanged);
		let cost = listing.price.checked_mul(amount).ok_or(MarketError::MathOverflow)?;
		let fee = u64::try_from((cost as u128) * (ctx.accounts.market.fee_bps as u128) / 10_000).map_err(|_| MarketError::MathOverflow)?;
		let proceeds = cost.checked_sub(fee).ok_or(MarketError::MathOverflow)?;
		let system = ctx.accounts.system_program.to_account_info();
		system_program::transfer(
			CpiContext::new(system.clone(), system_program::Transfer { from: ctx.accounts.buyer.to_account_info(), to: ctx.accounts.seller.to_account_info() }),
			proceeds,
		)?;
		if fee > 0 {
			system_program::transfer(
				CpiContext::new(system, system_program::Transfer { from: ctx.accounts.buyer.to_account_info(), to: ctx.accounts.fee_vault.to_account_info() }),
				fee,
			)?;
		}
		let (seller, mint, bump) = (listing.seller, listing.mint, listing.bump);
		let seeds: &[&[u8]] = &[LISTING_SEED, seller.as_ref(), mint.as_ref(), &[bump]];
		token::transfer(
			CpiContext::new_with_signer(
				ctx.accounts.token_program.to_account_info(),
				Transfer { from: ctx.accounts.escrow.to_account_info(), to: ctx.accounts.buyer_token.to_account_info(), authority: ctx.accounts.listing.to_account_info() },
				&[seeds],
			),
			amount,
		)?;
		let listing = &mut ctx.accounts.listing;
		listing.remaining -= amount;
		emit!(Sold { listing: listing.key(), buyer: ctx.accounts.buyer.key(), amount, cost, fee });
		Ok(())
	}

	/// Permissionless: closes a sold-out listing and its empty escrow; both rents go to the stored seller.
	pub fn sweep_listing(ctx: Context<SweepListing>) -> Result<()> {
		let listing = &ctx.accounts.listing;
		let seeds: &[&[u8]] = &[LISTING_SEED, listing.seller.as_ref(), listing.mint.as_ref(), &[listing.bump]];
		token::close_account(CpiContext::new_with_signer(
			ctx.accounts.token_program.to_account_info(),
			CloseAccount { account: ctx.accounts.escrow.to_account_info(), destination: ctx.accounts.seller.to_account_info(), authority: ctx.accounts.listing.to_account_info() },
			&[seeds],
		))?;
		Ok(())
	}
}

#[derive(Accounts)]
pub struct InitMarket<'info> {
	#[account(mut, address = ADMIN @ MarketError::Unauthorized)]
	pub admin: Signer<'info>,
	#[account(init, payer = admin, space = 8 + Market::INIT_SPACE, seeds = [MARKET_SEED], bump)]
	pub market: Account<'info, Market>,
	/// the fee vault: a system-owned PDA holding lamports, funded to its rent-exempt minimum here
	#[account(mut, seeds = [FEE_VAULT_SEED], bump)]
	pub fee_vault: SystemAccount<'info>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MarketAdmin<'info> {
	#[account(mut, seeds = [MARKET_SEED], bump = market.bump, has_one = admin @ MarketError::Unauthorized)]
	pub market: Account<'info, Market>,
	pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetPaused<'info> {
	#[account(mut, seeds = [MARKET_SEED], bump = market.bump, constraint = market.admin == admin.key() @ MarketError::Unauthorized)]
	pub market: Account<'info, Market>,
	pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferAdmin<'info> {
	#[account(mut, seeds = [MARKET_SEED], bump = market.bump, has_one = admin @ MarketError::Unauthorized)]
	pub market: Account<'info, Market>,
	pub admin: Signer<'info>,
	pub new_admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawFees<'info> {
	#[account(seeds = [MARKET_SEED], bump = market.bump, has_one = admin @ MarketError::Unauthorized)]
	pub market: Account<'info, Market>,
	pub admin: Signer<'info>,
	#[account(mut, seeds = [FEE_VAULT_SEED], bump = market.fee_vault_bump)]
	pub fee_vault: SystemAccount<'info>,
	/// CHECK: any account the admin chooses to receive the fees
	#[account(mut)]
	pub destination: UncheckedAccount<'info>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct List<'info> {
	#[account(mut)]
	pub seller: Signer<'info>,
	#[account(seeds = [MARKET_SEED], bump = market.bump)]
	pub market: Account<'info, Market>,
	pub mint: Account<'info, Mint>,
	#[account(mut, token::mint = mint, token::authority = seller)]
	pub seller_token: Account<'info, TokenAccount>,
	#[account(init, payer = seller, space = 8 + Listing::INIT_SPACE, seeds = [LISTING_SEED, seller.key().as_ref(), mint.key().as_ref()], bump)]
	pub listing: Account<'info, Listing>,
	#[account(init, payer = seller, seeds = [ESCROW_SEED, listing.key().as_ref()], bump, token::mint = mint, token::authority = listing)]
	pub escrow: Account<'info, TokenAccount>,
	pub token_program: Program<'info, Token>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePrice<'info> {
	#[account(mut, has_one = seller @ MarketError::Unauthorized)]
	pub listing: Account<'info, Listing>,
	pub seller: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelListing<'info> {
	#[account(mut)]
	pub seller: Signer<'info>,
	#[account(mut, seeds = [LISTING_SEED, seller.key().as_ref(), listing.mint.as_ref()], bump = listing.bump, has_one = seller @ MarketError::Unauthorized, has_one = escrow @ MarketError::InvalidEscrow, close = seller)]
	pub listing: Account<'info, Listing>,
	#[account(mut)]
	pub escrow: Account<'info, TokenAccount>,
	/// the seller's choice of destination for its own tokens, of the listed mint
	#[account(mut, token::mint = listing.mint)]
	pub seller_token: Account<'info, TokenAccount>,
	pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Buy<'info> {
	#[account(mut)]
	pub buyer: Signer<'info>,
	#[account(seeds = [MARKET_SEED], bump = market.bump)]
	pub market: Account<'info, Market>,
	#[account(mut, seeds = [LISTING_SEED, listing.seller.as_ref(), listing.mint.as_ref()], bump = listing.bump, has_one = escrow @ MarketError::InvalidEscrow)]
	pub listing: Account<'info, Listing>,
	#[account(mut)]
	pub escrow: Account<'info, TokenAccount>,
	/// CHECK: the payee: must be the listing's seller
	#[account(mut, address = listing.seller @ MarketError::Unauthorized)]
	pub seller: UncheckedAccount<'info>,
	#[account(mut, seeds = [FEE_VAULT_SEED], bump = market.fee_vault_bump)]
	pub fee_vault: SystemAccount<'info>,
	/// the buyer's choice of destination, of the listed mint
	#[account(mut, token::mint = listing.mint)]
	pub buyer_token: Account<'info, TokenAccount>,
	pub token_program: Program<'info, Token>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SweepListing<'info> {
	#[account(mut, seeds = [LISTING_SEED, listing.seller.as_ref(), listing.mint.as_ref()], bump = listing.bump, has_one = escrow @ MarketError::InvalidEscrow, has_one = seller @ MarketError::Unauthorized, constraint = listing.remaining == 0 @ MarketError::NotSoldOut, close = seller)]
	pub listing: Account<'info, Listing>,
	#[account(mut)]
	pub escrow: Account<'info, TokenAccount>,
	/// CHECK: receives the rents: must be the listing's seller (has_one)
	#[account(mut)]
	pub seller: UncheckedAccount<'info>,
	pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct Market {
	pub admin: Pubkey,
	pub fee_bps: u16,
	pub paused: bool,
	pub bump: u8,
	pub fee_vault_bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Listing {
	pub seller: Pubkey,
	pub mint: Pubkey,
	pub escrow: Pubkey,
	pub price: u64,
	pub remaining: u64,
	pub bump: u8,
	pub escrow_bump: u8,
}

#[event]
pub struct Listed {
	pub listing: Pubkey,
	pub seller: Pubkey,
	pub mint: Pubkey,
	pub price: u64,
	pub amount: u64,
}

#[event]
pub struct Sold {
	pub listing: Pubkey,
	pub buyer: Pubkey,
	pub amount: u64,
	pub cost: u64,
	pub fee: u64,
}

#[event]
pub struct FeesWithdrawn {
	pub amount: u64,
	pub destination: Pubkey,
}

#[error_code]
pub enum MarketError {
	#[msg("not authorized")]
	Unauthorized,
	#[msg("fee above the maximum")]
	FeeTooHigh,
	#[msg("market is paused")]
	Paused,
	#[msg("invalid amount or price")]
	InvalidAmount,
	#[msg("price above the buyer's maximum")]
	PriceChanged,
	#[msg("escrow does not belong to the listing")]
	InvalidEscrow,
	#[msg("listing is not sold out")]
	NotSoldOut,
	#[msg("not enough fees collected")]
	InsufficientFees,
	#[msg("arithmetic overflow")]
	MathOverflow,
}
