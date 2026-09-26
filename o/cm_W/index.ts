// recovered names carry their source: [idl] Anchor IDL · [str] the program's own strings (instruction logs, Anchor account-error
//   names) · [known] well-known program ids and layouts · [heur] structural inference (verify); per-function "// names" lines list them.
//   Other names are plain temporaries: a..e = parameters r1..r5, f, g, … = locals, s30 = stack object at fp - 0x30, fn_<addr> = unnamed function
// program: sBPF v0, 176621 instructions, 872 functions (552 decompiled, 320 library)
// instructions (Anchor, discriminator = sha256("global:<name>")[..8] of instruction data, as u64):
//   close_limit_order            0xfa2557d50f807c4c  -> ix_close_limit_order
//     accounts [idl]: signer [signer], rent_receiver [mut], limit_order [mut]
//   close_permission_pda         0x7b4687457620549c  -> ix_close_permission_pda
//     accounts [idl]: owner [signer, mut], permission_authority, permission [mut, pda]
//   close_position               0x626244310051867b  -> ix_close_position
//     accounts [idl]: nft_owner [signer, mut], position_nft_mint [mut], position_nft_account [mut], personal_position [mut, pda], system_program [= 11111111111111111111111111111111], token_program
//   close_protocol_position      0xb26c5555909875c9  -> ix_close_protocol_position
//     accounts [idl]: admin [signer, mut, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], protocol_position [mut]
//   close_support_mint_associated 0x8336984863b78860  -> ix_close_support_mint_associated
//     accounts [idl]: owner [signer, mut], token_mint, support_mint_associated [mut, pda]
//   collect_fund_fee             0x7e06c2df954e8aa7  -> ix_collect_fund_fee
//     args [idl]: amount_0_requested: u64, amount_1_requested: u64
//     accounts [idl]: owner [signer], pool_state [mut], amm_config, token_vault_0 [mut], token_vault_1 [mut], vault_0_mint, vault_1_mint, recipient_token_account_0 [mut], recipient_token_account_1 [mut], token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb]
//   collect_protocol_fee         0x597e42c2ddfc8888  -> ix_collect_protocol_fee
//     args [idl]: amount_0_requested: u64, amount_1_requested: u64
//     accounts [idl]: owner [signer], pool_state [mut], amm_config, token_vault_0 [mut], token_vault_1 [mut], vault_0_mint, vault_1_mint, recipient_token_account_0 [mut], recipient_token_account_1 [mut], token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb]
//   collect_remaining_rewards    0x90d51022c5a6ed12  -> ix_collect_remaining_rewards
//     args [idl]: reward_index: u8
//     accounts [idl]: reward_funder [signer], funder_token_account [mut], pool_state [mut], reward_token_vault [mut], reward_vault_mint, token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], memo_program [= MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr]
//   create_amm_config            0x686c75d7d4ed3489  -> ix_create_amm_config
//     args [idl]: index: u16, tick_spacing: u16, trade_fee_rate: u32, protocol_fee_rate: u32, fund_fee_rate: u32
//     accounts [idl]: owner [signer, mut, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], amm_config [mut, pda], system_program [= 11111111111111111111111111111111]
//   create_customizable_pool     0x01a42f59a7d4442b  -> ix_create_customizable_pool
//     args [idl]: customizable_params: CreateCustomizableParams
//     accounts [idl]: pool_creator [signer, mut], amm_config, pool_state [mut, pda], token_mint_0, token_mint_1, token_vault_0 [mut, pda], token_vault_1 [mut, pda], observation_state [mut, pda], tick_array_bitmap [mut, pda], token_program_0, token_program_1, system_program [= 11111111111111111111111111111111], rent [= SysvarRent111111111111111111111111111111111]
//   create_dynamic_fee_config    0x3ee3765578b50ebd  -> ix_create_dynamic_fee_config
//     args [idl]: index: u16, filter_period: u16, decay_period: u16, reduction_factor: u16, dynamic_fee_control: u32, max_volatility_accumulator: u32
//     accounts [idl]: owner [signer, mut, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], dynamic_fee_config [mut, pda], system_program [= 11111111111111111111111111111111]
//   create_operation_account     0x6808236d2194573f  -> ix_create_operation_account
//     accounts [idl]: owner [signer, mut, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], operation_state [mut, pda], system_program [= 11111111111111111111111111111111]
//   create_permission_pda        0xcab5a989d8028887  -> ix_create_permission_pda
//     accounts [idl]: owner [signer, mut], permission_authority, permission [mut, pda], system_program [= 11111111111111111111111111111111]
//   create_permissioned_pool     0xe535ef2a23b3f324  -> ix_create_permissioned_pool
//     args [idl]: customizable_params: CreateCustomizableParams, seed_index: u16
//     accounts [idl]: payer [signer, mut], pool_creator, permission [pda], amm_config, pool_state [mut, pda], token_mint_0, token_mint_1, token_vault_0 [mut, pda], token_vault_1 [mut, pda], observation_state [mut, pda], tick_array_bitmap [mut, pda], token_program_0, token_program_1, system_program [= 11111111111111111111111111111111], rent [= SysvarRent111111111111111111111111111111111]
//   create_pool                  0xbc4068cf8ed192e9  -> ix_create_pool
//     args [idl]: sqrt_price_x64: u128, open_time: u64
//     accounts [idl]: pool_creator [signer, mut], amm_config, pool_state [mut, pda], token_mint_0, token_mint_1, token_vault_0 [mut, pda], token_vault_1 [mut, pda], observation_state [mut, pda], tick_array_bitmap [mut, pda], token_program_0, token_program_1, system_program [= 11111111111111111111111111111111], rent [= SysvarRent111111111111111111111111111111111]
//   create_support_mint_associated 0xa90ef2885c41fb11  -> ix_create_support_mint_associated
//     accounts [idl]: owner [signer, mut], token_mint, support_mint_associated [mut, pda], system_program [= 11111111111111111111111111111111]
//   decrease_limit_order         0x00a33142673c9d75  -> ix_decrease_limit_order
//     args [idl]: amount: u64, amount_min: u64
//     accounts [idl]: owner [signer], pool_state [mut], tick_array [mut], limit_order [mut], input_token_account [mut], output_token_account [mut], input_vault [mut], output_vault [mut], input_vault_mint, output_vault_mint, token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb]
//   decrease_liquidity           0x012c5b686fd026a0  -> ix_decrease_liquidity
//     args [idl]: liquidity: u128, amount_0_min: u64, amount_1_min: u64
//     accounts [idl]: nft_owner [signer], nft_account, personal_position [mut], pool_state [mut], protocol_position, token_vault_0 [mut], token_vault_1 [mut], tick_array_lower [mut], tick_array_upper [mut], recipient_token_account_0 [mut], recipient_token_account_1 [mut], token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA]
//   decrease_liquidity_v2        0x60c4524f3ebc7f3a  -> ix_decrease_liquidity_v2
//     args [idl]: liquidity: u128, amount_0_min: u64, amount_1_min: u64
//     accounts [idl]: nft_owner [signer], nft_account, personal_position [mut], pool_state [mut], protocol_position, token_vault_0 [mut], token_vault_1 [mut], tick_array_lower [mut], tick_array_upper [mut], recipient_token_account_0 [mut], recipient_token_account_1 [mut], token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], memo_program [= MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr], vault_0_mint, vault_1_mint
//   idl_close_account            0x852ab691720a11ea  -> ix_idl_close_account
//   idl_create_account           0x486e624882bf9020  -> ix_idl_create_account
//   idl_set_buffer               0x0aef61cb501b51b1  -> ix_idl_set_buffer
//   increase_limit_order         0x637dbafaec5990b1  -> ix_increase_limit_order
//     args [idl]: amount: u64
//     accounts [idl]: owner [signer], pool_state [mut], tick_array [mut], limit_order [mut], input_token_account [mut], input_vault [mut], input_vault_mint, input_token_program
//   increase_liquidity           0xb2fbcd0d76f39c2e  -> ix_increase_liquidity
//     args [idl]: liquidity: u128, amount_0_max: u64, amount_1_max: u64
//     accounts [idl]: nft_owner [signer], nft_account, pool_state [mut], protocol_position, personal_position [mut], tick_array_lower [mut], tick_array_upper [mut], token_account_0 [mut], token_account_1 [mut], token_vault_0 [mut], token_vault_1 [mut], token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA]
//   increase_liquidity_v2        0x0ab0ee45df591d85  -> ix_increase_liquidity_v2
//     args [idl]: liquidity: u128, amount_0_max: u64, amount_1_max: u64, base_flag: Option<bool>
//     accounts [idl]: nft_owner [signer], nft_account, pool_state [mut], protocol_position, personal_position [mut], tick_array_lower [mut], tick_array_upper [mut], token_account_0 [mut], token_account_1 [mut], token_vault_0 [mut], token_vault_1 [mut], token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], vault_0_mint, vault_1_mint
//   initialize_reward            0x44e681f2c4c0875f  -> ix_initialize_reward
//     args [idl]: param: InitializeRewardParam
//     accounts [idl]: reward_funder [signer, mut], funder_token_account [mut], amm_config, pool_state [mut], operation_state [pda], reward_token_mint, reward_token_vault [mut, pda], reward_token_program, system_program [= 11111111111111111111111111111111], rent [= SysvarRent111111111111111111111111111111111]
//   open_limit_order             0x93121d47b7da209d  -> ix_open_limit_order
//     args [idl]: nonce_index: u8, zero_for_one: bool, tick_index: i32, amount: u64
//     accounts [idl]: payer [signer, mut], pool_state [mut], tick_array [mut], limit_order_nonce [mut], limit_order [mut, pda], input_token_account [mut], output_token_account [mut], input_vault [mut], output_vault [mut], input_vault_mint, output_vault_mint, input_token_program, system_program [= 11111111111111111111111111111111]
//   open_position                0x31f0980f4d2f8087  -> ix_open_position
//     args [idl]: tick_lower_index: i32, tick_upper_index: i32, tick_array_lower_start_index: i32, tick_array_upper_start_index: i32, liquidity: u128, amount_0_max: u64, amount_1_max: u64
//     accounts [idl]: payer [signer, mut], position_nft_owner, position_nft_mint [signer, mut], position_nft_account [mut, pda], metadata_account [mut], pool_state [mut], protocol_position, tick_array_lower [mut, pda], tick_array_upper [mut, pda], personal_position [mut, pda], token_account_0 [mut], token_account_1 [mut], token_vault_0 [mut], token_vault_1 [mut], rent [= SysvarRent111111111111111111111111111111111], system_program [= 11111111111111111111111111111111], token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], associated_token_program [= ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL], metadata_program [= metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s]
//   open_position_v2             0xc7f15670d64ab84d  -> ix_open_position_v2
//     args [idl]: tick_lower_index: i32, tick_upper_index: i32, tick_array_lower_start_index: i32, tick_array_upper_start_index: i32, liquidity: u128, amount_0_max: u64, amount_1_max: u64, with_metadata: bool, base_flag: Option<bool>
//     accounts [idl]: payer [signer, mut], position_nft_owner, position_nft_mint [signer, mut], position_nft_account [mut, pda], metadata_account [mut], pool_state [mut], protocol_position, tick_array_lower [mut, pda], tick_array_upper [mut, pda], personal_position [mut, pda], token_account_0 [mut], token_account_1 [mut], token_vault_0 [mut], token_vault_1 [mut], rent [= SysvarRent111111111111111111111111111111111], system_program [= 11111111111111111111111111111111], token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], associated_token_program [= ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL], metadata_program [= metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s], token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], vault_0_mint, vault_1_mint
//   open_position_with_token22_nft 0x2ec91d7d52aeff4d  -> ix_open_position_with_token22_nft
//     args [idl]: tick_lower_index: i32, tick_upper_index: i32, tick_array_lower_start_index: i32, tick_array_upper_start_index: i32, liquidity: u128, amount_0_max: u64, amount_1_max: u64, with_metadata: bool, base_flag: Option<bool>
//     accounts [idl]: payer [signer, mut], position_nft_owner, position_nft_mint [signer, mut], position_nft_account [mut], pool_state [mut], protocol_position, tick_array_lower [mut, pda], tick_array_upper [mut, pda], personal_position [mut, pda], token_account_0 [mut], token_account_1 [mut], token_vault_0 [mut], token_vault_1 [mut], rent [= SysvarRent111111111111111111111111111111111], system_program [= 11111111111111111111111111111111], token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], associated_token_program [= ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL], token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], vault_0_mint, vault_1_mint
//   set_reward_params            0x89d3c9204ba73470  -> ix_set_reward_params
//     args [idl]: reward_index: u8, emissions_per_second_x64: u128, open_time: u64, end_time: u64
//     accounts [idl]: authority [signer], amm_config, pool_state [mut], operation_state [pda], token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb]
//   settle_limit_order           0x601a695c21744ecd  -> ix_settle_limit_order
//     accounts [idl]: signer [signer], pool_state, tick_array, limit_order [mut], output_token_account [mut], output_vault [mut], output_vault_mint, output_token_program
//   swap                         0xc88775e1919ec6f8  -> ix_swap
//     args [idl]: amount: u64, other_amount_threshold: u64, sqrt_price_limit_x64: u128, is_base_input: bool
//     accounts [idl]: payer [signer], amm_config, pool_state [mut], input_token_account [mut], output_token_account [mut], input_vault [mut], output_vault [mut], observation_state [mut], token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], tick_array [mut]
//   swap_router_base_in          0xc4f2baf5da737d45  -> ix_swap_router_base_in
//     args [idl]: amount_in: u64, amount_out_minimum: u64
//     accounts [idl]: payer [signer], input_token_account [mut], input_token_mint [mut], token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], memo_program [= MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr]
//   swap_v2                      0x621ec91a0bed042b  -> ix_swap_v2
//     args [idl]: amount: u64, other_amount_threshold: u64, sqrt_price_limit_x64: u128, is_base_input: bool
//     accounts [idl]: payer [signer], amm_config, pool_state [mut], input_token_account [mut], output_token_account [mut], input_vault [mut], output_vault [mut], observation_state [mut], token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], memo_program [= MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr], input_vault_mint, output_vault_mint
//   transfer_reward_owner        0x79302bf2530c1607  -> ix_transfer_reward_owner
//     args [idl]: new_owner: pubkey
//     accounts [idl]: authority [signer, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], pool_state [mut]
//   update_amm_config            0xc8741c9a88ae3c31  -> ix_update_amm_config
//     args [idl]: param: u8, value: u32
//     accounts [idl]: owner [signer, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], amm_config [mut]
//   update_dynamic_fee_config    0xf084c70208500707  -> ix_update_dynamic_fee_config
//     args [idl]: filter_period: u16, decay_period: u16, reduction_factor: u16, dynamic_fee_control: u32, max_volatility_accumulator: u32
//     accounts [idl]: owner [signer, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], dynamic_fee_config [mut]
//   update_operation_account     0x073de3bc2877467f  -> ix_update_operation_account
//     args [idl]: param: u8, keys: Vec<pubkey>
//     accounts [idl]: owner [signer, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], operation_state [mut, pda], system_program [= 11111111111111111111111111111111]
//   update_pool_status           0x7b75e02e066c5782  -> ix_update_pool_status
//     args [idl]: status: u8
//     accounts [idl]: authority [signer, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], pool_state [mut]
//   update_reward_infos          0xdf6a9a0b34e0aca3  -> ix_update_reward_infos
//     accounts [idl]: pool_state [mut]

