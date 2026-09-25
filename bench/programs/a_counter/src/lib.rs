// Counter with an admin: has_one admin + Signer gating, admin rotation, realloc of a notes account, close.
use anchor_lang::prelude::*;

declare_id!("BCount1111111111111111111111111111111111111");

#[program]
pub mod a_counter {
	use super::*;

	pub fn init_counter(ctx: Context<InitCounter>) -> Result<()> {
		let c = &mut ctx.accounts.counter;
		c.admin = ctx.accounts.admin.key();
		c.count = 0;
		c.bump = ctx.bumps.counter;
		Ok(())
	}

	pub fn increment(ctx: Context<Increment>, by: u64) -> Result<()> {
		let c = &mut ctx.accounts.counter;
		c.count = c.count.checked_add(by).ok_or(CounterError::Overflow)?;
		Ok(())
	}

	pub fn set_admin(ctx: Context<SetAdmin>, new_admin: Pubkey) -> Result<()> {
		ctx.accounts.counter.admin = new_admin;
		Ok(())
	}

	pub fn resize_notes(ctx: Context<ResizeNotes>, len: u32) -> Result<()> {
		let n = &mut ctx.accounts.notes;
		n.data.resize(len as usize, 0);
		Ok(())
	}

	pub fn close_counter(_ctx: Context<CloseCounter>) -> Result<()> {
		Ok(())
	}
}

#[account]
pub struct Counter {
	pub admin: Pubkey,
	pub count: u64,
	pub bump: u8,
}

#[account]
pub struct Notes {
	pub counter: Pubkey,
	pub data: Vec<u8>,
}

#[derive(Accounts)]
pub struct InitCounter<'info> {
	#[account(init, payer = admin, space = 8 + 32 + 8 + 1, seeds = [b"counter", admin.key().as_ref()], bump)]
	pub counter: Account<'info, Counter>,
	#[account(mut)]
	pub admin: Signer<'info>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
	#[account(mut, has_one = admin)]
	pub counter: Account<'info, Counter>,
	#[cfg(not(feature = "v_no_signer"))]
	pub admin: Signer<'info>,
	/// CHECK: bench variant (signer check removed)
	#[cfg(feature = "v_no_signer")]
	pub admin: UncheckedAccount<'info>,
}

#[cfg(not(feature = "v_ungated"))]
#[derive(Accounts)]
pub struct SetAdmin<'info> {
	#[account(mut, has_one = admin)]
	pub counter: Account<'info, Counter>,
	pub admin: Signer<'info>,
}

#[cfg(feature = "v_ungated")]
#[derive(Accounts)]
pub struct SetAdmin<'info> {
	#[account(mut)]
	pub counter: Account<'info, Counter>,
}

#[derive(Accounts)]
#[instruction(len: u32)]
pub struct ResizeNotes<'info> {
	#[account(has_one = admin)]
	pub counter: Account<'info, Counter>,
	#[account(mut, has_one = counter, realloc = 8 + 32 + 4 + len as usize, realloc::payer = admin, realloc::zero = false)]
	pub notes: Account<'info, Notes>,
	#[account(mut)]
	pub admin: Signer<'info>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseCounter<'info> {
	#[account(mut, has_one = admin, close = admin)]
	pub counter: Account<'info, Counter>,
	#[account(mut)]
	pub admin: Signer<'info>,
}

#[error_code]
pub enum CounterError {
	Overflow,
}
