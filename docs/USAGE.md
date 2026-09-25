# Usage guide

Needs only Node ≥ 23.6. No install step, no configuration.

```
node src/cli.ts <program.so | program address> [-o out.ts | -o outdir/] [--rpc <url>] [--idl <file.json>] [--full]
```

## Decompile

```sh
node src/cli.ts program.so                        # print to the terminal
node src/cli.ts program.so -o program.ts          # one file
node src/cli.ts program.so -o program/            # a project (recommended for big programs)
```

A deployed program, by address — bring your own RPC endpoint (there is no built-in one):

```sh
node src/cli.ts whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc --rpc https://your-rpc.example -o whirlpool/
```

If the program published an Anchor IDL on-chain it is used automatically (instruction arguments,
account names and flags, account data fields, error names). For a local binary, pass the IDL file:

```sh
node src/cli.ts program.so --idl idl.json -o program/
```

From the Solana CLI through stdin:

```sh
solana program dump <address> /dev/stdout | node src/cli.ts - -o program/
```

## What you get (`-o program/`)

```
program/index.ts        start here: program summary, instruction table (args/accounts with an IDL)
program/bundle/<ix>.ts  one instruction, self-contained: handler + all code it reaches + stubs it needs
program/ix/<ix>.ts      the handler and helpers used only by it
program/shared.ts       helpers used by several instructions
program/entrypoint.ts   entrypoint, dispatcher, remaining code
program/lib.d.ts        runtime model (what every helper means), syscalls, library stubs
program/slices/         unverified cross-references (CPIs, PDAs, account checks/writes)
```

For AI review: give the model `index.ts` + `lib.d.ts`, then one `bundle/<ix>.ts` at a time.

Names carry their source: `[idl]` Anchor IDL, `[str]` the program's own strings, `[known]` well-known
programs/layouts, `[heur]` inferred (verify).

## Library code

Generic library code (Rust std, solana-program, anchor-lang, spl, …) is shown as one-line typed stubs
with its Rust name. `--full` decompiles it too.

## Many programs

```sh
for p in $(cat program_ids.txt); do node src/cli.ts "$p" --rpc https://your-rpc.example -o "out/$p/" || echo "failed: $p"; done
```

## Discriminators

```sh
node src/selector.ts 0xc88775e1919ec6f8    # a constant as printed in the output -> i:swap
node src/selector.ts f8c69e91e17587c8      # raw instruction-data bytes work too
node src/selector.ts deposit               # name -> instruction / account / event discriminators
```

## Check a decompilation

```sh
node --stack-size=65500 test/equiv.ts program.so 3
```

Runs every function on random inputs in an independent sBPF emulator and in the emitted TypeScript,
and compares calls, memory writes, return values and aborts. Expected: `0 failing functions`.
