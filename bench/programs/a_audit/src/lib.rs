// Audit-rule targets: one instruction per rule, clean as written; each v_* feature seeds exactly one bug.
// sysvar read (touch), stored PDA bump (claim), two accounts of one type (move_points), typed config
// (admin_withdraw), PDA-signed CPI (forward), CPI result (deposit), amount width (payout), remaining accounts
// (distribute), init_if_needed (init_config).
use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::{invoke, invoke_signed}, system_instruction};

declare_id!("BAudit1111111111111111111111111111111111111");

#[program]
pub mod a_audit {
	use super::*;

	pub fn init_config(ctx: Context<InitConfig>, beneficiary: Pubkey) -> Result<()> {
		let c = &mut ctx.accounts.config;
		#[cfg(not(feature = "v_reinit"))]
		{
			if !c.initialized {
				c.admin = ctx.accounts.payer.key();
				c.beneficiary = beneficiary;
				c.initialized = true;
				c.bump = ctx.bumps.config;
			}
		}
		#[cfg(feature = "v_reinit")]
		{
			c.admin = ctx.accounts.payer.key();
			c.beneficiary = beneficiary;
			c.initialized = true;
			c.bump = ctx.bumps.config;
		}
		Ok(())
	}

	pub fn touch(ctx: Context<Touch>) -> Result<()> {
		#[cfg(not(feature = "v_sysvar_unchecked"))]
		let ts = ctx.accounts.clock.unix_timestamp;
		#[cfg(feature = "v_sysvar_unchecked")]
		let ts = {
			let d = ctx.accounts.clock.try_borrow_data()?;
			i64::from_le_bytes(d[32..40].try_into().unwrap())
		};
		let m = &mut ctx.accounts.market;
		require!(ts >= m.opens_at, AuditError::NotOpen);
		m.last_ts = ts;
		Ok(())
	}

	pub fn claim(ctx: Context<Claim>, _bump: u8) -> Result<()> {
		let p = &mut ctx.accounts.position;
		require!(!p.claimed, AuditError::Claimed);
		p.claimed = true;
		ctx.accounts.treasury.sub_lamports(p.reward)?;
		ctx.accounts.owner.add_lamports(p.reward)?;
		Ok(())
	}

	pub fn move_points(ctx: Context<MovePoints>, amount: u64) -> Result<()> {
		let from = &mut ctx.accounts.from;
		from.points = from.points.checked_sub(amount).ok_or(AuditError::Overflow)?;
		let to = &mut ctx.accounts.to;
		to.points = to.points.checked_add(amount).ok_or(AuditError::Overflow)?;
		Ok(())
	}

	pub fn admin_withdraw(ctx: Context<AdminWithdraw>, amount: u64) -> Result<()> {
		#[cfg(feature = "v_type_confusion")]
		{
			let info = ctx.accounts.config.to_account_info();
			require_keys_eq!(*info.owner, crate::ID, AuditError::BadConfig);
			let data = info.try_borrow_data()?;
			let cfg = Config::try_deserialize_unchecked(&mut &data[..])?;
			require_keys_eq!(cfg.admin, ctx.accounts.admin.key(), AuditError::BadConfig);
		}
		ctx.accounts.treasury.sub_lamports(amount)?;
		ctx.accounts.admin.add_lamports(amount)?;
		Ok(())
	}

	pub fn forward(ctx: Context<Forward>, amount: u64) -> Result<()> {
		let bump = ctx.bumps.vault;
		let seeds: &[&[u8]] = &[b"vault", &[bump]];
		// (the program invoked is the account passed: a system transfer when it is the system program)
		let mut ix = system_instruction::transfer(ctx.accounts.vault.key, ctx.accounts.dest.key, amount);
		ix.program_id = *ctx.accounts.target_program.key;
		invoke_signed(
			&ix,
			&[ctx.accounts.vault.to_account_info(), ctx.accounts.dest.to_account_info(), ctx.accounts.target_program.to_account_info()],
			&[seeds],
		)?;
		Ok(())
	}

	pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
		let ix = system_instruction::transfer(ctx.accounts.user.key, ctx.accounts.vault.key, amount);
		let accts = [ctx.accounts.user.to_account_info(), ctx.accounts.vault.to_account_info(), ctx.accounts.system_program.to_account_info()];
		#[cfg(not(feature = "v_ignored_result"))]
		invoke(&ix, &accts)?;
		#[cfg(feature = "v_ignored_result")]
		let _ = invoke(&ix, &accts);
		let s = &mut ctx.accounts.stats;
		s.deposited = s.deposited.checked_add(amount).ok_or(AuditError::Overflow)?;
		Ok(())
	}

	pub fn payout(ctx: Context<Payout>, amount: u64) -> Result<()> {
		#[cfg(not(feature = "v_truncating_cast"))]
		let amt = amount;
		#[cfg(feature = "v_truncating_cast")]
		let amt = amount as u32 as u64;
		ctx.accounts.treasury.sub_lamports(amt)?;
		ctx.accounts.beneficiary.add_lamports(amt)?;
		Ok(())
	}

	pub fn distribute(ctx: Context<Distribute>, amount: u64) -> Result<()> {
		let dest = ctx.remaining_accounts.first().ok_or(AuditError::NoDest)?;
		#[cfg(not(feature = "v_remaining_unchecked"))]
		require_keys_eq!(dest.key(), ctx.accounts.config.beneficiary, AuditError::BadDest);
		ctx.accounts.treasury.sub_lamports(amount)?;
		dest.add_lamports(amount)?;
		Ok(())
	}
}

