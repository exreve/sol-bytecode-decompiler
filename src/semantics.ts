// Solana-specific knowledge: syscall names, well-known constants, rodata strings.
import type { Program, Func } from './program.ts';
import type { Expr } from './ir.ts';

export class Semantics {
	p: Program
	constructor(p: Program) { this.p = p }
	syscallName(n: string): string { return this.p.syscalls.get(n)?.alias ?? n }
	constComment(_v: bigint): string | undefined { return undefined }
	sugar(_e: Expr, _pr: (e: Expr, prec: number) => string): string | undefined { return undefined }
	funcComment(_f: Func): string | undefined { return undefined }
	header(): string { return '' }
}
