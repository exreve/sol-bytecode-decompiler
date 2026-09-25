import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hashName } from '../src/murmur.ts'
import { type Expr, type BinOp, type CmpOp, type Intrinsic, evalBin, evalCmp, evalExt, evalBswap, Trap, INTRINSICS } from '../src/ir.ts'
const FNS = Object.keys(INTRINSICS) as Intrinsic[]
const INTRINSIC_ARITY: Record<string, number> = { popcount: 1, clz: 1, ctz: 1 }
import { Printer, printBody } from '../src/print.ts'
import { statementIdioms } from '../src/stmtidioms.ts'
import type { Node } from '../src/structure.ts'
import type { VarFunc } from '../src/dataflow.ts'
import { simplifyExpr } from '../src/simplify.ts'
import { parseFunctions, runFunction } from './evaluate.ts'
import { TestMem, Abort } from '../src/emu.ts'
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
			const d: Expr = { k: 'bin', op: 'sub', a: x, b: y }
			const sides = [[x, y], [y, x], [d, x], [x, d]]
			const [ca, cb] = sides[Number(R() % 4n)]
			const c: Expr = { k: 'cmp', op: CMPS[Number(R() % BigInt(CMPS.length))], a: ca, b: cb }
			const arms: Expr[] = [x, y, { k: 'const', v: 0n }, { k: 'const', v: 1n }, { k: 'const', v: 64n }, { k: 'fn', name: 'clz', args: [x] }, { k: 'fn', name: 'ctz', args: [x] }, d]
			if (R() % 3n === 0n) return c
			return { k: 'sel', c, a: arms[Number(R() % 8n)], b: arms[Number(R() % 8n)] }
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
		case 'fn': return INTRINSICS[e.name as keyof typeof INTRINSICS](e.args.map(a => refEval(a, env)))
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
			let body = pr.u(variant, 2)
			if (/<<.*> \(/.test(body)) { pr.shlCall = true; body = pr.u(variant, 2); pr.shlCall = false }
			const src = `function t(a: u64, b: u64, c: u64): u64 {\n\treturn ${body}\n}`
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

test('keyeq / memeq print and evaluate as word-wise memory comparisons', () => {
	const R = rng(7)
	const pr = new Printer({ fnName: () => 'f', fnAddrName: () => undefined, sysName: n => n, constComment: () => undefined, varName: id => 'abc'[id] })
	for (let i = 0; i < 200; i++) {
		// keys with leading zero bytes exercise base58 '1' prefixes
		const words = [0, 1, 2, 3].map(k => (k === 0 && i % 4 === 0 ? R() >> BigInt(8 * (1 + (i % 7))) : R()))
		const p = 0x3_0000_0000n + (R() % 0x100n) * 8n, q = p + 0x1000n
		const flip = i % 5 === 4 ? -1 : i % 5 // byte group to corrupt (-1: none)
		const mem = new TestMem(new Image([]), 1, [])
		words.forEach((w, k) => { mem.store(p + BigInt(8 * k), 8, w); mem.store(q + BigInt(8 * k), 8, w) })
		if (flip >= 0) mem.store(q + BigInt(8 * flip + (i % 8)), 1, (mem.load(q + BigInt(8 * flip + (i % 8)), 1) + 1n) & 0xffn)
		const want = flip < 0 ? 1n : 0n
		const exprs: Expr[] = [
			{ k: 'fn', name: 'keyeq', args: [{ k: 'var', id: 1 }, ...words.map(v => ({ k: 'const', v }) as Expr)] },
			{ k: 'fn', name: 'memeq', args: [{ k: 'var', id: 0 }, { k: 'var', id: 1 }, { k: 'const', v: 32n }] },
		]
		for (const e of exprs) {
			const src = `function t(a: u64, b: u64, c: u64): u64 {\n\treturn ${pr.u(e, 2)}\n}`
			const r = runFunction(parseFunctions(src).get('t')!, [p, q, 0n], { mem, onCall: () => 0n, fp: 0n, fnAddr: new Map(), fnTarget: new Map(), sysTarget: new Map(), maxSteps: 100 })
			assert.equal(r.ret, want, src)
		}
	}
})

for (const f of ['memo', 'token', 'ata']) for (const sugar of [false, true]) {
	test(`decompiled ${f}.so (${sugar ? 'readable' : 'raw'} output) is equivalent to the bytecode (random differential testing)`, () => {
		const r = checkProgram(new Uint8Array(readFileSync(`samples/${f}.so`)), 3, Infinity, undefined, false, undefined, sugar)
		assert.equal(r.errors.length, 0, JSON.stringify(r.errors.slice(0, 3)))
		assert.equal(r.failures.length, 0, JSON.stringify(r.failures.slice(0, 3)))
		assert.ok(r.funcs > 0)
	})
}

test('rc_inc / rc_dec statement idioms: same loads, stores, abort and result as the statements they replace', () => {
	const V = (id: number): Expr => ({ k: 'var', id })
	const C = (v: bigint): Expr => ({ k: 'const', v })
	const M = (1n << 64n) - 1n
	const abort: Node[] = [{ k: 'stmt', s: { k: 'call', dst: -1, t: { k: 'sys', name: 'abort', hash: 0 }, args: [], pc: 0 } }, { k: 'trap', msg: '' }]
	const inc = (p: Expr): Node[] => [
		{ k: 'stmt', s: { k: 'store', size: 8, addr: p, v: { k: 'bin', op: 'add', a: V(3), b: C(1n) }, pc: 0 } },
		{ k: 'if', c: { k: 'cmp', op: 'eq', a: V(3), b: C(M) }, then: abort, else: [] },
	]
	const a8: Expr = { k: 'bin', op: 'add', a: V(0), b: C(8n) }
	const dec = (p: Expr): Node[] => [
		{ k: 'stmt', s: { k: 'store', size: 8, addr: p, v: { k: 'bin', op: 'add', a: V(3), b: C(M) }, pc: 0 } },
		{ k: 'if', c: { k: 'cmp', op: 'eq', a: V(3), b: C(1n) }, then: [{ k: 'stmt', s: { k: 'store', size: 8, addr: a8, v: { k: 'bin', op: 'add', a: { k: 'load', size: 8, addr: a8 }, b: C(M) }, pc: 0 } }], else: [] },
	]
	const bodies: Node[][] = [
		// x = ld64(a); y = b + 1; st64(a, x + 1); if (x == -1) abort(); return y   -> rc_inc(a)
		[{ k: 'stmt', s: { k: 'set', dst: 3, e: { k: 'load', size: 8, addr: V(0) }, pc: 0 } },
			{ k: 'stmt', s: { k: 'set', dst: 4, e: { k: 'bin', op: 'add', a: V(1), b: C(1n) }, pc: 0 } },
			...inc(V(0)), { k: 'return', e: V(4) }],
		// the count loaded from elsewhere: rc_inc(a, x)
		[{ k: 'stmt', s: { k: 'set', dst: 3, e: { k: 'load', size: 8, addr: V(1) }, pc: 0 } },
			...inc(V(0)), { k: 'return', e: { k: 'load', size: 8, addr: V(0) } }],
		// x = ld64(a); st64(a, x - 1); if (x == 1) st64(a + 8, ld64(a + 8) - 1); return ld64(a + 8)  -> rc_dec(a)
		[{ k: 'stmt', s: { k: 'set', dst: 3, e: { k: 'load', size: 8, addr: V(0) }, pc: 0 } }, ...dec(V(0)),
			{ k: 'return', e: { k: 'load', size: 8, addr: { k: 'bin', op: 'add', a: V(0), b: C(8n) } } }],
		[{ k: 'stmt', s: { k: 'set', dst: 3, e: { k: 'load', size: 8, addr: V(1) }, pc: 0 } }, ...dec(V(0)),
			{ k: 'return', e: { k: 'load', size: 8, addr: { k: 'bin', op: 'add', a: V(0), b: C(8n) } } }],
		// inverted: st64(a, x + 1); if (x != -1) { …; return } abort()   -> rc_inc(a); …; return
		[{ k: 'stmt', s: { k: 'set', dst: 3, e: { k: 'load', size: 8, addr: V(0) }, pc: 0 } },
			inc(V(0))[0],
			{ k: 'if', c: { k: 'cmp', op: 'ne', a: V(3), b: C(M) }, then: [{ k: 'stmt', s: { k: 'set', dst: 4, e: { k: 'bin', op: 'add', a: V(1), b: C(1n) }, pc: 0 } }, { k: 'return', e: V(4) }], else: [] },
			...abort],
		// a pure assignment between the store and the check
		[{ k: 'stmt', s: { k: 'set', dst: 3, e: { k: 'load', size: 8, addr: V(0) }, pc: 0 } }, dec(V(0))[0],
			{ k: 'stmt', s: { k: 'set', dst: 4, e: { k: 'bin', op: 'add', a: V(1), b: C(1n) }, pc: 0 } }, dec(V(0))[1],
			{ k: 'return', e: { k: 'bin', op: 'add', a: V(4), b: { k: 'load', size: 8, addr: a8 } } }],
	]
	const names = ['a', 'b', 'c', 'x', 'y']
	const pr = new Printer({ fnName: () => 'f', fnAddrName: () => undefined, sysName: n => n, constComment: () => undefined, varName: id => names[id] })
	const f = { vars: names.map((_, id) => ({ id, reg: id, param: id < 3 ? id + 1 : -1, undef: false })) } as unknown as VarFunc
	for (const body of bodies) {
		const src = (b: Node[]) => `function t(a: u64, b: u64, c: u64): u64 {\n${printBody(pr, f, b, '\t', new Map(), [3, 4]).join('\n')}\n}`
		const before = src(body), after = src(statementIdioms(body))
		assert.ok(/rc_(inc|dec)\(/.test(after) && !after.includes('abort') && !after.includes('if'), after)
		for (const v of [0n, 1n, 2n, 5n, M, M - 1n]) {
			const run = (text: string) => {
				const mem = new TestMem(new Image([]), 1, [])
				mem.store(0x3_0000_0000n, 8, v); mem.store(0x3_0000_0008n, 8, 3n); mem.store(0x3_0000_0100n, 8, (v + 7n) & M)
				const calls: string[] = []
				const r = runFunction(parseFunctions(text).get('t')!, [0x3_0000_0000n, 0x3_0000_0100n, 0n], {
					mem, fp: 0n, fnAddr: new Map(), fnTarget: new Map(), sysTarget: new Map([['abort', 'sys:abort']]), maxSteps: 100,
					onCall: t => { calls.push(t); if (t === 'sys:abort') throw new Abort('abort'); return 0n },
				})
				return JSON.stringify({ r: r.ret?.toString(), abort: !!r.abort, calls, m: [0n, 8n, 0x100n].map(o => mem.load(0x3_0000_0000n + o, 8).toString()) })
			}
			assert.equal(run(after), run(before), `${before}\n${after}`)
		}
	}
})

test('typed views: x.field / x[k].field / nested embedded fields print and evaluate as the loads and stores they replace', async () => {
	const { Views, VIEW_NOTATION } = await import('../src/views.ts')
	const V = new Views()
	const R = rng(11)
	const types = ['AccountInfo', 'AccountRecord', 'Input']
	const decls = [...VIEW_NOTATION, ...V.render(types)].join('\n')
	let viewed = 0
	for (let i = 0; i < 400; i++) {
		const ty = types[i % 3]
		const size = ([1, 2, 4, 8] as const)[Number(R() % 4n)]
		const off = BigInt(Number(R() % 0xa0n))
		const addr: Expr = { k: 'bin', op: 'add', a: { k: 'var', id: 0 }, b: { k: 'const', v: off } }
		const pr = new Printer({ fnName: () => 'f', fnAddrName: () => undefined, sysName: n => n, constComment: () => undefined, varName: id => 'abc'[id], views: V, varType: id => (id === 0 ? ty : undefined) })
		const load = pr.u({ k: 'load', size, addr }, 2)
		const lv = pr.viewLvalue(size, addr)
		if (/\.\w/.test(load)) viewed++
		const src = `${decls}\nfunction t(a: ${ty}, b: u64, c: u64): u64 {\n\t${lv ? `${lv} = b` : `st${size * 8}(${pr.u(addr, 2)}, b)`}\n\treturn ${load} + ${pr.u(addr, 12)}\n}`
		const mem = new TestMem(new Image([]), i, [])
		const base = 0x3_0000_0000n + (R() % 0x100n) * 8n
		const val = R()
		const r = runFunction(parseFunctions(src).get('t')!, [base, val, 0n], { mem, onCall: () => 0n, fp: 0n, fnAddr: new Map(), fnTarget: new Map(), sysTarget: new Map(), maxSteps: 100 })
		const want = (val & ((1n << BigInt(size * 8)) - 1n)) + base + off
		assert.equal(r.ret, want & ((1n << 64n) - 1n), src)
	}
	assert.ok(viewed > 100, `only ${viewed} loads printed as views`)
})
