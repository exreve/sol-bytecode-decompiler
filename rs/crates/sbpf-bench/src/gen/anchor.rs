//! Anchor instruction templates (compile under Anchor 0.29 and 0.31).
//! Each unit is one instruction, clean as written; each variant (cargo feature v_<id>) removes exactly one
//! property. See bench/README.md (Generated programs).

use super::*;

pub const TYPES: &[(&str, &[(&str, &str)])] = &[
    (
        "Vault",
        &[("owner", "Pubkey"), ("balance", "u64"), ("bump", "u8")],
    ),
    (
        "Config",
        &[
            ("admin", "Pubkey"),
            ("beneficiary", "Pubkey"),
            ("initialized", "bool"),
            ("bump", "u8"),
        ],
    ),
    ("Treasury", &[("bump", "u8")]),
    (
        "Position",
        &[
            ("owner", "Pubkey"),
            ("reward", "u64"),
            ("claimed", "bool"),
            ("bump", "u8"),
        ],
    ),
    ("Wallet", &[("owner", "Pubkey"), ("points", "u64")]),
    (
        "Market",
        &[("admin", "Pubkey"), ("opens_at", "i64"), ("last_ts", "i64")],
    ),
    ("Profile", &[("authority", "Pubkey"), ("fee", "u64")]),
    (
        "Pool",
        &[
            ("admin", "Pubkey"),
            ("mint", "Pubkey"),
            ("total_staked", "u64"),
            ("total_shares", "u64"),
            ("fee_bps", "u16"),
            ("paused", "bool"),
            ("limit", "u64"),
            ("bump", "u8"),
        ],
    ),
    (
        "Stake",
        &[("owner", "Pubkey"), ("pool", "Pubkey"), ("shares", "u64")],
    ),
    (
        "Reserve",
        &[
            ("admin", "Pubkey"),
            ("mint", "Pubkey"),
            ("vault", "Pubkey"),
            ("oracle", "Pubkey"),
            ("total_assets", "u64"),
            ("total_shares", "u64"),
            ("min_liquidity", "u64"),
            ("bump", "u8"),
        ],
    ),
    (
        "Ledger",
        &[
            ("owner", "Pubkey"),
            ("reserve", "Pubkey"),
            ("shares", "u64"),
            ("deposited", "u64"),
            ("borrowed", "u64"),
        ],
    ),
];