export { ix_idl_create_account } from './ix/idl_create_account.ts'
export { ix_idl_close_account } from './ix/idl_close_account.ts'
export { ix_idl_set_buffer } from './ix/idl_set_buffer.ts'
export { ix_create_amm_config } from './ix/create_amm_config.ts'
export { ix_create_support_mint_associated } from './ix/create_support_mint_associated.ts'
export { ix_update_amm_config } from './ix/update_amm_config.ts'
export { ix_create_dynamic_fee_config } from './ix/create_dynamic_fee_config.ts'
export { ix_update_dynamic_fee_config } from './ix/update_dynamic_fee_config.ts'
export { ix_create_permission_pda } from './ix/create_permission_pda.ts'
export { ix_close_permission_pda } from './ix/close_permission_pda.ts'
export { ix_close_support_mint_associated } from './ix/close_support_mint_associated.ts'
export { ix_create_pool } from './ix/create_pool.ts'
export { ix_create_customizable_pool } from './ix/create_customizable_pool.ts'
export { ix_create_permissioned_pool } from './ix/create_permissioned_pool.ts'
export { ix_update_pool_status } from './ix/update_pool_status.ts'
export { ix_create_operation_account } from './ix/create_operation_account.ts'
export { ix_update_operation_account } from './ix/update_operation_account.ts'
export { ix_transfer_reward_owner } from './ix/transfer_reward_owner.ts'
export { ix_initialize_reward } from './ix/initialize_reward.ts'
export { ix_collect_remaining_rewards } from './ix/collect_remaining_rewards.ts'
export { ix_update_reward_infos } from './ix/update_reward_infos.ts'
export { ix_set_reward_params } from './ix/set_reward_params.ts'
export { ix_collect_protocol_fee } from './ix/collect_protocol_fee.ts'
export { ix_collect_fund_fee } from './ix/collect_fund_fee.ts'
export { ix_open_position } from './ix/open_position.ts'
export { ix_open_position_v2 } from './ix/open_position_v2.ts'
export { ix_open_position_with_token22_nft } from './ix/open_position_with_token22_nft.ts'
export { ix_close_position } from './ix/close_position.ts'
export { ix_increase_liquidity } from './ix/increase_liquidity.ts'
export { ix_increase_liquidity_v2 } from './ix/increase_liquidity_v2.ts'
export { ix_decrease_liquidity } from './ix/decrease_liquidity.ts'
export { ix_decrease_liquidity_v2 } from './ix/decrease_liquidity_v2.ts'
export { ix_swap } from './ix/swap.ts'
export { ix_swap_v2 } from './ix/swap_v2.ts'
export { ix_swap_router_base_in } from './ix/swap_router_base_in.ts'
export { ix_close_protocol_position } from './ix/close_protocol_position.ts'
export { ix_open_limit_order } from './ix/open_limit_order.ts'
export { ix_increase_limit_order } from './ix/increase_limit_order.ts'
export { ix_decrease_limit_order } from './ix/decrease_limit_order.ts'
export { ix_settle_limit_order } from './ix/settle_limit_order.ts'
export { ix_close_limit_order } from './ix/close_limit_order.ts'
export { entrypoint } from './entrypoint.ts'
// security/summary.md: read first — instructions ranked by sensitivity, their effects, privileges and checks (derived, over-approximate views; security/<ix>.md per instruction, security/analysis.json)
