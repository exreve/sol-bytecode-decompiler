import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hashName } from '../src/murmur.ts'
import { type Expr, type BinOp, type CmpOp, type Intrinsic, evalBin, evalCmp, evalExt, evalBswap, Trap, INTRINSICS } from '../src/ir.ts'
const FNS = Object.keys(INTRINSICS) as Intrinsic[]
const INTRINSIC_ARITY: Record<string, number> = { popcount: 1, clz: 1, ctz: 1 }
import { Printer } from '../src/print.ts'
import { simplifyExpr } from '../src/simplify.ts'
import { parseFunctions, runFunction } from './evaluate.ts'
import { TestMem } from '../src/emu.ts'
import { Image } from '../src/elf.ts'
import { checkProgram } from './equiv.ts'

test('syscall hashes match the runtime (murmur3)', () => {
	assert.equal(hashName('sol_log_'), 0x207559bd)
	assert.equal(hashName('abort'), 0xb6fc1a11)
})

// ---------- printer / simplifier fuzzing ----------
function rng(seed: number) {
	let x = BigInt(seed) + 0x9e3779b97f4a7c15n
	return () => { x ^= x << 13n; x &= (1n << 64n) - 1n; x ^= x >> 7n; x ^= x << 17n; x &= (1n << 64n) - 1n; return x }
}
const BINS: BinOp[] = ['add', 'sub', 'mul', 'udiv', 'urem', 'sdiv', 'srem', 'sdiv32', 'srem32', 'and', 'or', 'xor', 'shl', 'lshr', 'ashr', 'uhmul', 'shmul']
const CMPS: CmpOp[] = ['eq', 'ne', 'ugt', 'uge', 'ult', 'ule', 'sgt', 'sge', 'slt', 'sle', 'set']

function randExpr(R: () => bigint, depth: number): Expr {
	const k = Number(R() % (depth > 3 ? 3n : 10n))
	if (k === 0) { const m = R() % 4n; return { k: 'const', v: m === 0n ? R() : m === 1n ? R() % 16n : m === 2n ? BigInt.asUintN(64, -(R() % 100n)) : R() % 0x10000n } }
	if (k === 1 || k === 2) return { k: 'var', id: Number(R() % 3n) }
	if (k <= 4) return { k: 'bin', op: BINS[Number(R() % BigInt(BINS.length))], a: randExpr(R, depth + 1), b: randExpr(R, depth + 1) }
	if (k === 5) return { k: 'ext', signed: R() % 2n === 0n, bits: ([8, 16, 32] as const)[Number(R() % 3n)], a: randExpr(R, depth + 1) }
	if (k === 6) return { k: 'cmp', op: CMPS[Number(R() % BigInt(CMPS.length))], a: randExpr(R, depth + 1), b: randExpr(R, depth + 1) }
	if (k === 7) return R() % 2n ? { k: 'neg', a: randExpr(R, depth + 1) } : { k: 'not', a: randExpr(R, depth + 1) }
	if (k === 9) {
		const m = R() % 4n
		if (m === 0n) return { k: 'sel', c: randExpr(R, depth + 1), a: randExpr(R, depth + 1), b: randExpr(R, depth + 1) }
		if (m === 1n) { // select shapes the simplifier rewrites (min/max, flags, clz guards)
			const x = randExpr(R, depth + 2), y = R() % 2n ? randExpr(R, depth + 2) : { k: 'const', v: [0n, 1n, 64n][Number(R() % 3n)] } as Expr
			const c: Expr = { k: 'cmp', op: CMPS[Number(R() % BigInt(CMPS.length))], a: x, b: y }
			const arms: Expr[] = [x, y, { k: 'const', v: 0n }, { k: 'const', v: 1n }, { k: 'const', v: 64n }, { k: 'fn', name: 'clz', args: [x] }, { k: 'fn', name: 'ctz', args: [x] }]
			return { k: 'sel', c, a: arms[Number(R() % 7n)], b: arms[Number(R() % 7n)] }
		}
		const name = FNS[Number(R() % BigInt(FNS.length))]
		return { k: 'fn', name, args: INTRINSIC_ARITY[name] === 1 ? [randExpr(R, depth + 1)] : [randExpr(R, depth + 1), randExpr(R, depth + 1)] }
	}
	return { k: 'bswap', bits: ([16, 32, 64] as const)[Number(R() % 3n)], a: randExpr(R, depth + 1) }
}