pub const POOL_UNITS: &[Unit] = &[
	Unit {
		name: "init_pool",
		tag: None,
		types: Some(&["Pool"]),
		idl: "admin:ws pool:w mint system_program",
		args: &[],
		fund_mover: None,
		variants: &[],
		code: r"pub fn init_pool(ctx: Context<InitPool>) -> Result<()> {
	let p = &mut ctx.accounts.pool;
	p.admin = ctx.accounts.admin.key();
	p.mint = ctx.accounts.mint.key();
	p.total_staked = 0;
	p.total_shares = 0;
	p.fee_bps = 0;
	p.paused = false;
	p.limit = u64::MAX;
	p.bump = ctx.bumps.pool;
	Ok(())
}",
		accounts: Some(r#"pub struct InitPool<'info> {
	#[account(mut)]
	pub admin: Signer<'info>,
	#[account(init, payer = admin, space = 8 + 32 + 32 + 8 + 8 + 2 + 1 + 8 + 1, seeds = [b"pool", mint.key().as_ref()], bump)]
	pub pool: Account<'info, Pool>,
	pub mint: Account<'info, Mint>,
	pub system_program: Program<'info, System>,
}"#),
	},
	Unit {
		name: "open_stake",
		tag: None,
		types: Some(&["Pool", "Stake"]),
		idl: "owner:ws pool stake:w system_program",
		args: &[],
		fund_mover: None,
		variants: &[],
		code: r"pub fn open_stake(ctx: Context<OpenStake>) -> Result<()> {
	let s = &mut ctx.accounts.stake;
	s.owner = ctx.accounts.owner.key();
	s.pool = ctx.accounts.pool.key();
	s.shares = 0;
	Ok(())
}",
		accounts: Some(r#"pub struct OpenStake<'info> {
	#[account(mut)]
	pub owner: Signer<'info>,
	pub pool: Account<'info, Pool>,
	#[account(init, payer = owner, space = 8 + 32 + 32 + 8, seeds = [b"stake", pool.key().as_ref(), owner.key().as_ref()], bump)]
	pub stake: Account<'info, Stake>,
	pub system_program: Program<'info, System>,
}"#),
	},
	Unit {
		name: "stake",
		tag: None,
		types: Some(&["Pool", "Stake"]),
		idl: "pool:w stake:w owner:s user_token:w pool_vault:w token_program",
		args: &[("amount", "u64")],
		fund_mover: None,
		variants: &[
			Variant { id: "div_zero", rules: &["share-price-zero-supply"], idl: None, not_exploitable: None },
			Variant { id: "wrapping_add", rules: &["unchecked-arithmetic"], idl: None, not_exploitable: None },
		],
		code: r#"pub fn stake(ctx: Context<StakeTokens>, amount: u64) -> Result<()> {
	let p = &mut ctx.accounts.pool;
	require!(!p.paused, GenError::Paused);
	require!(amount <= p.limit, GenError::Limit);
	#[cfg(not(feature = "v_div_zero"))]
	let shares = if p.total_shares == 0 || p.total_staked == 0 {
		amount
	} else {
		((amount as u128) * (p.total_shares as u128) / (p.total_staked as u128)) as u64
	};
	#[cfg(feature = "v_div_zero")]
	let shares = ((amount as u128) * (p.total_shares as u128) / (p.total_staked as u128)) as u64;
	#[cfg(not(feature = "v_wrapping_add"))]
	{
		p.total_staked = p.total_staked.checked_add(amount).ok_or(GenError::Math)?;
	}
	#[cfg(feature = "v_wrapping_add")]
	{
		p.total_staked = p.total_staked.wrapping_add(amount);
	}
	p.total_shares = p.total_shares.checked_add(shares).ok_or(GenError::Math)?;
	let s = &mut ctx.accounts.stake;
	s.shares = s.shares.checked_add(shares).ok_or(GenError::Math)?;
	token::transfer(
		CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
			from: ctx.accounts.user_token.to_account_info(),
			to: ctx.accounts.pool_vault.to_account_info(),
			authority: ctx.accounts.owner.to_account_info(),
		}),
		amount,
	)?;
	Ok(())
}"#,
		accounts: Some(r#"pub struct StakeTokens<'info> {
	#[account(mut)]
	pub pool: Account<'info, Pool>,
	#[account(mut, has_one = owner, has_one = pool)]
	pub stake: Account<'info, Stake>,
	pub owner: Signer<'info>,
	#[account(mut, token::mint = pool.mint, token::authority = owner)]
	pub user_token: Account<'info, TokenAccount>,
	#[account(mut, seeds = [b"pool_vault", pool.key().as_ref()], bump)]
	pub pool_vault: Account<'info, TokenAccount>,
	pub token_program: Program<'info, Token>,
}"#),
	},
	Unit {
		name: "unstake",
		tag: None,
		types: Some(&["Pool", "Stake"]),
		idl: "pool:w stake:w owner:s pool_auth pool_vault:w dest:w token_program",
		args: &[("shares", "u64")],
		fund_mover: None,
		variants: &[
			Variant { id: "no_token_mint", rules: &["token-mint-unrelated", "recipient-unbound"], idl: None, not_exploitable: None },
			Variant { id: "no_token_auth", rules: &["recipient-unbound", "token-mint-unrelated"], idl: None, not_exploitable: None },
			Variant { id: "cpi_token_unchecked", rules: &["cpi-unchecked-program", "caller-controlled-sensitive-param"], idl: None, not_exploitable: Some("anchor_spl token::transfer invokes the constant spl_token::ID; the unchecked token_program account is not the invoked program") },
		],
		code: r#"pub fn unstake(ctx: Context<Unstake>, shares: u64) -> Result<()> {
	let p = &mut ctx.accounts.pool;
	require!(p.total_shares > 0, GenError::Empty);
	let amount = ((shares as u128) * (p.total_staked as u128) / (p.total_shares as u128)) as u64;
	p.total_staked = p.total_staked.checked_sub(amount).ok_or(GenError::Math)?;
	p.total_shares = p.total_shares.checked_sub(shares).ok_or(GenError::Math)?;
	let s = &mut ctx.accounts.stake;
	s.shares = s.shares.checked_sub(shares).ok_or(GenError::Math)?;
	let key = ctx.accounts.pool.key();
	let seeds: &[&[u8]] = &[b"pool_auth", key.as_ref(), &[ctx.bumps.pool_auth]];
	token::transfer(
		CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), Transfer {
			from: ctx.accounts.pool_vault.to_account_info(),
			to: ctx.accounts.dest.to_account_info(),
			authority: ctx.accounts.pool_auth.to_account_info(),
		}, &[seeds]),
		amount,
	)?;
	Ok(())
}"#,
		accounts: Some(r#"pub struct Unstake<'info> {
	#[account(mut)]
	pub pool: Account<'info, Pool>,
	#[account(mut, has_one = owner, has_one = pool)]
	pub stake: Account<'info, Stake>,
	pub owner: Signer<'info>,
	/// CHECK: PDA signer of the pool vault
	#[account(seeds = [b"pool_auth", pool.key().as_ref()], bump)]
	pub pool_auth: UncheckedAccount<'info>,
	#[account(mut, seeds = [b"pool_vault", pool.key().as_ref()], bump, token::authority = pool_auth)]
	pub pool_vault: Account<'info, TokenAccount>,
	#[cfg_attr(not(any(feature = "v_no_token_mint", feature = "v_no_token_auth")), account(mut, token::mint = pool.mint, token::authority = owner))]
	#[cfg_attr(feature = "v_no_token_mint", account(mut, token::authority = owner))]
	#[cfg_attr(feature = "v_no_token_auth", account(mut, token::mint = pool.mint))]
	pub dest: Account<'info, TokenAccount>,
	#[cfg(not(feature = "v_cpi_token_unchecked"))]
	pub token_program: Program<'info, Token>,
	/// CHECK: v_cpi_token_unchecked: the token program, not checked
	#[cfg(feature = "v_cpi_token_unchecked")]
	pub token_program: UncheckedAccount<'info>,
}"#),
	},
	Unit {
		name: "set_fee",
		tag: None,
		types: Some(&["Pool"]),
		idl: "pool:w admin:s",
		args: &[("value", "u16")],
		fund_mover: None,
		variants: &[],
		code: r"pub fn set_fee(ctx: Context<SetFee>, value: u16) -> Result<()> {
	ctx.accounts.pool.fee_bps = value;
	Ok(())
}",
		accounts: Some(r"pub struct SetFee<'info> {
	#[account(mut, has_one = admin)]
	pub pool: Account<'info, Pool>,
	pub admin: Signer<'info>,
}"),
	},
	Unit {
		name: "set_paused",
		tag: None,
		types: Some(&["Pool"]),
		idl: "pool:w admin:s",
		args: &[("value", "bool")],
		fund_mover: None,
		variants: &[],
		code: r"pub fn set_paused(ctx: Context<SetPaused>, value: bool) -> Result<()> {
	ctx.accounts.pool.paused = value;
	Ok(())
}",
		accounts: Some(r"pub struct SetPaused<'info> {
	#[account(mut, has_one = admin)]
	pub pool: Account<'info, Pool>,
	pub admin: Signer<'info>,
}"),
	},
	Unit {
		name: "set_limit",
		tag: None,
		types: Some(&["Pool"]),
		idl: "pool:w admin:s",
		args: &[("value", "u64")],
		fund_mover: None,
		variants: &[
			Variant { id: "inconsistent", rules: &["~consistency", "signer-not-related-to-authority", "state-write-ungated"], idl: None, not_exploitable: None },
		],
		code: r"pub fn set_limit(ctx: Context<SetLimit>, value: u64) -> Result<()> {
	ctx.accounts.pool.limit = value;
	Ok(())
}",
		accounts: Some(r#"pub struct SetLimit<'info> {
	#[cfg_attr(not(feature = "v_inconsistent"), account(mut, has_one = admin))]
	#[cfg_attr(feature = "v_inconsistent", account(mut))]
	pub pool: Account<'info, Pool>,
	pub admin: Signer<'info>,
}"#),
	},
];

