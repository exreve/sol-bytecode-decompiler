// Interpreter for the decompiler's TypeScript output, implementing exactly the semantics
// documented in the output header. Used to prove output == bytecode on random inputs.
import ts from 'ts5'
import { Abort, StepLimit, UNDEF, type TestMem, type CallHook } from '../src/emu.ts'

const M = (1n << 64n) - 1n
const W = (v: bigint) => v & M

export class EvalError extends Error {}

export interface EvalEnv {
	mem: TestMem
	onCall: CallHook
	fp: bigint
	fnAddr: Map<string, bigint>      // function name -> VM address (function pointer constants)
	fnTarget: Map<string, string>    // function name -> call target id ("fn:<pc>")
	sysTarget: Map<string, string>   // printed syscall name -> "sys:<name>"
	maxSteps: number
}

/** 32 bytes denoted by a base58 string (leading '1's are leading zero bytes). */
function base58Decode(s: string): number[] {
	const A = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
	let n = 0n
	for (const ch of s) { const d = A.indexOf(ch); if (d < 0) throw new EvalError('bad base58 ' + s); n = n * 58n + BigInt(d) }
	const out: number[] = []
	for (let i = 0; i < 32; i++) { out.unshift(Number(n & 0xffn)); n >>= 8n }
	if (n !== 0n) throw new EvalError('base58 key longer than 32 bytes: ' + s)
	let zeros = 0
	while (s[zeros] === '1') zeros++
	for (let i = 0; i < zeros; i++) if (out[i] !== 0) throw new EvalError('bad base58 leading zeros: ' + s)
	return out
}

