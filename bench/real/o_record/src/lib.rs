// bench copy of spl-record 0.3.0 (Apache-2.0, solana-program-library record program, crates.io spl-record-0.3.0);
// unchanged apart from the v_* features, each removing exactly one validation (bench/expected/o_record.json).
//! Record program
#![deny(missing_docs)]

mod entrypoint;
pub mod error;
pub mod instruction;
pub mod processor;
pub mod state;

// Export current SDK types for downstream users building with a different SDK
// version
pub use {
	solana_account_info, solana_decode_error, solana_instruction, solana_msg,
	solana_program_entrypoint, solana_program_error, solana_program_pack, solana_pubkey,
};

solana_pubkey::declare_id!("recr1L3PCGKLbckBqMNcJhuuyU1zgo8nBhfLVsJNwr5");