function refEval(e: Expr, env: bigint[]): bigint {
	switch (e.k) {
		case 'const': return e.v
		case 'var': return env[e.id]
		case 'bin': return evalBin(e.op, refEval(e.a, env), refEval(e.b, env))
		case 'ext': return evalExt(e.signed, e.bits, refEval(e.a, env))
		case 'cmp': return evalCmp(e.op, refEval(e.a, env), refEval(e.b, env)) ? 1n : 0n
		case 'neg': return BigInt.asUintN(64, -refEval(e.a, env))
		case 'not': return BigInt.asUintN(64, ~refEval(e.a, env))
		case 'bswap': return evalBswap(e.bits, refEval(e.a, env))
		case 'lnot': return refEval(e.a, env) ? 0n : 1n
		case 'land': return refEval(e.a, env) && refEval(e.b, env) ? 1n : 0n
		case 'lor': return refEval(e.a, env) || refEval(e.b, env) ? 1n : 0n
		case 'sel': return refEval(e.c, env) ? refEval(e.a, env) : refEval(e.b, env)
		case 'fn': return INTRINSICS[e.name](e.args.map(a => refEval(a, env)))
		default: throw new Error('unexpected ' + e.k)
	}
}

test('printer + simplifier are exact on random expressions', () => {
	for (let seed = 1; seed <= Number(process.env.FUZZ_SEEDS ?? 2); seed++) fuzz(seed)
})

function fuzz(seed: number) {
	const R = rng(seed)
	const names = ['a', 'b', 'c']
	const pr = new Printer({ fnName: () => 'f', fnAddrName: () => undefined, sysName: n => n, constComment: () => undefined, varName: id => names[id] })
	const mem = new TestMem(new Image([]), 1, [])
	let checked = 0
	for (let i = 0; i < 3000; i++) {
		const e = randExpr(R, 0)
		const env = [R(), R() % 64n, BigInt.asUintN(64, -(R() % 7n))]
		let want: bigint | 'trap'
		try { want = refEval(e, env) } catch (x) { if (x instanceof Trap) want = 'trap'; else throw x }
		for (const variant of [e, simplifyExpr(e)]) {
			const src = `function t(a: u64, b: u64, c: u64): u64 {\n\treturn ${pr.u(variant, 2)}\n}`
			let fn
			try { fn = parseFunctions(src).get('t')! } catch (x) { throw new Error(`${x}\n${src}`) }
			let r
			try { r = runFunction(fn, env, { mem, onCall: () => 0n, fp: 0n, fnAddr: new Map(), fnTarget: new Map(), sysTarget: new Map(), maxSteps: 100 }) }
			catch (x) { throw new Error(`${x}\n${src}\n${JSON.stringify(variant, (_k, v) => (typeof v === "bigint" ? "0x" + v.toString(16) : v))}`) }
			const got = r.abort ? 'trap' : r.ret!
			assert.equal(got, want, `expr ${JSON.stringify(e, (_k, v) => (typeof v === 'bigint' ? '0x' + v.toString(16) : v))}\nprinted ${src}`)
			checked++
		}
	}
	assert.ok(checked > 5000)
}

for (const f of ['memo', 'token', 'ata']) {
	test(`decompiled ${f}.so is equivalent to the bytecode (random differential testing)`, () => {
		const r = checkProgram(new Uint8Array(readFileSync(`samples/${f}.so`)), 3)
		assert.equal(r.errors.length, 0, JSON.stringify(r.errors.slice(0, 3)))
		assert.equal(r.failures.length, 0, JSON.stringify(r.failures.slice(0, 3)))
		assert.ok(r.funcs > 0)
	})
}
