// recovered names carry their source: [idl] Anchor IDL · [str] the program's own strings (instruction logs, Anchor account-error
//   names) · [known] well-known program ids and layouts · [heur] structural inference (verify); per-function "// names" lines list them.
//   Other names are plain temporaries: a..e = parameters r1..r5, f, g, … = locals, s30 = stack object at fp - 0x30, fn_<addr> = unnamed function
// program: sBPF v0, 172969 instructions, 921 functions (629 decompiled, 292 library)
// instructions (Anchor, discriminator = sha256("global:<name>")[..8] of instruction data, as u64):
//   close_bundled_position       0x4367551bf5d82429  -> ix_close_bundled_position
//     accounts [str, order of first use]: bundled_position, position_bundle, position_bundle_token_account, receiver, position_bundle_authority
//   close_position               0x626244310051867b  -> ix_close_position
//     accounts [str, order of first use]: position_authority, receiver, position, position_mint, position_token_account, token_program
//   close_position_with_token_extensions 0xdf63199b3b87b601  -> ix_close_position_with_token_extensions
//     accounts [str, order of first use]: position_authority, receiver, position, position_mint, position_token_account, token_2022_program
//   collect_fees                 0xb613ba1e63cf98a4  -> ix_collect_fees
//     accounts [str, order of first use]: whirlpool, position, position_token_account, token_owner_account_a, token_vault_a, token_owner_account_b, token_vault_b, token_program, position_authority
//   collect_fees_v2              0x0fe2b4e5bf5f75cf  -> ix_collect_fees_v2
//     accounts [str, order of first use]: whirlpool, position, position_token_account, token_mint_a, token_mint_b, token_owner_account_a, token_vault_a, token_owner_account_b, token_vault_b, token_program_b, token_program_a, memo_program, position_authority
//   collect_protocol_fees        0xdc46b29662174316  -> ix_collect_protocol_fees
//     accounts [str, order of first use]: whirlpools_config, whirlpool, token_vault_a, token_vault_b, token_destination_a, token_destination_b, token_program, collect_protocol_fees_authority
//   collect_protocol_fees_v2     0xc816c87286de8067  -> ix_collect_protocol_fees_v2
//     accounts [str, order of first use]: whirlpools_config, whirlpool, token_mint_a, token_mint_b, token_vault_a, token_vault_b, token_destination_a, token_destination_b, token_program_a, token_program_b, collect_protocol_fees_authority, memo_program
//   collect_reward               0x22b1eb5657840546  -> ix_collect_reward
//     accounts [str, order of first use]: whirlpool, position, position_token_account, reward_owner_account, reward_vault, token_program, position_authority
//   collect_reward_v2            0xd13113a0b4256bb1  -> ix_collect_reward_v2
//     accounts [str, order of first use]: whirlpool, position, position_token_account, reward_owner_account, reward_mint, reward_vault, reward_token_program, memo_program, position_authority
//   decrease_liquidity           0x012c5b686fd026a0  -> ix_decrease_liquidity
//     accounts [str, order of first use]: whirlpool, position, position_token_account, token_owner_account_a, token_owner_account_b, tick_array_lower, tick_array_upper, token_program, token_vault_b, token_vault_a, position_authority
//   decrease_liquidity_v2        0x60c4524f3ebc7f3a  -> ix_decrease_liquidity_v2
//     accounts [str, order of first use]: whirlpool, position, position_token_account, token_mint_a, token_mint_b, tick_array_lower, tick_array_upper, token_program_a, token_owner_account_a, token_vault_b, token_vault_a, token_owner_account_b, token_program_b, position_authority, memo_program
//   delete_position_bundle       0xad7cefd902631964  -> ix_delete_position_bundle
//     accounts [str, order of first use]: position_bundle, position_bundle_mint, position_bundle_token_account, receiver, token_program, position_bundle_owner
//   delete_token_badge           0xb911751208449235  -> ix_delete_token_badge
//     accounts [str, order of first use]: whirlpools_config, whirlpools_config_extension, token_mint, token_badge, receiver, token_badge_authority
//   idl_close_account            0x852ab691720a11ea  -> ix_idl_close_account
//   idl_create_account           0x486e624882bf9020  -> ix_idl_create_account
//   idl_include                  0x1f81c13c7979fddf  -> ix_idl_include
//     accounts [str, order of first use]: system_program
//   idl_resize_account           0xcaf918924f1f0e45  -> ix_idl_resize_account
//   idl_set_buffer               0x0aef61cb501b51b1  -> ix_idl_set_buffer
//   idl_write                    0x6f06922e766c8a88  -> ix_idl_write
//   increase_liquidity           0xb2fbcd0d76f39c2e  -> ix_increase_liquidity
//     accounts [str, order of first use]: whirlpool, position, position_token_account, token_owner_account_a, token_owner_account_b, tick_array_lower, tick_array_upper, token_program, token_vault_b, token_vault_a, position_authority
//   increase_liquidity_by_token_amounts_v2 0x2b35c6d27c09fbef  -> ix_increase_liquidity_by_token_amounts_v2
//     accounts [str, order of first use]: whirlpool, position, position_token_account, token_mint_a, token_mint_b, tick_array_lower, tick_array_upper, token_program_a, token_owner_account_a, token_vault_b, token_vault_a, token_owner_account_b, token_program_b, position_authority, memo_program
//   increase_liquidity_v2        0x0ab0ee45df591d85  -> ix_increase_liquidity_v2
//     accounts [str, order of first use]: whirlpool, position, position_token_account, token_mint_a, token_mint_b, tick_array_lower, tick_array_upper, token_program_a, token_owner_account_a, token_vault_b, token_vault_a, token_owner_account_b, token_program_b, position_authority, memo_program
//   initialize_adaptive_fee_tier 0x30757b8dc8d0634d  -> ix_initialize_adaptive_fee_tier
//     accounts [str, order of first use]: whirlpools_config, funder, adaptive_fee_tier, fee_authority, system_program
//   initialize_config            0x46c4bec201157fd0  -> ix_initialize_config
//     accounts [str, order of first use]: funder, config, system_program
//   initialize_config_extension  0x34d1397209350937  -> ix_initialize_config_extension
//     accounts [str, order of first use]: config, funder, config_extension, fee_authority, system_program
//   initialize_dynamic_tick_array 0x328ee778c8a52129  -> ix_initialize_dynamic_tick_array
//     accounts [str, order of first use]: whirlpool, tick_array, funder, system_program
//   initialize_fee_tier          0x1e2a0270a09c4ab7  -> ix_initialize_fee_tier
//     accounts [str, order of first use]: config, funder, fee_tier, fee_authority, system_program
//   initialize_pool              0x28e8ae54ac0ab45f  -> ix_initialize_pool
//     accounts [str, order of first use]: whirlpools_config, token_mint_a, token_mint_b, token_vault_a, fee_tier, rent, whirlpool, token_program, token_vault_b, funder, system_program
//   initialize_pool_v2           0x43cc3f1bf2572dcf  -> ix_initialize_pool_v2
//     accounts [str, order of first use]: whirlpools_config, token_mint_a, token_mint_b, token_badge_a, token_badge_b, token_vault_a, fee_tier, rent, whirlpool, funder, token_program_a, token_program_b, token_vault_b, system_program
//   initialize_pool_with_adaptive_fee 0xc7777cac4c605e8f  -> ix_initialize_pool_with_adaptive_fee
//     accounts [str, order of first use]: whirlpools_config, token_mint_a, token_mint_b, token_badge_a, token_badge_b, token_vault_a, rent, whirlpool, oracle, funder, adaptive_fee_tier, token_program_b, token_program_a, token_vault_b, initialize_pool_authority, system_program
//   initialize_position_bundle   0x41c2121895f12d75  -> ix_initialize_position_bundle
//     accounts [str, order of first use]: position_bundle_owner, rent, position_bundle, position_bundle_mint, position_bundle_token_account, token_program, funder, associated_token_program, system_program
//   initialize_position_bundle_with_metadata 0xf57383f9b3107c5d  -> ix_initialize_position_bundle_with_metadata
//     accounts [str, order of first use]: position_bundle_owner, metadata_update_auth, rent, position_bundle, position_bundle_mint, position_bundle_token_account, token_program, funder, position_bundle_metadata, metadata_program, associated_token_program, system_program
//   initialize_reward            0x44e681f2c4c0875f  -> ix_initialize_reward
//     accounts [str, order of first use]: reward_authority, whirlpool, reward_mint, rent, funder, token_program, reward_vault, system_program
//   initialize_reward_v2         0x3185e5eb324d015b  -> ix_initialize_reward_v2
//     accounts [str, order of first use]: reward_authority, whirlpool, reward_mint, reward_token_badge, rent, funder, reward_vault, reward_token_program, system_program
//   initialize_tick_array        0xb8955b8dd6c1bc0b  -> ix_initialize_tick_array
//     accounts [str, order of first use]: whirlpool, system_program, tick_array, funder
//   initialize_token_badge       0xdf59e01b5fcd4dfd  -> ix_initialize_token_badge
//     accounts [str, order of first use]: whirlpools_config, whirlpools_config_extension, token_mint, funder, token_badge, token_badge_authority, system_program
//   lock_position                0xb9ab0af7fc023ee3  -> ix_lock_position
//     accounts [str, order of first use]: funder, position, position_mint, position_token_account, whirlpool, lock_config, token_2022_program, system_program, position_authority
//   migrate_repurpose_reward_authority_space 0xe7ac62984ff8a1d6  -> ix_migrate_repurpose_reward_authority_space
//     accounts [str, order of first use]: whirlpool
//   open_bundled_position        0x31d4acd5ab7e71a9  -> ix_open_bundled_position
//     accounts [str, order of first use]: position_bundle, position_bundle_token_account, whirlpool, rent, bundled_position, funder, system_program, position_bundle_authority
//   open_position                0x31f0980f4d2f8087  -> ix_open_position
//     accounts [str, order of first use]: funder, whirlpool, rent, position, position_mint, position_token_account, token_program, associated_token_program, system_program, owner
//   open_position_with_metadata  0x3c0e6e3a30861df2  -> ix_open_position_with_metadata
//     accounts [str, order of first use]: funder, whirlpool, rent, metadata_update_auth, position, position_mint, position_token_account, token_program, position_metadata_account, metadata_program, associated_token_program, system_program, owner
//   open_position_with_token_extensions 0xfa8366725c5f2fd4  -> ix_open_position_with_token_extensions
//     accounts [str, order of first use]: funder, position_mint, position_token_account, whirlpool, metadata_update_auth, position, token_2022_program, associated_token_program, system_program, owner
//   reposition_liquidity_v2      0xfd9e13830be0a9bf  -> ix_reposition_liquidity_v2
//     accounts [str, order of first use]: whirlpool, position, token_mint_a, token_mint_b, existing_tick_array_lower, existing_tick_array_upper, new_tick_array_lower, new_tick_array_upper, token_program_a, funder, position_token_account, token_owner_account_a, token_vault_b, token_vault_a, token_owner_account_b, token_program_b, system_program, position_authority, memo_program
//   reset_position_range         0xafa064c28db47ba4  -> ix_reset_position_range
//     accounts [str, order of first use]: funder, whirlpool, position, position_token_account, system_program, position_authority
//   set_adaptive_fee_constants   0x27490cedbdd49e85  -> ix_set_adaptive_fee_constants
//     accounts [str, order of first use]: whirlpool, whirlpools_config, oracle, fee_authority
//   set_collect_protocol_fees_authority 0x43e9e18bf45d9622  -> ix_set_collect_protocol_fees_authority
//     accounts [str, order of first use]: whirlpools_config, new_collect_protocol_fees_authority, collect_protocol_fees_authority
//   set_config_extension_authority 0x8f3cbc1874f15e2c  -> ix_set_config_extension_authority
//     accounts [str, order of first use]: whirlpools_config, whirlpools_config_extension, new_config_extension_authority, config_extension_authority
//   set_config_feature_flag      0x39d2f74312e4ad47  -> ix_set_config_feature_flag
//     accounts [str, order of first use]: whirlpools_config, authority
//   set_default_base_fee_rate    0x07b786a4fb5442e5  -> ix_set_default_base_fee_rate
//     accounts [str, order of first use]: whirlpools_config, adaptive_fee_tier, fee_authority
//   set_default_fee_rate         0xe4d0e5b69dd6d776  -> ix_set_default_fee_rate
//     accounts [str, order of first use]: whirlpools_config, fee_tier, fee_authority
//   set_default_protocol_fee_rate 0x00562397e2f9cd6b  -> ix_set_default_protocol_fee_rate
//     accounts [str, order of first use]: whirlpools_config, fee_authority
//   set_delegated_fee_authority  0x7a03398a93e7eac1  -> ix_set_delegated_fee_authority
//     accounts [str, order of first use]: whirlpools_config, adaptive_fee_tier, new_delegated_fee_authority, fee_authority
//   set_fee_authority            0x846165ed5732011f  -> ix_set_fee_authority
//     accounts [str, order of first use]: whirlpools_config, new_fee_authority, fee_authority
//   set_fee_rate                 0x069e8c084189f335  -> ix_set_fee_rate
//     accounts [str, order of first use]: whirlpools_config, whirlpool, fee_authority
//   set_fee_rate_by_delegated_fee_authority 0x68a2e68372367979  -> ix_set_fee_rate_by_delegated_fee_authority
//     accounts [str, order of first use]: whirlpool, adaptive_fee_tier, delegated_fee_authority
//   set_initialize_pool_authority 0xec6a1a95eb7f2b7d  -> ix_set_initialize_pool_authority
//     accounts [str, order of first use]: whirlpools_config, adaptive_fee_tier, new_initialize_pool_authority, fee_authority
//   set_preset_adaptive_fee_constants 0xc68658539442b984  -> ix_set_preset_adaptive_fee_constants
//     accounts [str, order of first use]: whirlpools_config, adaptive_fee_tier, fee_authority
//   set_protocol_fee_rate        0x839c4f9a3204075f  -> ix_set_protocol_fee_rate
//     accounts [str, order of first use]: whirlpools_config, whirlpool, fee_authority
//   set_reward_authority         0x7f551c53fcb72722  -> ix_set_reward_authority
//     accounts [str, order of first use]: whirlpool, new_reward_authority, reward_authority
//   set_reward_authority_by_super_authority 0x19385d94c6c99af0  -> ix_set_reward_authority_by_super_authority
//     accounts [str, order of first use]: whirlpools_config, whirlpool, new_reward_authority, reward_emissions_super_authority
//   set_reward_emissions         0xf41bb06da856c50d  -> ix_set_reward_emissions
//     accounts [str, order of first use]: whirlpool, reward_vault, reward_authority
//   set_reward_emissions_super_authority 0xb752387ad1c805cf  -> ix_set_reward_emissions_super_authority
//     accounts [str, order of first use]: whirlpools_config, new_reward_emissions_super_authority, reward_emissions_super_authority
//   set_reward_emissions_v2      0x66a030c12048e472  -> ix_set_reward_emissions_v2
//     accounts [str, order of first use]: whirlpool, reward_vault, reward_authority
//   set_token_badge_attribute    0x89f6938a214158e0  -> ix_set_token_badge_attribute
//     accounts [str, order of first use]: whirlpools_config, whirlpools_config_extension, token_mint, token_badge, token_badge_authority
//   set_token_badge_authority    0xb20d4fcd2004cacf  -> ix_set_token_badge_authority
//     accounts [str, order of first use]: whirlpools_config, whirlpools_config_extension, new_token_badge_authority, config_extension_authority
//   swap                         0xc88775e1919ec6f8  -> ix_swap
//     accounts [str, order of first use]: token_program, whirlpool, token_owner_account_a, token_vault_a, token_owner_account_b, tick_array_0, tick_array_1, tick_array_2, oracle, token_vault_b, token_authority
//   swap_v2                      0x621ec91a0bed042b  -> ix_swap_v2
//     accounts [str, order of first use]: token_program_a, whirlpool, token_mint_a, token_mint_b, tick_array_0, tick_array_1, tick_array_2, oracle, token_owner_account_a, token_vault_a, token_owner_account_b, token_vault_b, token_program_b, token_authority, memo_program
//   transfer_locked_position     0x8ac28a432ee579b3  -> ix_transfer_locked_position
//     accounts [str, order of first use]: position_authority, receiver, position, position_mint, position_token_account, destination_token_account, lock_config, token_2022_program
//   two_hop_swap                 0xe6dba2446ced60c3  -> ix_two_hop_swap
//     accounts [str, order of first use]: token_program, whirlpool_one, whirlpool_two, token_owner_account_one_a, token_vault_one_a, tick_array_one_0, tick_array_one_1, tick_array_one_2, tick_array_two_0, tick_array_two_1, tick_array_two_2, oracle_one, oracle_two, token_owner_account_one_b, token_vault_one_b, token_owner_account_two_a, token_vault_two_a, token_owner_account_two_b, token_vault_two_b, token_authority
//   two_hop_swap_v2              0x75c202fe1dd18fba  -> ix_two_hop_swap_v2
//     accounts [str, order of first use]: whirlpool_one, whirlpool_two, token_mint_input, token_mint_intermediate, token_mint_output, tick_array_one_0, tick_array_one_1, tick_array_one_2, tick_array_two_0, tick_array_two_1, tick_array_two_2, oracle_one, oracle_two, token_owner_account_input, token_vault_one_input, token_vault_two_intermediate, token_owner_account_output, token_vault_two_output, token_vault_one_intermediate, token_program_output, token_program_intermediate, token_program_input, memo_program, token_authority
//   update_fees_and_rewards      0xdf4bd1ec0dfae69a  -> ix_update_fees_and_rewards
//     accounts [str, order of first use]: whirlpool, position, tick_array_lower, tick_array_upper

