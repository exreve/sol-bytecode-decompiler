// Realistic clean program (bench/README.md, bench/expected/r_a31_staking.json): an SPL token staking pool paying a
// reward stream, with a global fee config. Validation in the styles real Anchor code uses: has_one / address /
// constraint with custom errors, seeds with stored bumps, token / associated_token constraints, the upgrade authority
// gate on the one-time config init, a helper doing the admin check, permissionless instructions (reward funding,
// payer-funded position, crank, batch sync over remaining accounts validated one by one), Anchor close, checked u128
// math, a zero-copy stats account, events. Every instruction is meant to be correct as written.
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Da8iRYKozKr2XYpuUT7NayMotUGDG4oUqbRtWT3UhdSY");

pub const CONFIG_SEED: &[u8] = b"config";
pub const POOL_SEED: &[u8] = b"pool";
pub const STAKE_VAULT_SEED: &[u8] = b"stake_vault";
pub const REWARD_VAULT_SEED: &[u8] = b"reward_vault";
pub const POSITION_SEED: &[u8] = b"position";
pub const STATS_SEED: &[u8] = b"stats";
pub const MAX_FEE_BPS: u16 = 1_000;
pub const MAX_REWARD_RATE: u64 = 1_000_000_000_000;
pub const PRECISION: u128 = 1_000_000_000_000;
pub const BPS: u128 = 10_000;

#[program]
pub mod staking_pool {
	use super::*;

	/// One-time setup by the program's upgrade authority.
	pub fn init_config(ctx: Context<InitConfig>, fee_bps: u16, treasury: Pubkey) -> Result<()> {
		require!(fee_bps <= MAX_FEE_BPS, StakeError::FeeTooHigh);
		let config = &mut ctx.accounts.config;
		config.admin = ctx.accounts.admin.key();
		config.pending_admin = Pubkey::default();
		config.treasury = treasury;
		config.fee_bps = fee_bps;
		config.paused = false;
		config.bump = ctx.bumps.config;
		emit!(ConfigUpdated { admin: config.admin, fee_bps, treasury, paused: false });
		Ok(())
	}

	pub fn propose_admin(ctx: Context<AdminOnly>, new_admin: Pubkey) -> Result<()> {
		ctx.accounts.config.pending_admin = new_admin;
		msg!("admin proposed: {}", new_admin);
		Ok(())
	}

	pub fn accept_admin(ctx: Context<AcceptAdmin>) -> Result<()> {
		let config = &mut ctx.accounts.config;
		config.admin = ctx.accounts.new_admin.key();
		config.pending_admin = Pubkey::default();
		emit!(ConfigUpdated { admin: config.admin, fee_bps: config.fee_bps, treasury: config.treasury, paused: config.paused });
		Ok(())
	}

	pub fn set_fee(ctx: Context<SetFee>, fee_bps: u16) -> Result<()> {
		require!(fee_bps <= MAX_FEE_BPS, StakeError::FeeTooHigh);
		ctx.accounts.config.fee_bps = fee_bps;
		Ok(())
	}

	pub fn set_paused(ctx: Context<SetPaused>, paused: bool) -> Result<()> {
		only_admin(&ctx.accounts.config, &ctx.accounts.admin)?;
		ctx.accounts.config.paused = paused;
		msg!("paused: {}", paused);
		Ok(())
	}

	pub fn set_treasury(ctx: Context<AdminOnly>, treasury: Pubkey) -> Result<()> {
		ctx.accounts.config.treasury = treasury;
		Ok(())
	}

	pub fn create_pool(ctx: Context<CreatePool>, reward_rate: u64) -> Result<()> {
		require!(reward_rate <= MAX_REWARD_RATE, StakeError::RateTooHigh);
		let now = Clock::get()?.unix_timestamp;
		let pool = &mut ctx.accounts.pool;
		pool.stake_mint = ctx.accounts.stake_mint.key();
		pool.reward_mint = ctx.accounts.reward_mint.key();
		pool.stake_vault = ctx.accounts.stake_vault.key();
		pool.reward_vault = ctx.accounts.reward_vault.key();
		pool.reward_rate = reward_rate;
		pool.total_staked = 0;
		pool.acc_reward_per_share = 0;
		pool.last_update_ts = now;
		pool.rewards_funded = 0;
		pool.bump = ctx.bumps.pool;
		pool.stats_bump = ctx.bumps.stats;
		let mut stats = ctx.accounts.stats.load_init()?;
		stats.pool = pool.key();
		stats.last_crank_ts = now;
		Ok(())
	}

