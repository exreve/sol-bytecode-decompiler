# Usage guide

All commands run from the repository root with Node ≥ 23.6 (`npm install` only adds the test
dependencies). `sbpf-decompile` below means `node src/cli.ts` (or the `sbpf-decompile` bin after
`npm link`).

## 1. Get the program

**Local file** — any deployed program binary:

```sh
node src/cli.ts program.so -o out.ts
```

**By address** — fetched from an RPC endpoint you choose. There is no built-in endpoint: pass
`--rpc`, or set `SOLANA_RPC_URL` once.

```sh
node src/cli.ts TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --rpc https://your-rpc.example -o token22.ts

export SOLANA_RPC_URL=https://your-rpc.example
node src/cli.ts whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc -o whirlpool/
```

Upgradeable programs are resolved through their programdata account; loader v4 and the legacy
loaders work too. `--save-so program.so` keeps the downloaded binary.

**From stdin** — e.g. with the Solana CLI:

```sh
solana program dump <address> /dev/stdout | node src/cli.ts - -o out.ts
```

## 2. Choose the output

| command | result |
|---|---|
| `sbpf-decompile p.so` | single file on stdout |
| `sbpf-decompile p.so -o out.ts` | single file |
| `sbpf-decompile p.so -o out/` | project layout (below) |

Project layout:

```
out/index.ts        start here: program summary, instruction table (+ args/accounts with an IDL)
out/bundle/<ix>.ts  one instruction, self-contained: handler + all code it reaches + stubs it needs
out/ix/<ix>.ts      the handler and helpers used only by it
out/shared.ts       helpers used by several instructions
out/entrypoint.ts   entrypoint, dispatcher, remaining code
out/lib.d.ts        runtime model (what every helper means), syscalls, library stubs
```

For AI review, give the model `index.ts` + `lib.d.ts`, then one `bundle/<ix>.ts` at a time.

## 3. Names from an Anchor IDL (optional)

With an address input the on-chain IDL is used automatically when the program published one
(`--no-idl` to skip). Otherwise:

```sh
sbpf-decompile p.so --idl idl.json -o out/                         # IDL file
sbpf-decompile p.so --program-id <address> --rpc <url> -o out/     # on-chain IDL for a local binary
```

The IDL adds instruction arguments and accounts (signer / mut / pda / fixed address) to the index
and names custom error codes. Without it, instruction names still come from Anchor
`"Instruction: X"` logs and the bundled discriminator dataset.

## 4. Options that change the code

| option | effect |
|---|---|
| `--full` | also decompile recognized library functions (default: one-line typed stubs) |
| `--raw` | no Solana-specific names or comments (the form the equivalence tests verify) |
| `--exact-memory` | keep every stack access in memory; exact even for executions that corrupt their own stack frame |

## 5. Many programs

```sh
export SOLANA_RPC_URL=https://your-rpc.example
for p in $(cat program_ids.txt); do node src/cli.ts "$p" -o "out/$p/" || echo "failed: $p"; done
```

Big programs may need a larger stack: `node --stack-size=65500 src/cli.ts …` (and `ulimit -s unlimited`).

## 6. Discriminators

```sh
node src/selector.ts 0xc88775e1919ec6f8    # a constant as printed in the output -> i:swap
node src/selector.ts f8c69e91e17587c8      # raw instruction-data bytes work too
node src/selector.ts deposit               # name -> instruction / account / event discriminators
```

## 7. Verify a decompilation

```sh
node --stack-size=65500 test/equiv.ts program.so 3
```

Runs every function of the program on random inputs in an independent sBPF emulator and in the
emitted TypeScript, and compares calls, memory writes, return values and aborts. Expected result:
`0 failing functions`.

## Reading the output

Every value is a `u64`; memory is accessed with `ld64(addr)` / `st64(addr, v)`; `fp` is the stack
frame and `s30` means `fp - 0x30`. The full runtime model is at the top of every output file and in
the README ([Output](../README.md#output)).