#[account]
pub struct Config {
	pub admin: Pubkey,
	pub beneficiary: Pubkey,
	pub initialized: bool,
	pub bump: u8,
}

#[account]
pub struct Market {
	pub admin: Pubkey,
	pub opens_at: i64,
	pub last_ts: i64,
}

#[account]
pub struct Position {
	pub owner: Pubkey,
	pub reward: u64,
	pub claimed: bool,
	pub bump: u8,
}

#[account]
pub struct Wallet {
	pub owner: Pubkey,
	pub points: u64,
}

#[account]
pub struct Treasury {
	pub bump: u8,
}

#[account]
pub struct Stats {
	pub deposited: u64,
}

#[derive(Accounts)]
pub struct InitConfig<'info> {
	#[account(mut)]
	pub payer: Signer<'info>,
	#[account(init_if_needed, payer = payer, space = 8 + 32 + 32 + 1 + 1, seeds = [b"config"], bump)]
	pub config: Account<'info, Config>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Touch<'info> {
	#[account(mut, has_one = admin)]
	pub market: Account<'info, Market>,
	pub admin: Signer<'info>,
	#[cfg(not(feature = "v_sysvar_unchecked"))]
	pub clock: Sysvar<'info, Clock>,
	/// CHECK: read as the Clock sysvar (v_sysvar_unchecked: its key is not checked)
	#[cfg(feature = "v_sysvar_unchecked")]
	pub clock: UncheckedAccount<'info>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct Claim<'info> {
	#[account(mut)]
	pub owner: Signer<'info>,
	#[cfg_attr(not(feature = "v_bump_from_ix"), account(mut, has_one = owner, seeds = [b"pos", owner.key().as_ref()], bump = position.bump))]
	#[cfg_attr(feature = "v_bump_from_ix", account(mut, has_one = owner, seeds = [b"pos", owner.key().as_ref()], bump = bump))]
	pub position: Account<'info, Position>,
	#[account(mut, seeds = [b"treasury"], bump = treasury.bump)]
	pub treasury: Account<'info, Treasury>,
}

#[derive(Accounts)]
pub struct MovePoints<'info> {
	#[account(mut, has_one = owner)]
	pub from: Account<'info, Wallet>,
	#[cfg_attr(not(feature = "v_dup_mut"), account(mut, constraint = to.key() != from.key() @ AuditError::SameWallet))]
	#[cfg_attr(feature = "v_dup_mut", account(mut))]
	pub to: Account<'info, Wallet>,
	pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct AdminWithdraw<'info> {
	#[cfg(not(feature = "v_type_confusion"))]
	#[account(has_one = admin)]
	pub config: Account<'info, Config>,
	/// CHECK: owner checked, deserialized without its discriminator (v_type_confusion)
	#[cfg(feature = "v_type_confusion")]
	pub config: UncheckedAccount<'info>,
	#[account(mut)]
	pub admin: Signer<'info>,
	#[account(mut, seeds = [b"treasury"], bump = treasury.bump)]
	pub treasury: Account<'info, Treasury>,
}

#[derive(Accounts)]
pub struct Forward<'info> {
	#[account(has_one = admin)]
	pub config: Account<'info, Config>,
	pub admin: Signer<'info>,
	#[account(mut, seeds = [b"vault"], bump)]
	pub vault: SystemAccount<'info>,
	#[account(mut, address = config.beneficiary)]
	pub dest: SystemAccount<'info>,
	/// CHECK: the system program (v_cpi_pda_unchecked: not checked)
	#[cfg_attr(not(feature = "v_cpi_pda_unchecked"), account(address = anchor_lang::system_program::ID))]
	pub target_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
	#[account(mut)]
	pub user: Signer<'info>,
	#[account(mut, seeds = [b"vault"], bump)]
	pub vault: SystemAccount<'info>,
	#[account(mut, seeds = [b"stats", user.key().as_ref()], bump)]
	pub stats: Account<'info, Stats>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Payout<'info> {
	#[account(has_one = admin, has_one = beneficiary)]
	pub config: Account<'info, Config>,
	pub admin: Signer<'info>,
	#[account(mut, seeds = [b"treasury"], bump = treasury.bump)]
	pub treasury: Account<'info, Treasury>,
	#[account(mut)]
	pub beneficiary: SystemAccount<'info>,
}

#[derive(Accounts)]
pub struct Distribute<'info> {
	#[account(has_one = admin)]
	pub config: Account<'info, Config>,
	pub admin: Signer<'info>,
	#[account(mut, seeds = [b"treasury"], bump = treasury.bump)]
	pub treasury: Account<'info, Treasury>,
}

#[error_code]
pub enum AuditError {
	Overflow,
	NotOpen,
	Claimed,
	SameWallet,
	BadConfig,
	NoDest,
	BadDest,
}