pub const VAULT_UNITS: &[Unit] = &[
    Unit {
        name: "open_vault",
        tag: None,
        types: Some(&["Vault"]),
        idl: "owner:ws vault:w system_program",
        args: &[],
        fund_mover: None,
        variants: &[],
        code: r"pub fn open_vault(ctx: Context<OpenVault>) -> Result<()> {
	let v = &mut ctx.accounts.vault;
	v.owner = ctx.accounts.owner.key();
	v.balance = 0;
	v.bump = ctx.bumps.vault;
	Ok(())
}",
        accounts: Some(
            r#"pub struct OpenVault<'info> {
	#[account(mut)]
	pub owner: Signer<'info>,
	#[account(init, payer = owner, space = 8 + 32 + 8 + 1, seeds = [b"vault", owner.key().as_ref()], bump)]
	pub vault: Account<'info, Vault>,
	pub system_program: Program<'info, System>,
}"#,
        ),
    },
    Unit {
        name: "withdraw",
        tag: None,
        types: Some(&["Vault"]),
        idl: "vault:w owner:ws",
        args: &[("amount", "u64")],
        fund_mover: None,
        variants: &[
            Variant {
                id: "no_signer",
                rules: &["value-move-no-signer", "state-write-ungated"],
                idl: Some("vault:w owner:w"),
                not_exploitable: None,
            },
            Variant {
                id: "no_has_one",
                rules: &["signer-not-related-to-authority"],
                idl: None,
                not_exploitable: None,
            },
            Variant {
                id: "wrapping_sub",
                rules: &["unchecked-arithmetic"],
                idl: None,
                not_exploitable: None,
            },
        ],
        code: r#"pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
	let v = &mut ctx.accounts.vault;
	#[cfg(not(feature = "v_wrapping_sub"))]
	{
		v.balance = v.balance.checked_sub(amount).ok_or(GenError::Math)?;
	}
	#[cfg(feature = "v_wrapping_sub")]
	{
		v.balance = v.balance.wrapping_sub(amount);
	}
	v.sub_lamports(amount)?;
	ctx.accounts.owner.add_lamports(amount)?;
	Ok(())
}"#,
        accounts: Some(
            r#"pub struct Withdraw<'info> {
	#[cfg_attr(not(feature = "v_no_has_one"), account(mut, has_one = owner))]
	#[cfg_attr(feature = "v_no_has_one", account(mut))]
	pub vault: Account<'info, Vault>,
	#[cfg(not(feature = "v_no_signer"))]
	#[account(mut)]
	pub owner: Signer<'info>,
	/// CHECK: v_no_signer: not required to sign
	#[cfg(feature = "v_no_signer")]
	#[account(mut)]
	pub owner: UncheckedAccount<'info>,
}"#,
        ),
    },
    Unit {
        name: "close_vault",
        tag: None,
        types: Some(&["Vault"]),
        idl: "vault:w owner:ws",
        args: &[],
        fund_mover: None,
        variants: &[Variant {
            id: "close_no_zero",
            rules: &["close-without-zeroing"],
            idl: None,
            not_exploitable: None,
        }],
        code: r#"pub fn close_vault(ctx: Context<CloseVault>) -> Result<()> {
	let v = ctx.accounts.vault.to_account_info();
	let n = v.lamports();
	v.sub_lamports(n)?;
	ctx.accounts.owner.add_lamports(n)?;
	#[cfg(not(feature = "v_close_no_zero"))]
	{
		v.assign(&System::id());
		v.realloc(0, false)?;
	}
	Ok(())
}"#,
        accounts: Some(
            r"pub struct CloseVault<'info> {
	#[account(mut, has_one = owner)]
	pub vault: Account<'info, Vault>,
	#[account(mut)]
	pub owner: Signer<'info>,
}",
        ),
    },
    Unit {
        name: "setup",
        tag: None,
        types: Some(&["Config"]),
        idl: "payer:ws config:w system_program",
        args: &[("beneficiary", "pubkey")],
        fund_mover: None,
        variants: &[Variant {
            id: "reinit_iin",
            rules: &["init-if-needed-reinit"],
            idl: None,
            not_exploitable: None,
        }],
        code: r#"pub fn setup(ctx: Context<Setup>, beneficiary: Pubkey) -> Result<()> {
	let c = &mut ctx.accounts.config;
	#[cfg(not(feature = "v_reinit_iin"))]
	require!(!c.initialized, GenError::AlreadyInitialized);
	c.admin = ctx.accounts.payer.key();
	c.beneficiary = beneficiary;
	c.initialized = true;
	c.bump = ctx.bumps.config;
	Ok(())
}"#,
        accounts: Some(
            r#"pub struct Setup<'info> {
	#[account(mut)]
	pub payer: Signer<'info>,
	#[account(init_if_needed, payer = payer, space = 8 + 32 + 32 + 1 + 1, seeds = [b"config"], bump)]
	pub config: Account<'info, Config>,
	pub system_program: Program<'info, System>,
}"#,
        ),
    },
    Unit {
        name: "sweep",
        tag: None,
        types: Some(&["Config", "Treasury"]),
        idl: "config admin:ws treasury:w",
        args: &[("amount", "u64")],
        fund_mover: None,
        variants: &[Variant {
            id: "type_unchecked",
            rules: &["account-type-unchecked", "signer-not-related-to-authority"],
            idl: None,
            not_exploitable: None,
        }],
        code: r#"pub fn sweep(ctx: Context<Sweep>, amount: u64) -> Result<()> {
	#[cfg(feature = "v_type_unchecked")]
	{
		let info = ctx.accounts.config.to_account_info();
		require_keys_eq!(*info.owner, crate::ID, GenError::BadConfig);
		let data = info.try_borrow_data()?;
		let cfg = Config::try_deserialize_unchecked(&mut &data[..])?;
		require_keys_eq!(cfg.admin, ctx.accounts.admin.key(), GenError::BadConfig);
	}
	ctx.accounts.treasury.sub_lamports(amount)?;
	ctx.accounts.admin.add_lamports(amount)?;
	Ok(())
}"#,
        accounts: Some(
            r#"pub struct Sweep<'info> {
	#[cfg(not(feature = "v_type_unchecked"))]
	#[account(has_one = admin)]
	pub config: Account<'info, Config>,
	/// CHECK: v_type_unchecked: owner checked, deserialized without its discriminator
	#[cfg(feature = "v_type_unchecked")]
	pub config: UncheckedAccount<'info>,
	#[account(mut)]
	pub admin: Signer<'info>,
	#[account(mut, seeds = [b"treasury"], bump = treasury.bump)]
	pub treasury: Account<'info, Treasury>,
}"#,
        ),
    },
    Unit {
        name: "forward",
        tag: None,
        types: Some(&["Config"]),
        idl: "config admin:s escrow:w dest:w target_program",
        args: &[("amount", "u64")],
        fund_mover: None,
        variants: &[Variant {
            id: "cpi_unchecked",
            rules: &["cpi-unchecked-program", "caller-controlled-sensitive-param"],
            idl: None,
            not_exploitable: None,
        }],
        code: r#"pub fn forward(ctx: Context<Forward>, amount: u64) -> Result<()> {
	let seeds: &[&[u8]] = &[b"escrow", &[ctx.bumps.escrow]];
	let mut ix = anchor_lang::solana_program::system_instruction::transfer(ctx.accounts.escrow.key, ctx.accounts.dest.key, amount);
	ix.program_id = *ctx.accounts.target_program.key;
	anchor_lang::solana_program::program::invoke_signed(
		&ix,
		&[ctx.accounts.escrow.to_account_info(), ctx.accounts.dest.to_account_info(), ctx.accounts.target_program.to_account_info()],
		&[seeds],
	)?;
	Ok(())
}"#,
        accounts: Some(
            r#"pub struct Forward<'info> {
	#[account(has_one = admin)]
	pub config: Account<'info, Config>,
	pub admin: Signer<'info>,
	#[account(mut, seeds = [b"escrow"], bump)]
	pub escrow: SystemAccount<'info>,
	#[account(mut, address = config.beneficiary)]
	pub dest: SystemAccount<'info>,
	/// CHECK: the system program (v_cpi_unchecked: not checked)
	#[cfg_attr(not(feature = "v_cpi_unchecked"), account(address = anchor_lang::system_program::ID))]
	pub target_program: UncheckedAccount<'info>,
}"#,
        ),
    },
    Unit {
        name: "claim",
        tag: None,
        types: Some(&["Position", "Treasury"]),
        idl: "owner:ws position:w treasury:w",
        args: &[("bump", "u8")],
        fund_mover: None,
        variants: &[Variant {
            id: "bump_from_ix",
            rules: &["pda-bump-from-ix"],
            idl: None,
            not_exploitable: None,
        }],
        code: r"pub fn claim(ctx: Context<Claim>, _bump: u8) -> Result<()> {
	let p = &mut ctx.accounts.position;
	require!(!p.claimed, GenError::Claimed);
	p.claimed = true;
	let r = p.reward;
	ctx.accounts.treasury.sub_lamports(r)?;
	ctx.accounts.owner.add_lamports(r)?;
	Ok(())
}",
        accounts: Some(
            r#"#[instruction(bump: u8)]
pub struct Claim<'info> {
	#[account(mut)]
	pub owner: Signer<'info>,
	#[cfg_attr(not(feature = "v_bump_from_ix"), account(mut, has_one = owner, seeds = [b"pos", owner.key().as_ref()], bump = position.bump))]
	#[cfg_attr(feature = "v_bump_from_ix", account(mut, has_one = owner, seeds = [b"pos", owner.key().as_ref()], bump = bump))]
	pub position: Account<'info, Position>,
	#[account(mut, seeds = [b"treasury"], bump = treasury.bump)]
	pub treasury: Account<'info, Treasury>,
}"#,
        ),
    },
    Unit {
        name: "register",
        tag: None,
        types: Some(&["Profile"]),
        idl: "profile:w authority:s",
        args: &[("fee", "u64")],
        fund_mover: None,
        variants: &[Variant {
            id: "reinit_unchecked",
            rules: &["reinit-unchecked"],
            idl: None,
            not_exploitable: None,
        }],
        code: r#"pub fn register(ctx: Context<Register>, fee: u64) -> Result<()> {
	let info = ctx.accounts.profile.to_account_info();
	let mut data = info.try_borrow_mut_data()?;
	#[cfg(not(feature = "v_reinit_unchecked"))]
	require!(data[..8] == [0u8; 8], GenError::AlreadyInitialized);
	let p = Profile { authority: ctx.accounts.authority.key(), fee };
	data[..8].copy_from_slice(&<Profile as anchor_lang::Discriminator>::DISCRIMINATOR[..]);
	p.serialize(&mut &mut data[8..])?;
	Ok(())
}"#,
        accounts: Some(
            r"pub struct Register<'info> {
	/// CHECK: initialized here, allocated by the client (v_reinit_unchecked: not required to be uninitialized)
	#[account(mut, owner = crate::ID)]
	pub profile: UncheckedAccount<'info>,
	pub authority: Signer<'info>,
}",
        ),
    },
    Unit {
        name: "touch",
        tag: None,
        types: Some(&["Market"]),
        idl: "market:w admin:s clock",
        args: &[],
        fund_mover: None,
        variants: &[Variant {
            id: "sysvar_unchecked",
            rules: &["sysvar-account-unchecked"],
            idl: None,
            not_exploitable: None,
        }],
        code: r#"pub fn touch(ctx: Context<Touch>) -> Result<()> {
	#[cfg(not(feature = "v_sysvar_unchecked"))]
	let ts = ctx.accounts.clock.unix_timestamp;
	#[cfg(feature = "v_sysvar_unchecked")]
	let ts = {
		let d = ctx.accounts.clock.try_borrow_data()?;
		i64::from_le_bytes(d[32..40].try_into().unwrap())
	};
	let m = &mut ctx.accounts.market;
	require!(ts >= m.opens_at, GenError::NotOpen);
	m.last_ts = ts;
	Ok(())
}"#,
        accounts: Some(
            r#"pub struct Touch<'info> {
	#[account(mut, has_one = admin)]
	pub market: Account<'info, Market>,
	pub admin: Signer<'info>,
	#[cfg(not(feature = "v_sysvar_unchecked"))]
	pub clock: Sysvar<'info, Clock>,
	/// CHECK: read as the Clock sysvar (v_sysvar_unchecked: its key is not checked)
	#[cfg(feature = "v_sysvar_unchecked")]
	pub clock: UncheckedAccount<'info>,
}"#,
        ),
    },
    Unit {
        name: "move_points",
        tag: None,
        types: Some(&["Wallet"]),
        idl: "from:w to:w owner:s",
        args: &[("amount", "u64")],
        fund_mover: None,
        variants: &[Variant {
            id: "dup_mut",
            rules: &["duplicate-mutable-accounts"],
            idl: None,
            not_exploitable: None,
        }],
        code: r"pub fn move_points(ctx: Context<MovePoints>, amount: u64) -> Result<()> {
	let from = &mut ctx.accounts.from;
	from.points = from.points.checked_sub(amount).ok_or(GenError::Math)?;
	let to = &mut ctx.accounts.to;
	to.points = to.points.checked_add(amount).ok_or(GenError::Math)?;
	Ok(())
}",
        accounts: Some(
            r#"pub struct MovePoints<'info> {
	#[account(mut, has_one = owner)]
	pub from: Account<'info, Wallet>,
	#[cfg_attr(not(feature = "v_dup_mut"), account(mut, constraint = to.key() != from.key() @ GenError::SameAccount))]
	#[cfg_attr(feature = "v_dup_mut", account(mut))]
	pub to: Account<'info, Wallet>,
	pub owner: Signer<'info>,
}"#,
        ),
    },
    Unit {
        name: "distribute",
        tag: None,
        types: Some(&["Config", "Treasury"]),
        idl: "config admin:s treasury:w",
        args: &[("amount", "u64")],
        fund_mover: None,
        variants: &[Variant {
            id: "remaining_unchecked",
            rules: &["remaining-account-unchecked"],
            idl: None,
            not_exploitable: None,
        }],
        code: r#"pub fn distribute(ctx: Context<Distribute>, amount: u64) -> Result<()> {
	let dest = ctx.remaining_accounts.first().ok_or(GenError::NoDest)?;
	#[cfg(not(feature = "v_remaining_unchecked"))]
	require_keys_eq!(dest.key(), ctx.accounts.config.beneficiary, GenError::BadDest);
	ctx.accounts.treasury.sub_lamports(amount)?;
	dest.add_lamports(amount)?;
	Ok(())
}"#,
        accounts: Some(
            r#"pub struct Distribute<'info> {
	#[account(has_one = admin)]
	pub config: Account<'info, Config>,
	pub admin: Signer<'info>,
	#[account(mut, seeds = [b"treasury"], bump = treasury.bump)]
	pub treasury: Account<'info, Treasury>,
}"#,
        ),
    },
];
