use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked, MintTo, Burn, CloseAccount};
use anchor_spl::metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3, Metadata, mpl_token_metadata::types::DataV2};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod ref_anchor_rich {
    use super::*;

    pub fn init_pool(ctx: Context<InitPool>, fee_bps: u16, name: String, symbol: String, uri: String) -> Result<()> {
        let p = &mut ctx.accounts.pool;
        p.authority = ctx.accounts.authority.key();
        p.mint = ctx.accounts.mint.key();
        p.fee_bps = fee_bps;
        p.bump = ctx.bumps.pool;
        p.total = 0;
        let seeds: &[&[u8]] = &[b"pool", p.mint.as_ref(), &[p.bump]];
        create_metadata_accounts_v3(CpiContext::new_with_signer(ctx.accounts.metadata_program.to_account_info(), CreateMetadataAccountsV3 {
            metadata: ctx.accounts.metadata.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            mint_authority: ctx.accounts.pool.to_account_info(),
            payer: ctx.accounts.authority.to_account_info(),
            update_authority: ctx.accounts.pool.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        }, &[seeds]), DataV2 { name, symbol, uri, seller_fee_basis_points: 0, creators: None, collection: None, uses: None }, true, true, None)?;
        emit_cpi!(PoolCreated { pool: ctx.accounts.pool.key(), fee_bps });
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require_gt!(amount, 0, RefError::Zero);
        let decimals = ctx.accounts.mint.decimals;
        token_interface::transfer_checked(CpiContext::new(ctx.accounts.token_program.to_account_info(), TransferChecked {
            from: ctx.accounts.user_ata.to_account_info(), mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.vault.to_account_info(), authority: ctx.accounts.user.to_account_info(),
        }), amount, decimals)?;
        let fee = (amount as u128).checked_mul(ctx.accounts.pool.fee_bps as u128).unwrap() / 10_000;
        let p = &mut ctx.accounts.pool;
        p.total = p.total.checked_add(amount - fee as u64).ok_or(RefError::Overflow)?;
        let seeds: &[&[u8]] = &[b"pool", p.mint.as_ref(), &[p.bump]];
        token_interface::mint_to(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), MintTo {
            mint: ctx.accounts.mint.to_account_info(), to: ctx.accounts.user_ata.to_account_info(), authority: ctx.accounts.pool.to_account_info(),
        }, &[seeds]), fee as u64)?;
        system_program::transfer(CpiContext::new(ctx.accounts.system_program.to_account_info(), system_program::Transfer {
            from: ctx.accounts.user.to_account_info(), to: ctx.accounts.pool.to_account_info() }), 1000)?;
        Ok(())
    }

    pub fn withdraw_all(ctx: Context<Withdraw>) -> Result<()> {
        let amount = ctx.accounts.vault.amount;
        let p = &ctx.accounts.pool;
        let seeds: &[&[u8]] = &[b"pool", p.mint.as_ref(), &[p.bump]];
        token_interface::burn(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), Burn {
            mint: ctx.accounts.mint.to_account_info(), from: ctx.accounts.vault.to_account_info(), authority: ctx.accounts.pool.to_account_info(),
        }, &[seeds]), amount)?;
        token_interface::close_account(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), CloseAccount {
            account: ctx.accounts.vault.to_account_info(), destination: ctx.accounts.authority.to_account_info(), authority: ctx.accounts.pool.to_account_info(),
        }, &[seeds]))?;
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct Pool { pub authority: Pubkey, pub mint: Pubkey, pub fee_bps: u16, pub bump: u8, pub total: u64 }

#[derive(Accounts)]
pub struct InitPool<'info> {
    #[account(mut)] pub authority: Signer<'info>,
    #[account(init, payer = authority, space = 8 + Pool::INIT_SPACE, seeds = [b"pool", mint.key().as_ref()], bump)]
    pub pool: Account<'info, Pool>,
    #[account(mut)] pub mint: InterfaceAccount<'info, Mint>,
    /// CHECK: metadata pda
    #[account(mut)] pub metadata: UncheckedAccount<'info>,
    pub metadata_program: Program<'info, Metadata>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[event_cpi]
#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)] pub user: Signer<'info>,
    #[account(mut, has_one = mint)] pub pool: Account<'info, Pool>,
    #[account(mut)] pub mint: InterfaceAccount<'info, Mint>,
    #[account(init_if_needed, payer = user, associated_token::mint = mint, associated_token::authority = user, associated_token::token_program = token_program)]
    pub user_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(mut, token::mint = mint, token::authority = pool, token::token_program = token_program)]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)] pub authority: Signer<'info>,
    #[account(has_one = authority, has_one = mint)] pub pool: Account<'info, Pool>,
    #[account(mut)] pub mint: InterfaceAccount<'info, Mint>,
    #[account(mut)] pub vault: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[event]
pub struct PoolCreated { pub pool: Pubkey, pub fee_bps: u16 }

#[error_code]
pub enum RefError { Zero, Overflow }