export function parseFunctions(src: string): Map<string, ts.FunctionDeclaration> {
	const sf = ts.createSourceFile('out.ts', src, ts.ScriptTarget.ES2022, true)
	const diags = (sf as any).parseDiagnostics as ts.Diagnostic[]
	if (diags?.length) throw new EvalError('syntax error: ' + diags.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n') + ' @' + d.start).join('; '))
	const m = new Map<string, ts.FunctionDeclaration>()
	for (const s of sf.statements) if (ts.isFunctionDeclaration(s) && s.name) m.set(s.name.text, s)
	return m
}

type Ex = () => bigint
type St = () => number // 0 normal, 1 break, 2 continue, 3 return
interface Ctl { label: string | null; ret: bigint | undefined; steps: number; max: number }
interface Compiled { slots: Map<string, number>; nparams: number; body: St; ctl: Ctl; vals: (bigint | undefined)[]; env: { cur: EvalEnv | null } }
const cache = new WeakMap<ts.FunctionDeclaration, Compiled>()

/** Compile a decompiled function to closures (the output language semantics; see src/layout.ts PRELUDE). */
function compile(fn: ts.FunctionDeclaration): Compiled {
	const slots = new Map<string, number>()
	const vals: (bigint | undefined)[] = []
	const slot = (n: string) => { let i = slots.get(n); if (i === undefined) { i = vals.length; slots.set(n, i); vals.push(undefined) } return i }
	fn.parameters.forEach(p => slot((p.name as ts.Identifier).text))
	const fpSlot = slot('fp')
	const ctl: Ctl = { label: null, ret: undefined, steps: 0, max: 0 }
	const envRef: { cur: EvalEnv | null } = { cur: null }
	const env = () => envRef.cur!
	const B = (b: boolean) => (b ? 1n : 0n)
	const K = ts.SyntaxKind

	const helper = (name: string, args: Ex[]): Ex => {
		const ld = /^ld(8|16|32|64)$/.exec(name)
		if (ld) { const sz = Number(ld[1]) / 8, a = args[0]; return () => env().mem.load(W(a()), sz) }
		const st = /^st(8|16|32|64)$/.exec(name)
		if (st) { const sz = Number(st[1]) / 8; return () => { const vs = args.map(f => f()); for (let i = 1; i < vs.length; i++) env().mem.store(W(vs[0] + BigInt((i - 1) * sz)), sz, W(vs[i])); return 0n } }
		const two = () => [args[0](), args[1]()]
		switch (name) {
			case 'copy': return () => { const [d, s0, n] = args.map(f => f()); for (let o = 0n; o < n; o += 8n) env().mem.store(W(d + o), 8, env().mem.load(W(s0 + o), 8)); return 0n }
			case 'copyr': return () => { const [d, s0, n] = args.map(f => f()); for (let o = n - 8n; o >= 0n; o -= 8n) env().mem.store(W(d + o), 8, env().mem.load(W(s0 + o), 8)); return 0n }
			case 'shl': return () => { const [a, b] = two(); if (W(b) > 63n) throw new EvalError('shift >= 64'); return W(a << W(b)) }
			case 'sar': return () => { const [a, b] = two(); if (W(b) > 63n) throw new EvalError('shift >= 64'); return W(BigInt.asIntN(64, a) >> W(b)) }
			case 'sdiv': case 'srem': return () => {
				const [p, q] = two(); const x = BigInt.asIntN(64, p), y = BigInt.asIntN(64, q)
				if (y === 0n) throw new Abort('division by zero')
				if (x === -(1n << 63n) && y === -1n) throw new Abort('division overflow')
				return W(name === 'sdiv' ? x / y : x % y)
			}
			case 'sdiv32': case 'srem32': return () => {
				const [p, q] = two(); const x = BigInt.asIntN(32, p), y = BigInt.asIntN(32, q)
				if (y === 0n) throw new Abort('division by zero')
				if (x === -(1n << 31n) && y === -1n) throw new Abort('division overflow')
				return BigInt.asUintN(32, name === 'sdiv32' ? x / y : x % y)
			}
			case 'mulhu': return () => { const [a, b] = two(); return (W(a) * W(b)) >> 64n }
			case 'mulhs': return () => { const [a, b] = two(); return W((BigInt.asIntN(64, a) * BigInt.asIntN(64, b)) >> 64n) }
			case 'bswap16': case 'bswap32': case 'bswap64': {
				const bits = Number(name.slice(5))
				return () => { let x = BigInt.asUintN(bits, args[0]()), y = 0n; for (let i = 0; i < bits / 8; i++) { y = (y << 8n) | (x & 0xffn); x >>= 8n } return y }
			}
			// pure helpers (independent implementations of src/ir.ts INTRINSICS)
			case 'popcount': return () => { const x = W(args[0]()); let n = 0n; for (let i = 0; i < 64; i++) n += (x >> BigInt(i)) & 1n; return n }
			case 'clz': return () => { const x = W(args[0]()); let n = 0n; for (let i = 63; i >= 0 && ((x >> BigInt(i)) & 1n) === 0n; i--) n++; return n }
			case 'ctz': return () => { const x = W(args[0]()); let n = 0n; for (let i = 0; i < 64 && ((x >> BigInt(i)) & 1n) === 0n; i++) n++; return n }
			case 'rotl': return () => { const [a0, b0] = two(); const x = W(a0), n = W(b0) % 64n; return W((x << n) | (x >> (64n - n))) }
			case 'min': return () => { const [a0, b0] = two(); return W(a0) < W(b0) ? W(a0) : W(b0) }
			case 'max': return () => { const [a0, b0] = two(); return W(a0) > W(b0) ? W(a0) : W(b0) }
			case 'smin': return () => { const [a0, b0] = two(); return BigInt.asIntN(64, a0) < BigInt.asIntN(64, b0) ? W(a0) : W(b0) }
			case 'smax': return () => { const [a0, b0] = two(); return BigInt.asIntN(64, a0) > BigInt.asIntN(64, b0) ? W(a0) : W(b0) }
			case 'sat_sub': return () => { const [a0, b0] = two(); return W(a0) >= W(b0) ? W(a0) - W(b0) : 0n }
			case 'memeq': return () => {
				const [p0, q0, n0] = args.map(f => f())
				for (let o = 0n; o < W(n0); o += 8n) if (env().mem.load(W(p0 + o), 8) !== env().mem.load(W(q0 + o), 8)) return 0n
				return 1n
			}
			case 'rc_inc': return () => {
				const p = W(args[0]()), x = args[1] ? W(args[1]()) : env().mem.load(p, 8)
				env().mem.store(p, 8, W(x + 1n))
				if (x === M) {
					// the abort() syscall, as a call
					const t = env().sysTarget.get('abort')
					if (!t) throw new EvalError('rc_inc without an abort syscall')
					env().onCall(t, [])
					throw new Abort('abort')
				}
				return 0n
			}
			case 'rc_dec': return () => {
				const p = W(args[0]()), x = args[1] ? W(args[1]()) : env().mem.load(p, 8)
				env().mem.store(p, 8, W(x - 1n))
				if (x === 1n) env().mem.store(W(p + 8n), 8, W(env().mem.load(W(p + 8n), 8) - 1n))
				return 0n
			}
			case 'trap': return () => { throw new Abort('trap') }
			case 'callx': return () => { const vs = args.map(f => W(f())); return W(env().onCall(`ptr:${vs[0].toString(16)}`, vs.slice(1))) }
		}
		return () => {
			const e = env()
			const t = e.fnTarget.get(name) ?? e.sysTarget.get(name)
			if (!t) throw new EvalError(`unknown function ${name}`)
			return W(e.onCall(t, args.map(f => W(f()))))
		}
	}

	const ex = (e: ts.Expression): Ex => {
		if (ts.isParenthesizedExpression(e)) return ex(e.expression)
		if (ts.isNumericLiteral(e)) { const v = BigInt(e.getText()); return () => v }
		if (e.kind === K.TrueKeyword) return () => 1n
		if (ts.isStringLiteral(e)) return () => 0n
		if (ts.isIdentifier(e)) {
			const n = e.text
			if (n === 'undef') return () => UNDEF
			if (slots.has(n)) { const i = slots.get(n)!; return () => { const v = vals[i]; if (v === undefined) throw new EvalError(`read of uninitialized variable ${n}`); return v } }
			return () => {
				const i = slots.get(n)
				if (i !== undefined) { const v = vals[i]; if (v === undefined) throw new EvalError(`read of uninitialized variable ${n}`); return v }
				const fa = env().fnAddr.get(n)
				if (fa !== undefined) return fa
				throw new EvalError(`unknown identifier ${n}`)
			}
		}
		if (ts.isPrefixUnaryExpression(e)) {
			if (e.operator === K.MinusToken && ts.isNumericLiteral(e.operand)) { const v = -BigInt(e.operand.getText()); return () => v }
			const a = ex(e.operand)
			switch (e.operator) {
				case K.MinusToken: return () => W(-a())
				case K.TildeToken: return () => W(~a())
				case K.ExclamationToken: return () => B(W(a()) === 0n)
			}
			throw new EvalError('bad unary')
		}
		if (ts.isVoidExpression(e)) { const a = ex(e.expression); return () => { a(); return 0n } }
		if (ts.isAsExpression(e)) {
			const a = ex(e.expression)
			const m = /^([ui])(8|16|32|64)$/.exec(e.type.getText())
			if (!m) throw new EvalError('bad cast ' + e.type.getText())
			const bits = Number(m[2])
			return m[1] === 'u' ? () => BigInt.asUintN(bits, a()) : () => BigInt.asIntN(bits, a())
		}
		if (ts.isCallExpression(e)) {
			const name = e.expression.getText()
			if (name === 'keyeq') {
				// keyeq(p, "<base58>"): 32 bytes at p == the key, compared as ascending 8-byte words
				const p0 = ex(e.arguments[0]), lit = e.arguments[1]
				if (!ts.isStringLiteral(lit)) throw new EvalError('keyeq needs a base58 literal')
				const key = base58Decode(lit.text)
				const words = [0, 1, 2, 3].map(i => { let w = 0n; for (let j = 7; j >= 0; j--) w = (w << 8n) | BigInt(key[i * 8 + j]); return w })
				return () => { const p = p0(); for (let i = 0; i < 4; i++) if (env().mem.load(W(p + BigInt(8 * i)), 8) !== words[i]) return 0n; return 1n }
			}
			return helper(name, e.arguments.map(ex))
		}
		if (ts.isConditionalExpression(e)) { const c = ex(e.condition), a = ex(e.whenTrue), b = ex(e.whenFalse); return () => (W(c()) !== 0n ? a() : b()) }
		if (ts.isBinaryExpression(e)) {
			const op = e.operatorToken.kind
			if (op === K.EqualsToken) {
				const i = slot((e.left as ts.Identifier).text), r = ex(e.right)
				return () => { const v = W(r()); vals[i] = v; return v }
			}
			const a = ex(e.left), b = ex(e.right)
			switch (op) {
				case K.AmpersandAmpersandToken: return () => B(W(a()) !== 0n && W(b()) !== 0n)
				case K.BarBarToken: return () => B(W(a()) !== 0n || W(b()) !== 0n)
				case K.PlusToken: return () => W(a() + b())
				case K.MinusToken: return () => W(a() - b())
				case K.AsteriskToken: return () => W(a() * b())
				case K.SlashToken: case K.PercentToken: return () => {
					const x = a(), y = b()
					if (W(y) === 0n) throw new Abort('division by zero')
					if (x < 0n || y < 0n) throw new EvalError('signed operand to / or %')
					return op === K.SlashToken ? x / y : x % y
				}
				case K.AmpersandToken: return () => W(a() & b())
				case K.BarToken: return () => W(a() | b())
				case K.CaretToken: return () => W(a() ^ b())
				case K.LessThanLessThanToken: return () => { const x = a(), y = b(); if (y < 0n || y > 63n) throw new EvalError('shift amount out of range'); return W(x << y) }
				case K.GreaterThanGreaterThanToken: return () => { const x = a(), y = b(); if (y < 0n || y > 63n) throw new EvalError('shift amount out of range'); if (x < 0n) throw new EvalError('signed operand to >>'); return x >> y }
				case K.EqualsEqualsToken: case K.EqualsEqualsEqualsToken: return () => B(W(a()) === W(b()))
				case K.ExclamationEqualsToken: case K.ExclamationEqualsEqualsToken: return () => B(W(a()) !== W(b()))
				case K.LessThanToken: return () => B(a() < b())
				case K.LessThanEqualsToken: return () => B(a() <= b())
				case K.GreaterThanToken: return () => B(a() > b())
				case K.GreaterThanEqualsToken: return () => B(a() >= b())
			}
			throw new EvalError('bad binary ' + e.operatorToken.getText())
		}
		throw new EvalError('unsupported expression ' + ts.SyntaxKind[e.kind] + ': ' + e.getText())
	}

	const list = (ss: readonly ts.Statement[]): St => {
		const cs = ss.map(s => st(s))
		return () => { for (const c of cs) { const r = c(); if (r) return r } return 0 }
	}
	// run a loop body; returns -1 to exit the loop, 0 to continue looping, or a propagating signal
	const loopBody = (body: St, label: string | null) => (): number => {
		if (++ctl.steps > ctl.max) throw new StepLimit()
		const r = body()
		if (r === 1 && (ctl.label === null || ctl.label === label)) { ctl.label = null; return -1 }
		if (r === 2 && (ctl.label === null || ctl.label === label)) { ctl.label = null; return 0 }
		return r
	}
	const st = (s: ts.Statement, label: string | null = null): St => {
		if (ts.isBlock(s)) return list(s.statements)
		if (ts.isExpressionStatement(s)) { const e = ex(s.expression); return () => { e(); return 0 } }
		if (ts.isVariableStatement(s)) {
			const ds = s.declarationList.declarations.map(d => ({ i: slot((d.name as ts.Identifier).text), init: d.initializer ? ex(d.initializer) : null }))
			return () => { for (const d of ds) vals[d.i] = d.init ? W(d.init()) : undefined; return 0 }
		}
		if (ts.isIfStatement(s)) {
			const c = ex(s.expression), t = st(s.thenStatement), f = s.elseStatement ? st(s.elseStatement) : null
			return () => (W(c()) !== 0n ? t() : f ? f() : 0)
		}
		if (ts.isWhileStatement(s)) {
			const c = ex(s.expression), body = loopBody(st(s.statement), label)
			return () => { while (W(c()) !== 0n) { const r = body(); if (r === -1) break; if (r) return r } return 0 }
		}
		if (ts.isDoStatement(s)) {
			const c = ex(s.expression), body = loopBody(st(s.statement), label)
			return () => { do { const r = body(); if (r === -1) break; if (r) return r } while (W(c()) !== 0n); return 0 }
		}
		if (ts.isLabeledStatement(s)) {
			const l = s.label.text
			const inner = s.statement
			if (ts.isWhileStatement(inner) || ts.isDoStatement(inner)) return st(inner, l)
			const b = st(inner)
			return () => { const r = b(); if (r === 1 && ctl.label === l) { ctl.label = null; return 0 } return r }
		}
		if (ts.isBreakStatement(s)) { const l = s.label?.text ?? null; return () => { ctl.label = l; return 1 } }
		if (ts.isContinueStatement(s)) { const l = s.label?.text ?? null; return () => { ctl.label = l; return 2 } }
		if (ts.isReturnStatement(s)) { const e = s.expression ? ex(s.expression) : null; return () => { ctl.ret = e ? W(e()) : undefined; return 3 } }
		if (ts.isSwitchStatement(s)) {
			const v = ex(s.expression)
			const cases = s.caseBlock.clauses.map(c => ({ val: ts.isCaseClause(c) ? ex(c.expression) : null, body: list(c.statements) }))
			return () => {
				const x = W(v())
				let matched = false
				for (const c of cases) {
					if (!matched && c.val && W(c.val()) === x) matched = true
					if (matched) { const r = c.body(); if (r === 1 && ctl.label === null) return 0; if (r) return r }
				}
				return 0
			}
		}
		throw new EvalError('unsupported statement ' + ts.SyntaxKind[s.kind])
	}
	const body = list(fn.body!.statements)
	return { slots, nparams: fn.parameters.length, body, ctl, vals, env: envRef, fpSlot } as Compiled & { fpSlot: number }
}

export function runFunction(fn: ts.FunctionDeclaration, args: bigint[], env: EvalEnv): { ret?: bigint; abort?: string; limit?: boolean } {
	let c = cache.get(fn)
	if (!c) { c = compile(fn); cache.set(fn, c) }
	const cc = c as Compiled & { fpSlot: number }
	cc.vals.fill(undefined)
	for (let i = 0; i < cc.nparams; i++) cc.vals[i] = W(args[i] ?? 0n)
	cc.vals[cc.fpSlot] = env.fp
	cc.env.cur = env
	cc.ctl.steps = 0; cc.ctl.max = env.maxSteps; cc.ctl.label = null; cc.ctl.ret = undefined
	try {
		const r = cc.body()
		return { ret: r === 3 ? cc.ctl.ret : undefined }
	} catch (x) {
		if (x instanceof Abort) return { abort: x.message }
		if (x instanceof StepLimit) return { limit: true }
		throw x
	}
}