	pub fn set_reward_rate(ctx: Context<SetRewardRate>, reward_rate: u64) -> Result<()> {
		require!(reward_rate <= MAX_REWARD_RATE, StakeError::RateTooHigh);
		let pool = &mut ctx.accounts.pool;
		accrue(pool, Clock::get()?.unix_timestamp)?;
		pool.reward_rate = reward_rate;
		Ok(())
	}

	/// Anyone may pay the rent of a position for any wallet: the position only records that wallet as its owner.
	pub fn open_position(ctx: Context<OpenPosition>) -> Result<()> {
		let position = &mut ctx.accounts.position;
		position.owner = ctx.accounts.owner.key();
		position.pool = ctx.accounts.pool.key();
		position.amount = 0;
		position.reward_debt = 0;
		position.pending = 0;
		position.bump = ctx.bumps.position;
		Ok(())
	}

	pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
		require!(amount > 0, StakeError::ZeroAmount);
		require!(!ctx.accounts.config.paused, StakeError::Paused);
		let pool = &mut ctx.accounts.pool;
		let position = &mut ctx.accounts.position;
		accrue(pool, Clock::get()?.unix_timestamp)?;
		settle(position, pool.acc_reward_per_share)?;
		token::transfer(
			CpiContext::new(
				ctx.accounts.token_program.to_account_info(),
				Transfer {
					from: ctx.accounts.user_stake.to_account_info(),
					to: ctx.accounts.stake_vault.to_account_info(),
					authority: ctx.accounts.owner.to_account_info(),
				},
			),
			amount,
		)?;
		position.amount = position.amount.checked_add(amount).ok_or(StakeError::MathOverflow)?;
		pool.total_staked = pool.total_staked.checked_add(amount).ok_or(StakeError::MathOverflow)?;
		position.reward_debt = reward_debt(position.amount, pool.acc_reward_per_share)?;
		emit!(Staked { pool: pool.key(), owner: position.owner, amount });
		Ok(())
	}

	/// Always allowed, even while paused: users can exit.
	pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
		require!(amount > 0, StakeError::ZeroAmount);
		let pool = &mut ctx.accounts.pool;
		let position = &mut ctx.accounts.position;
		require!(amount <= position.amount, StakeError::InsufficientStake);
		accrue(pool, Clock::get()?.unix_timestamp)?;
		settle(position, pool.acc_reward_per_share)?;
		position.amount -= amount;
		pool.total_staked = pool.total_staked.checked_sub(amount).ok_or(StakeError::MathOverflow)?;
		position.reward_debt = reward_debt(position.amount, pool.acc_reward_per_share)?;

		let fee = u64::try_from((amount as u128) * (ctx.accounts.config.fee_bps as u128) / BPS).map_err(|_| StakeError::MathOverflow)?;
		let payout = amount.checked_sub(fee).ok_or(StakeError::MathOverflow)?;
		let stake_mint = pool.stake_mint;
		let seeds: &[&[u8]] = &[POOL_SEED, stake_mint.as_ref(), &[pool.bump]];
		let signer = &[seeds];
		let program = ctx.accounts.token_program.to_account_info();
		let authority = pool.to_account_info();
		token::transfer(
			CpiContext::new_with_signer(
				program.clone(),
				Transfer { from: ctx.accounts.stake_vault.to_account_info(), to: ctx.accounts.user_stake.to_account_info(), authority: authority.clone() },
				signer,
			),
			payout,
		)?;
		if fee > 0 {
			token::transfer(
				CpiContext::new_with_signer(
					program,
					Transfer { from: ctx.accounts.stake_vault.to_account_info(), to: ctx.accounts.treasury_token.to_account_info(), authority },
					signer,
				),
				fee,
			)?;
		}
		emit!(Unstaked { pool: pool.key(), owner: position.owner, amount, fee });
		Ok(())
	}

	/// Pays what the reward vault holds, up to the position's pending rewards; the rest stays pending.
	pub fn claim(ctx: Context<Claim>) -> Result<()> {
		let pool = &mut ctx.accounts.pool;
		let position = &mut ctx.accounts.position;
		accrue(pool, Clock::get()?.unix_timestamp)?;
		settle(position, pool.acc_reward_per_share)?;
		let pay = position.pending.min(ctx.accounts.reward_vault.amount);
		if pay == 0 {
			return Ok(());
		}
		position.pending = position.pending.saturating_sub(pay);
		let stake_mint = pool.stake_mint;
		let seeds: &[&[u8]] = &[POOL_SEED, stake_mint.as_ref(), &[pool.bump]];
		token::transfer(
			CpiContext::new_with_signer(
				ctx.accounts.token_program.to_account_info(),
				Transfer { from: ctx.accounts.reward_vault.to_account_info(), to: ctx.accounts.user_reward.to_account_info(), authority: pool.to_account_info() },
				&[seeds],
			),
			pay,
		)?;
		let mut stats = ctx.accounts.stats.load_mut()?;
		stats.total_claimed = stats.total_claimed.saturating_add(pay);
		emit!(Claimed { pool: pool.key(), owner: position.owner, amount: pay });
		Ok(())
	}

	/// Permissionless: anyone can top up a pool's reward vault from its own token account.
	pub fn fund_rewards(ctx: Context<FundRewards>, amount: u64) -> Result<()> {
		require!(amount > 0, StakeError::ZeroAmount);
		token::transfer(
			CpiContext::new(
				ctx.accounts.token_program.to_account_info(),
				Transfer {
					from: ctx.accounts.funder_token.to_account_info(),
					to: ctx.accounts.reward_vault.to_account_info(),
					authority: ctx.accounts.funder.to_account_info(),
				},
			),
			amount,
		)?;
		let pool = &mut ctx.accounts.pool;
		pool.rewards_funded = pool.rewards_funded.checked_add(amount).ok_or(StakeError::MathOverflow)?;
		emit!(RewardsFunded { pool: pool.key(), funder: ctx.accounts.funder.key(), amount });
		Ok(())
	}

	/// Permissionless crank: brings the reward index up to date and records it in the stats ring buffer.
	pub fn crank(ctx: Context<Crank>) -> Result<()> {
		let now = Clock::get()?.unix_timestamp;
		let pool = &mut ctx.accounts.pool;
		accrue(pool, now)?;
		let mut stats = ctx.accounts.stats.load_mut()?;
		let slot = (stats.head % HISTORY as u64) as usize;
		stats.history[slot] = pool.acc_reward_per_share as u64;
		stats.head = stats.head.wrapping_add(1);
		stats.crank_count = stats.crank_count.saturating_add(1);
		stats.last_crank_ts = now;
		Ok(())
	}

	/// Permissionless: settles the pending rewards of the pool's positions passed as remaining accounts (each one
	/// checked: program-owned Position, of this pool, writable). Moves no value: only what each owner could settle.
	pub fn sync_positions<'info>(ctx: Context<'_, '_, 'info, 'info, SyncPositions<'info>>) -> Result<()> {
		let pool = &mut ctx.accounts.pool;
		accrue(pool, Clock::get()?.unix_timestamp)?;
		let acc = pool.acc_reward_per_share;
		let pool_key = pool.key();
		let mut synced: u32 = 0;
		for info in ctx.remaining_accounts.iter() {
			require_keys_eq!(*info.owner, crate::ID, StakeError::InvalidPosition);
			require!(info.is_writable, StakeError::InvalidPosition);
			let mut position: Account<'info, Position> = Account::try_from(info)?;
			require_keys_eq!(position.pool, pool_key, StakeError::InvalidPosition);
			settle(&mut position, acc)?;
			position.exit(&crate::ID)?;
			synced = synced.checked_add(1).ok_or(StakeError::MathOverflow)?;
		}
		msg!("synced {} positions", synced);
		Ok(())
	}

	pub fn close_position(ctx: Context<ClosePosition>) -> Result<()> {
		require!(ctx.accounts.position.amount == 0, StakeError::PositionNotEmpty);
		require!(ctx.accounts.position.pending == 0, StakeError::PositionNotEmpty);
		Ok(())
	}
}