export { ix_idl_create_account } from './ix/idl_create_account.ts'
export { ix_idl_resize_account } from './ix/idl_resize_account.ts'
export { ix_idl_close_account } from './ix/idl_close_account.ts'
export { ix_idl_write } from './ix/idl_write.ts'
export { ix_idl_set_buffer } from './ix/idl_set_buffer.ts'
export { ix_initialize_config } from './ix/initialize_config.ts'
export { ix_initialize_pool } from './ix/initialize_pool.ts'
export { ix_initialize_tick_array } from './ix/initialize_tick_array.ts'
export { ix_initialize_dynamic_tick_array } from './ix/initialize_dynamic_tick_array.ts'
export { ix_initialize_fee_tier } from './ix/initialize_fee_tier.ts'
export { ix_initialize_reward } from './ix/initialize_reward.ts'
export { ix_set_reward_emissions } from './ix/set_reward_emissions.ts'
export { ix_open_position } from './ix/open_position.ts'
export { ix_open_position_with_metadata } from './ix/open_position_with_metadata.ts'
export { ix_increase_liquidity } from './ix/increase_liquidity.ts'
export { ix_decrease_liquidity } from './ix/decrease_liquidity.ts'
export { ix_update_fees_and_rewards } from './ix/update_fees_and_rewards.ts'
export { ix_collect_fees } from './ix/collect_fees.ts'
export { ix_collect_reward } from './ix/collect_reward.ts'
export { ix_collect_protocol_fees } from './ix/collect_protocol_fees.ts'
export { ix_swap } from './ix/swap.ts'
export { ix_close_position } from './ix/close_position.ts'
export { ix_set_default_fee_rate } from './ix/set_default_fee_rate.ts'
export { ix_set_default_protocol_fee_rate } from './ix/set_default_protocol_fee_rate.ts'
export { ix_set_fee_rate } from './ix/set_fee_rate.ts'
export { ix_set_protocol_fee_rate } from './ix/set_protocol_fee_rate.ts'
export { ix_set_fee_authority } from './ix/set_fee_authority.ts'
export { ix_set_collect_protocol_fees_authority } from './ix/set_collect_protocol_fees_authority.ts'
export { ix_set_reward_authority } from './ix/set_reward_authority.ts'
export { ix_set_reward_authority_by_super_authority } from './ix/set_reward_authority_by_super_authority.ts'
export { ix_set_reward_emissions_super_authority } from './ix/set_reward_emissions_super_authority.ts'
export { ix_two_hop_swap } from './ix/two_hop_swap.ts'
export { ix_initialize_position_bundle } from './ix/initialize_position_bundle.ts'
export { ix_initialize_position_bundle_with_metadata } from './ix/initialize_position_bundle_with_metadata.ts'
export { ix_delete_position_bundle } from './ix/delete_position_bundle.ts'
export { ix_open_bundled_position } from './ix/open_bundled_position.ts'
export { ix_close_bundled_position } from './ix/close_bundled_position.ts'
export { ix_open_position_with_token_extensions } from './ix/open_position_with_token_extensions.ts'
export { ix_close_position_with_token_extensions } from './ix/close_position_with_token_extensions.ts'
export { ix_lock_position } from './ix/lock_position.ts'
export { ix_reset_position_range } from './ix/reset_position_range.ts'
export { ix_transfer_locked_position } from './ix/transfer_locked_position.ts'
export { ix_initialize_adaptive_fee_tier } from './ix/initialize_adaptive_fee_tier.ts'
export { ix_set_default_base_fee_rate } from './ix/set_default_base_fee_rate.ts'
export { ix_set_delegated_fee_authority } from './ix/set_delegated_fee_authority.ts'
export { ix_set_initialize_pool_authority } from './ix/set_initialize_pool_authority.ts'
export { ix_set_preset_adaptive_fee_constants } from './ix/set_preset_adaptive_fee_constants.ts'
export { ix_initialize_pool_with_adaptive_fee } from './ix/initialize_pool_with_adaptive_fee.ts'
export { ix_set_fee_rate_by_delegated_fee_authority } from './ix/set_fee_rate_by_delegated_fee_authority.ts'
export { ix_set_adaptive_fee_constants } from './ix/set_adaptive_fee_constants.ts'
export { ix_set_config_feature_flag } from './ix/set_config_feature_flag.ts'
export { ix_migrate_repurpose_reward_authority_space } from './ix/migrate_repurpose_reward_authority_space.ts'
export { ix_collect_fees_v2 } from './ix/collect_fees_v2.ts'
export { ix_collect_protocol_fees_v2 } from './ix/collect_protocol_fees_v2.ts'
export { ix_collect_reward_v2 } from './ix/collect_reward_v2.ts'
export { ix_decrease_liquidity_v2 } from './ix/decrease_liquidity_v2.ts'
export { ix_increase_liquidity_v2 } from './ix/increase_liquidity_v2.ts'
export { ix_increase_liquidity_by_token_amounts_v2 } from './ix/increase_liquidity_by_token_amounts_v2.ts'
export { ix_initialize_pool_v2 } from './ix/initialize_pool_v2.ts'
export { ix_initialize_reward_v2 } from './ix/initialize_reward_v2.ts'
export { ix_set_reward_emissions_v2 } from './ix/set_reward_emissions_v2.ts'
export { ix_swap_v2 } from './ix/swap_v2.ts'
export { ix_two_hop_swap_v2 } from './ix/two_hop_swap_v2.ts'
export { ix_reposition_liquidity_v2 } from './ix/reposition_liquidity_v2.ts'
export { ix_initialize_config_extension } from './ix/initialize_config_extension.ts'
export { ix_set_config_extension_authority } from './ix/set_config_extension_authority.ts'
export { ix_set_token_badge_authority } from './ix/set_token_badge_authority.ts'
export { ix_initialize_token_badge } from './ix/initialize_token_badge.ts'
export { ix_delete_token_badge } from './ix/delete_token_badge.ts'
export { ix_set_token_badge_attribute } from './ix/set_token_badge_attribute.ts'
export { ix_idl_include } from './ix/idl_include.ts'
export { entrypoint } from './entrypoint.ts'
// security/summary.md: read first — instructions ranked by sensitivity, their effects, privileges and checks (derived, over-approximate views; security/<ix>.md per instruction, security/analysis.json)
