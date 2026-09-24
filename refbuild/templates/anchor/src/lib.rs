use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod ref_anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, amount: u64, name: String) -> Result<()> {
        let v = &mut ctx.accounts.vault;
        v.owner = ctx.accounts.payer.key();
        v.amount = amount;
        v.name = name;
        v.bump = {{BUMP}};
        v.created = Clock::get()?.unix_timestamp;
        msg!("initialized {}", v.amount);
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, RefError::ZeroAmount);
        token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.vault_ata.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        }), amount)?;
        let v = &mut ctx.accounts.vault;
        v.amount = v.amount.checked_add(amount).ok_or(RefError::Overflow)?;
        emit!(Deposited { owner: v.owner, amount });
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let owner = ctx.accounts.owner.key();
        let seeds: &[&[u8]] = &[b"vault", owner.as_ref(), &[ctx.accounts.vault.bump]];
        token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), Transfer {
            from: ctx.accounts.vault_ata.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        }, &[seeds]), amount)?;
        ctx.accounts.vault.amount -= amount;
        Ok(())
    }

    pub fn close_vault(_ctx: Context<CloseVault>) -> Result<()> { Ok(()) }
}

#[account]
pub struct Vault { pub owner: Pubkey, pub amount: u64, pub name: String, pub bump: u8, pub created: i64 }

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)] pub payer: Signer<'info>,
    #[account(init, payer = payer, space = 8 + 32 + 8 + 64 + 1 + 8, seeds = [b"vault", payer.key().as_ref()], bump)]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)] pub owner: Signer<'info>,
    #[account(mut, has_one = owner, seeds = [b"vault", owner.key().as_ref()], bump = vault.bump)]
    pub vault: Account<'info, Vault>,
    pub mint: Account<'info, Mint>,
    #[account(mut, token::mint = mint, token::authority = owner)] pub from: Account<'info, TokenAccount>,
    #[account(init_if_needed, payer = owner, associated_token::mint = mint, associated_token::authority = vault)]
    pub vault_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    pub owner: Signer<'info>,
    #[account(mut, has_one = owner)] pub vault: Account<'info, Vault>,
    #[account(mut)] pub vault_ata: Account<'info, TokenAccount>,
    #[account(mut)] pub to: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CloseVault<'info> {
    #[account(mut)] pub owner: Signer<'info>,
    #[account(mut, close = owner, has_one = owner)] pub vault: Account<'info, Vault>,
}

#[event]
pub struct Deposited { pub owner: Pubkey, pub amount: u64 }

#[error_code]
pub enum RefError { #[msg("amount is zero")] ZeroAmount, #[msg("overflow")] Overflow }