fn only_admin(config: &Config, admin: &Signer) -> Result<()> {
	require_keys_eq!(config.admin, admin.key(), StakeError::Unauthorized);
	Ok(())
}

/// Brings the pool's reward index up to `now` (never moves backwards).
fn accrue(pool: &mut Pool, now: i64) -> Result<()> {
	if now <= pool.last_update_ts {
		return Ok(());
	}
	if pool.total_staked > 0 {
		let elapsed = u128::try_from(now - pool.last_update_ts).map_err(|_| StakeError::MathOverflow)?;
		let increment = elapsed
			.checked_mul(pool.reward_rate as u128)
			.and_then(|r| r.checked_mul(PRECISION))
			.and_then(|r| r.checked_div(pool.total_staked as u128))
			.ok_or(StakeError::MathOverflow)?;
		pool.acc_reward_per_share = pool.acc_reward_per_share.checked_add(increment).ok_or(StakeError::MathOverflow)?;
	}
	pool.last_update_ts = now;
	Ok(())
}

fn reward_debt(amount: u64, acc: u128) -> Result<u128> {
	Ok((amount as u128).checked_mul(acc).ok_or(StakeError::MathOverflow)? / PRECISION)
}

/// Moves the rewards accrued since the last settlement into `pending`.
fn settle(position: &mut Position, acc: u128) -> Result<()> {
	let accrued = reward_debt(position.amount, acc)?;
	let owed = accrued.checked_sub(position.reward_debt).ok_or(StakeError::MathOverflow)?;
	let owed = u64::try_from(owed).map_err(|_| StakeError::MathOverflow)?;
	position.pending = position.pending.checked_add(owed).ok_or(StakeError::MathOverflow)?;
	position.reward_debt = accrued;
	Ok(())
}

