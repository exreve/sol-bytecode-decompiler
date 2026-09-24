import { hashName } from './murmur.ts';

/** Syscall signature. Parameter names become the argument hints in the output. `ret` = returns a meaningful u64. */
export interface Syscall { name: string; alias: string; params: string[]; ret: boolean; noreturn?: boolean; doc: string }

const S = (name: string, params: string[], ret: boolean, doc: string, noreturn = false): Syscall =>
  ({ name, alias: name.replace(/_$/, ''), params, ret, doc, noreturn });

export const SYSCALLS: Syscall[] = [
  S('abort', [], false, 'abort program execution (panic)', true),
  S('sol_panic_', ['file', 'len', 'line', 'column'], false, 'panic with file:line:column', true),
  S('sol_log_', ['msg', 'len'], false, 'log utf8 message'),
  S('sol_log_64_', ['a1', 'a2', 'a3', 'a4', 'a5'], false, 'log 5 u64 values as hex'),
  S('sol_log_compute_units_', [], false, 'log remaining compute units'),
  S('sol_log_pubkey', ['pubkey'], false, 'log base58 pubkey (32 bytes)'),
  S('sol_log_data', ['slices', 'len'], false, 'log base64 data: slices = &[&[u8]]'),
  S('sol_create_program_address', ['seeds', 'seedsLen', 'programId', 'outAddr'], true, 'derive PDA from seeds (&[&[u8]]); 0 = ok'),
  S('sol_try_find_program_address', ['seeds', 'seedsLen', 'programId', 'outAddr', 'outBump'], true, 'find PDA + bump seed; 0 = ok'),
  S('sol_sha256', ['vals', 'len', 'out'], true, 'sha256 over slices (&[&[u8]]) -> out[32]'),
  S('sol_keccak256', ['vals', 'len', 'out'], true, 'keccak256 over slices -> out[32]'),
  S('sol_blake3', ['vals', 'len', 'out'], true, 'blake3 over slices -> out[32]'),
  S('sol_poseidon', ['params', 'endianness', 'vals', 'len', 'out'], true, 'poseidon hash'),
  S('sol_secp256k1_recover', ['hash', 'recoveryId', 'signature', 'out'], true, 'recover secp256k1 pubkey -> out[64]'),
  S('sol_invoke_signed_c', ['ix', 'accountInfos', 'accountInfosLen', 'signerSeeds', 'signerSeedsLen'], true, 'CPI (C ABI structs)'),
  S('sol_invoke_signed_rust', ['ix', 'accountInfos', 'accountInfosLen', 'signerSeeds', 'signerSeedsLen'], true, 'CPI (Rust ABI: &Instruction, &[AccountInfo], &[&[&[u8]]])'),
  S('sol_alloc_free_', ['size', 'freePtr'], true, 'deprecated heap alloc/free'),
  S('sol_set_return_data', ['data', 'len'], false, 'set program return data'),
  S('sol_get_return_data', ['data', 'len', 'programId'], true, 'get return data of last CPI -> copied length'),
  S('sol_get_stack_height', [], true, 'current invocation stack height'),
  S('sol_get_processed_sibling_instruction', ['index', 'meta', 'programId', 'data', 'accounts'], true, 'read processed sibling instruction'),
  S('sol_memcpy_', ['dst', 'src', 'n'], false, 'memcpy (non-overlapping)'),
  S('sol_memmove_', ['dst', 'src', 'n'], false, 'memmove'),
  S('sol_memcmp_', ['a', 'b', 'n', 'outI32'], false, 'memcmp; *outI32 = result'),
  S('sol_memset_', ['dst', 'byte', 'n'], false, 'memset'),
  S('sol_get_clock_sysvar', ['out'], true, 'Clock sysvar -> out'),
  S('sol_get_epoch_schedule_sysvar', ['out'], true, 'EpochSchedule sysvar -> out'),
  S('sol_get_rent_sysvar', ['out'], true, 'Rent sysvar -> out'),
  S('sol_get_fees_sysvar', ['out'], true, 'Fees sysvar -> out'),
  S('sol_get_last_restart_slot', ['out'], true, 'LastRestartSlot sysvar -> out'),
  S('sol_get_epoch_rewards_sysvar', ['out'], true, 'EpochRewards sysvar -> out'),
  S('sol_get_sysvar', ['sysvarId', 'out', 'offset', 'len'], true, 'read sysvar bytes'),
  S('sol_get_epoch_stake', ['voteAddr'], true, 'epoch stake of vote account'),
  S('sol_remaining_compute_units', [], true, 'remaining compute units'),
  S('sol_curve_validate_point', ['curveId', 'point', 'out'], true, 'curve point validation'),
  S('sol_curve_group_op', ['curveId', 'op', 'left', 'right', 'out'], true, 'curve group op'),
  S('sol_curve_multiscalar_mul', ['curveId', 'scalars', 'points', 'n', 'out'], true, 'curve multiscalar mul'),
  S('sol_curve_pairing_map', ['curveId', 'point', 'out'], true, 'curve pairing map'),
  S('sol_alt_bn128_group_op', ['op', 'input', 'len', 'out'], true, 'alt_bn128 group op'),
  S('sol_alt_bn128_compression', ['op', 'input', 'len', 'out'], true, 'alt_bn128 compression'),
  S('sol_big_mod_exp', ['params', 'out'], true, 'big modular exponentiation'),
];

export const SYSCALL_BY_HASH = new Map<number, Syscall>(SYSCALLS.map(s => [hashName(s.name), s]));
export const SYSCALL_BY_NAME = new Map<string, Syscall>(SYSCALLS.map(s => [s.name, s]));

/** Signature for an unknown imported symbol: assume full 5-register ABI. */
export const unknownSyscall = (name: string): Syscall => S(name, ['a1', 'a2', 'a3', 'a4', 'a5'], true, 'unknown syscall');
