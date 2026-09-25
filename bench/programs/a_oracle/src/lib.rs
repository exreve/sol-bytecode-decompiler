// Price feed on a zero-copy account (AccountLoader, #[account(zero)]), updated by its authority.
use anchor_lang::prelude::*;

declare_id!("BFeed11111111111111111111111111111111111111");

#[program]
pub mod a_oracle {
	use super::*;

	pub fn init_feed(ctx: Context<InitFeed>) -> Result<()> {
		let mut f = ctx.accounts.feed.load_init()?;
		f.authority = ctx.accounts.authority.key();
		Ok(())
	}

	pub fn update(ctx: Context<Update>, price: u64, conf: u64) -> Result<()> {
		let mut f = ctx.accounts.feed.load_mut()?;
		f.price = price;
		f.conf = conf;
		f.slot = Clock::get()?.slot;
		Ok(())
	}

	pub fn set_authority(ctx: Context<SetAuthority>) -> Result<()> {
		let mut f = ctx.accounts.feed.load_mut()?;
		f.authority = ctx.accounts.new_authority.key();
		Ok(())
	}
}

#[account(zero_copy)]
pub struct Feed {
	pub authority: Pubkey,
	pub price: u64,
	pub conf: u64,
	pub slot: u64,
}

#[derive(Accounts)]
pub struct InitFeed<'info> {
	#[account(zero)]
	pub feed: AccountLoader<'info, Feed>,
	pub authority: Signer<'info>,
}

#[cfg(not(feature = "v_ungated"))]
#[derive(Accounts)]
pub struct Update<'info> {
	#[account(mut, has_one = authority)]
	pub feed: AccountLoader<'info, Feed>,
	pub authority: Signer<'info>,
}

#[cfg(feature = "v_ungated")]
#[derive(Accounts)]
pub struct Update<'info> {
	#[account(mut)]
	pub feed: AccountLoader<'info, Feed>,
}

#[derive(Accounts)]
pub struct SetAuthority<'info> {
	#[account(mut, has_one = authority)]
	pub feed: AccountLoader<'info, Feed>,
	pub authority: Signer<'info>,
	/// CHECK: any key
	pub new_authority: UncheckedAccount<'info>,
}