#[derive(Accounts)]
pub struct InitConfig<'info> {
	#[account(mut)]
	pub admin: Signer<'info>,
	#[account(init, payer = admin, space = 8 + Config::INIT_SPACE, seeds = [CONFIG_SEED], bump)]
	pub config: Account<'info, Config>,
	#[account(constraint = program.programdata_address()? == Some(program_data.key()) @ StakeError::InvalidProgramData)]
	pub program: Program<'info, crate::program::StakingPool>,
	#[account(constraint = program_data.upgrade_authority_address == Some(admin.key()) @ StakeError::Unauthorized)]
	pub program_data: Account<'info, ProgramData>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AdminOnly<'info> {
	#[account(mut, seeds = [CONFIG_SEED], bump = config.bump, has_one = admin @ StakeError::Unauthorized)]
	pub config: Account<'info, Config>,
	pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct AcceptAdmin<'info> {
	#[account(mut, seeds = [CONFIG_SEED], bump = config.bump, constraint = config.pending_admin == new_admin.key() @ StakeError::NotPendingAdmin)]
	pub config: Account<'info, Config>,
	pub new_admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetFee<'info> {
	#[account(mut, seeds = [CONFIG_SEED], bump = config.bump)]
	pub config: Account<'info, Config>,
	#[account(address = config.admin @ StakeError::Unauthorized)]
	pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetPaused<'info> {
	#[account(mut, seeds = [CONFIG_SEED], bump = config.bump)]
	pub config: Account<'info, Config>,
	/// checked against config.admin by only_admin
	pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct CreatePool<'info> {
	#[account(mut)]
	pub admin: Signer<'info>,
	#[account(seeds = [CONFIG_SEED], bump = config.bump, has_one = admin @ StakeError::Unauthorized)]
	pub config: Account<'info, Config>,
	pub stake_mint: Account<'info, Mint>,
	#[account(constraint = reward_mint.key() != stake_mint.key() @ StakeError::SameMint)]
	pub reward_mint: Account<'info, Mint>,
	#[account(init, payer = admin, space = 8 + Pool::INIT_SPACE, seeds = [POOL_SEED, stake_mint.key().as_ref()], bump)]
	pub pool: Account<'info, Pool>,
	#[account(init, payer = admin, seeds = [STAKE_VAULT_SEED, pool.key().as_ref()], bump, token::mint = stake_mint, token::authority = pool)]
	pub stake_vault: Account<'info, TokenAccount>,
	#[account(init, payer = admin, seeds = [REWARD_VAULT_SEED, pool.key().as_ref()], bump, token::mint = reward_mint, token::authority = pool)]
	pub reward_vault: Account<'info, TokenAccount>,
	#[account(init, payer = admin, space = 8 + std::mem::size_of::<PoolStats>(), seeds = [STATS_SEED, pool.key().as_ref()], bump)]
	pub stats: AccountLoader<'info, PoolStats>,
	pub token_program: Program<'info, Token>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetRewardRate<'info> {
	#[account(seeds = [CONFIG_SEED], bump = config.bump, has_one = admin @ StakeError::Unauthorized)]
	pub config: Account<'info, Config>,
	pub admin: Signer<'info>,
	#[account(mut, seeds = [POOL_SEED, pool.stake_mint.as_ref()], bump = pool.bump)]
	pub pool: Account<'info, Pool>,
}

#[derive(Accounts)]
pub struct OpenPosition<'info> {
	#[account(mut)]
	pub payer: Signer<'info>,
	/// CHECK: any wallet; only its key is recorded as the position's owner (and seeds the position PDA)
	pub owner: UncheckedAccount<'info>,
	#[account(seeds = [POOL_SEED, pool.stake_mint.as_ref()], bump = pool.bump)]
	pub pool: Account<'info, Pool>,
	#[account(init, payer = payer, space = 8 + Position::INIT_SPACE, seeds = [POSITION_SEED, pool.key().as_ref(), owner.key().as_ref()], bump)]
	pub position: Account<'info, Position>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
	#[account(seeds = [CONFIG_SEED], bump = config.bump)]
	pub config: Account<'info, Config>,
	#[account(mut, seeds = [POOL_SEED, pool.stake_mint.as_ref()], bump = pool.bump, has_one = stake_vault @ StakeError::InvalidVault)]
	pub pool: Account<'info, Pool>,
	#[account(mut, seeds = [POSITION_SEED, pool.key().as_ref(), owner.key().as_ref()], bump = position.bump, has_one = owner @ StakeError::Unauthorized, has_one = pool @ StakeError::InvalidPosition)]
	pub position: Account<'info, Position>,
	pub owner: Signer<'info>,
	#[account(mut, token::mint = pool.stake_mint, token::authority = owner)]
	pub user_stake: Account<'info, TokenAccount>,
	#[account(mut)]
	pub stake_vault: Account<'info, TokenAccount>,
	pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
	#[account(seeds = [CONFIG_SEED], bump = config.bump)]
	pub config: Account<'info, Config>,
	#[account(mut, seeds = [POOL_SEED, pool.stake_mint.as_ref()], bump = pool.bump, has_one = stake_vault @ StakeError::InvalidVault, has_one = stake_mint @ StakeError::InvalidMint)]
	pub pool: Account<'info, Pool>,
	#[account(mut, seeds = [POSITION_SEED, pool.key().as_ref(), owner.key().as_ref()], bump = position.bump, has_one = owner @ StakeError::Unauthorized, has_one = pool @ StakeError::InvalidPosition)]
	pub position: Account<'info, Position>,
	pub owner: Signer<'info>,
	pub stake_mint: Account<'info, Mint>,
	/// the owner's choice of destination, of the stake mint
	#[account(mut, token::mint = stake_mint)]
	pub user_stake: Account<'info, TokenAccount>,
	#[account(mut)]
	pub stake_vault: Account<'info, TokenAccount>,
	#[account(mut, associated_token::mint = stake_mint, associated_token::authority = config.treasury)]
	pub treasury_token: Account<'info, TokenAccount>,
	pub token_program: Program<'info, Token>,
	pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
	#[account(mut, seeds = [POOL_SEED, pool.stake_mint.as_ref()], bump = pool.bump, has_one = reward_vault @ StakeError::InvalidVault)]
	pub pool: Account<'info, Pool>,
	#[account(mut, seeds = [POSITION_SEED, pool.key().as_ref(), owner.key().as_ref()], bump = position.bump, has_one = owner @ StakeError::Unauthorized, has_one = pool @ StakeError::InvalidPosition)]
	pub position: Account<'info, Position>,
	pub owner: Signer<'info>,
	#[account(mut, token::mint = pool.reward_mint)]
	pub user_reward: Account<'info, TokenAccount>,
	#[account(mut)]
	pub reward_vault: Account<'info, TokenAccount>,
	#[account(mut, seeds = [STATS_SEED, pool.key().as_ref()], bump = pool.stats_bump)]
	pub stats: AccountLoader<'info, PoolStats>,
	pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct FundRewards<'info> {
	pub funder: Signer<'info>,
	#[account(mut, seeds = [POOL_SEED, pool.stake_mint.as_ref()], bump = pool.bump, has_one = reward_vault @ StakeError::InvalidVault)]
	pub pool: Account<'info, Pool>,
	#[account(mut, token::mint = pool.reward_mint, token::authority = funder)]
	pub funder_token: Account<'info, TokenAccount>,
	#[account(mut)]
	pub reward_vault: Account<'info, TokenAccount>,
	pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Crank<'info> {
	pub cranker: Signer<'info>,
	#[account(mut, seeds = [POOL_SEED, pool.stake_mint.as_ref()], bump = pool.bump)]
	pub pool: Account<'info, Pool>,
	#[account(mut, seeds = [STATS_SEED, pool.key().as_ref()], bump = pool.stats_bump)]
	pub stats: AccountLoader<'info, PoolStats>,
}

