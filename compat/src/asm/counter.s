# Hand-written sBPF counter (sbpf assembler): exactly one signed + writable account, adds the byte sum of the
# instruction data to the u64 at the start of its data, logs; a local function call and a loop.
.globl entrypoint
entrypoint:
  ldxdw r2, [r1+0]
  jne r2, 1, err_accounts
  ldxb r3, [r1+9]
  jeq r3, 0, err_signer
  ldxb r3, [r1+10]
  jeq r3, 0, err_writable
  ldxdw r4, [r1+88]
  jlt r4, 8, err_small
  mov64 r5, r1
  add64 r5, r4
  add64 r5, 10343
  and64 r5, -8
  add64 r5, 8
  ldxdw r6, [r5+0]
  add64 r5, 8
  mov64 r7, r1
  mov64 r1, r5
  mov64 r2, r6
  call sum_bytes
  mov64 r8, r0
  ldxdw r3, [r7+96]
  add64 r3, r8
  stxdw [r7+96], r3
  mov64 r1, 0
  mov64 r2, 0
  mov64 r4, r8
  mov64 r5, r3
  mov64 r3, r6
  call sol_log_64_
  lddw r1, message
  mov64 r2, 13
  call sol_log_
  mov64 r0, 0
  exit
err_accounts:
  mov64 r0, 1
  exit
err_signer:
  mov64 r0, 2
  exit
err_writable:
  mov64 r0, 3
  exit
err_small:
  mov64 r0, 4
  exit
sum_bytes:
  mov64 r0, 0
sum_loop:
  jeq r2, 0, sum_done
  ldxb r3, [r1+0]
  add64 r0, r3
  add64 r1, 1
  sub64 r2, 1
  ja sum_loop
sum_done:
  exit
.rodata
  message: .ascii "asm: counted"