#[derive(Accounts)]
pub struct SyncPositions<'info> {
	#[account(mut, seeds = [POOL_SEED, pool.stake_mint.as_ref()], bump = pool.bump)]
	pub pool: Account<'info, Pool>,
}

#[derive(Accounts)]
pub struct ClosePosition<'info> {
	#[account(mut)]
	pub owner: Signer<'info>,
	#[account(mut, has_one = owner @ StakeError::Unauthorized, close = owner)]
	pub position: Account<'info, Position>,
}

#[account]
#[derive(InitSpace)]
pub struct Config {
	pub admin: Pubkey,
	pub pending_admin: Pubkey,
	pub treasury: Pubkey,
	pub fee_bps: u16,
	pub paused: bool,
	pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Pool {
	pub stake_mint: Pubkey,
	pub reward_mint: Pubkey,
	pub stake_vault: Pubkey,
	pub reward_vault: Pubkey,
	pub reward_rate: u64,
	pub total_staked: u64,
	pub acc_reward_per_share: u128,
	pub last_update_ts: i64,
	pub rewards_funded: u64,
	pub bump: u8,
	pub stats_bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Position {
	pub owner: Pubkey,
	pub pool: Pubkey,
	pub amount: u64,
	pub reward_debt: u128,
	pub pending: u64,
	pub bump: u8,
}

pub const HISTORY: usize = 16;

#[account(zero_copy)]
pub struct PoolStats {
	pub pool: Pubkey,
	pub crank_count: u64,
	pub last_crank_ts: i64,
	pub total_claimed: u64,
	pub head: u64,
	pub history: [u64; HISTORY],
}

#[event]
pub struct ConfigUpdated {
	pub admin: Pubkey,
	pub fee_bps: u16,
	pub treasury: Pubkey,
	pub paused: bool,
}

#[event]
pub struct Staked {
	pub pool: Pubkey,
	pub owner: Pubkey,
	pub amount: u64,
}

#[event]
pub struct Unstaked {
	pub pool: Pubkey,
	pub owner: Pubkey,
	pub amount: u64,
	pub fee: u64,
}

#[event]
pub struct Claimed {
	pub pool: Pubkey,
	pub owner: Pubkey,
	pub amount: u64,
}

#[event]
pub struct RewardsFunded {
	pub pool: Pubkey,
	pub funder: Pubkey,
	pub amount: u64,
}

#[error_code]
pub enum StakeError {
	#[msg("fee above the maximum")]
	FeeTooHigh,
	#[msg("reward rate above the maximum")]
	RateTooHigh,
	#[msg("signer is not the authority")]
	Unauthorized,
	#[msg("signer is not the pending admin")]
	NotPendingAdmin,
	#[msg("program data account does not belong to this program")]
	InvalidProgramData,
	#[msg("stake and reward mints must differ")]
	SameMint,
	#[msg("vault does not belong to the pool")]
	InvalidVault,
	#[msg("mint does not belong to the pool")]
	InvalidMint,
	#[msg("position does not belong to the pool")]
	InvalidPosition,
	#[msg("amount must be positive")]
	ZeroAmount,
	#[msg("pool is paused")]
	Paused,
	#[msg("not enough staked")]
	InsufficientStake,
	#[msg("position still holds stake or rewards")]
	PositionNotEmpty,
	#[msg("arithmetic overflow")]
	MathOverflow,
}
