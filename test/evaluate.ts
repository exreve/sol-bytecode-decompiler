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
	// readable (sugared) output:
	strAddr?: (s: string) => bigint | undefined // "text" argument: address of the first occurrence of its UTF-8 bytes
	arity?: Map<string, number>                 // call target id -> argument count (omitted trailing arguments are undef)
	undefUninit?: boolean                       // a variable read before any assignment holds undef (a leftover value)
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

// ---- typed views: `interface T { f: at<off, u8|u16|u32|u64 | ref<U> | U> }` declared in the source ----
interface VField { off: bigint; kind: 'scalar' | 'ref' | 'embed'; size: number; type?: string }
type Views = Map<string, Map<string, VField>>
const viewSize = new WeakMap<Map<string, VField>, bigint>() // from `extends sized<N>`
const viewCache = new WeakMap<ts.SourceFile, Views>()
const SCALAR: Record<string, number> = { u8: 1, u16: 2, u32: 4, u64: 8 }
function viewsOf(sf: ts.SourceFile): Views {
	let v = viewCache.get(sf)
	if (v) return v
	v = new Map()
	for (const st of sf.statements) {
		if (!ts.isInterfaceDeclaration(st)) continue
		const fields = new Map<string, VField>()
		for (const m of st.members) {
			if (!ts.isPropertySignature(m) || !m.type || !ts.isTypeReferenceNode(m.type) || m.type.typeName.getText() !== 'at') throw new EvalError('bad view field ' + m.getText())
			const [o, t] = m.type.typeArguments ?? []
			if (!o || !t || !ts.isLiteralTypeNode(o) || !ts.isNumericLiteral(o.literal) || !ts.isTypeReferenceNode(t)) throw new EvalError('bad view field ' + m.getText())
			const off = BigInt(o.literal.getText()), tn = t.typeName.getText()
			if (SCALAR[tn]) fields.set(m.name.getText(), { off, kind: 'scalar', size: SCALAR[tn] })
			else if (tn === 'ref') {
				const to = t.typeArguments?.[0]
				if (!to || !ts.isTypeReferenceNode(to)) throw new EvalError('bad ref ' + m.getText())
				fields.set(m.name.getText(), { off, kind: 'ref', size: 8, type: to.typeName.getText() })
			} else fields.set(m.name.getText(), { off, kind: 'embed', size: 0, type: tn })
		}
		v.set(st.name.text, fields)
		for (const h of st.heritageClauses ?? []) for (const t of h.types) {
			const a = t.typeArguments?.[0]
			if (t.expression.getText() !== 'sized' || !a || !ts.isLiteralTypeNode(a) || !ts.isNumericLiteral(a.literal)) throw new EvalError('bad view heritage ' + t.getText())
			viewSize.set(fields, BigInt(a.literal.getText()))
		}
	}
	viewCache.set(sf, v)
	return v
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
	// view types of identifiers: from parameter and variable declarations
	const views = viewsOf(fn.getSourceFile())
	const declType = new Map<string, string>()
	const noteType = (name: ts.BindingName, t: ts.TypeNode | undefined) => {
		if (!t || !ts.isTypeReferenceNode(t) || !views.has(t.typeName.getText())) return
		const n = (name as ts.Identifier).text, tn = t.typeName.getText()
		if (declType.has(n) && declType.get(n) !== tn) throw new EvalError(`${n} declared with two view types`)
		declType.set(n, tn)
	}
	fn.parameters.forEach(p => noteType(p.name, p.type))
	const scanDecls = (n: ts.Node) => { if (ts.isVariableDeclaration(n)) noteType(n.name, n.type); ts.forEachChild(n, scanDecls) }
	if (fn.body) scanDecls(fn.body)
	const field = (e: ts.PropertyAccessExpression): VField => {
		const t = typeOf(e.expression)
		if (!t) throw new EvalError('field access on a value without a view type: ' + e.getText())
		const f = views.get(t)?.get(e.name.text)
		if (!f) throw new EvalError(`no field ${e.name.text} in view ${t}`)
		return f
	}
	/** view type of an expression (undefined: a plain value) */
	const typeOf = (e: ts.Expression): string | undefined => {
		if (ts.isParenthesizedExpression(e)) return typeOf(e.expression)
		if (ts.isIdentifier(e)) return declType.get(e.text)
		if (ts.isAsExpression(e) && ts.isTypeReferenceNode(e.type) && views.has(e.type.typeName.getText())) return e.type.typeName.getText()
		if (ts.isPropertyAccessExpression(e)) { const f = field(e); return f.kind === 'scalar' ? undefined : f.type }
		if (ts.isElementAccessExpression(e)) return typeOf(e.expression)
		return undefined
	}
	/** x[k]: the k-th object of x's (sized) view type from x */
	const element = (e: ts.ElementAccessExpression): Ex => {
		const t = typeOf(e.expression), size = t ? viewSize.get(views.get(t)!) : undefined
		if (!size || !ts.isNumericLiteral(e.argumentExpression)) throw new EvalError('bad element access ' + e.getText())
		const obj = ex(e.expression), d = BigInt(e.argumentExpression.getText()) * size
		return () => W(obj() + d)
	}

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
			case 'rc_release': return () => {
				const p = W(args[0]()), x = args[1] ? W(args[1]()) : env().mem.load(p, 8)
				env().mem.store(p, 8, W(x - 1n))
				return x === 1n ? 1n : 0n
			}
			case 'trap': return () => { throw new Abort('trap') }
			case 'callx': return () => { const vs = args.map(f => W(f())); return W(env().onCall(`ptr:${vs[0].toString(16)}`, vs.slice(1))) }
		}
		return () => {
			const e = env()
			const t = e.fnTarget.get(name) ?? e.sysTarget.get(name)
			if (!t) {
				// a function defined in the output that is not a program function: an outlined helper, run in place
				const d = localFunctions(fn.getSourceFile()).get(name)
				if (!d) throw new EvalError(`unknown function ${name}`)
				return runLocal(d, args.map(f => W(f())), e)
			}
			const vs = args.map(f => W(f()))
			const n = e.arity?.get(t)
			if (n !== undefined) while (vs.length < n) vs.push(UNDEF)
			return W(e.onCall(t, vs))
		}
	}

	const ex = (e: ts.Expression): Ex => {
		if (ts.isParenthesizedExpression(e)) return ex(e.expression)
		if (ts.isNumericLiteral(e)) { const v = BigInt(e.getText()); return () => v }
		if (e.kind === K.TrueKeyword) return () => 1n
		if (ts.isStringLiteral(e)) {
			const text = e.text
			return () => {
				const f = env().strAddr
				if (!f) return 0n
				const a = f(text)
				if (a === undefined) throw new EvalError('string not in program memory: ' + JSON.stringify(text))
				return a
			}
		}
		if (ts.isIdentifier(e)) {
			const n = e.text
			if (n === 'undef') return () => UNDEF
			const uninit = () => { if (env().undefUninit) return UNDEF; throw new EvalError(`read of uninitialized variable ${n}`) }
			if (slots.has(n)) { const i = slots.get(n)!; return () => { const v = vals[i]; return v === undefined ? uninit() : v } }
			return () => {
				const i = slots.get(n)
				if (i !== undefined) { const v = vals[i]; return v === undefined ? uninit() : v }
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
		if (ts.isPropertyAccessExpression(e)) {
			const f = field(e), obj = ex(e.expression), off = f.off
			if (f.kind === 'embed') return () => W(obj() + off)
			const size = f.size
			return () => env().mem.load(W(obj() + off), size)
		}
		if (ts.isElementAccessExpression(e)) return element(e)
		if (ts.isAsExpression(e) && ts.isTypeReferenceNode(e.type) && views.has(e.type.typeName.getText())) return ex(e.expression)
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
			if (op === K.EqualsToken && ts.isPropertyAccessExpression(e.left)) {
				// x.f = v: store to a scalar (or pointer: 8 bytes) view field
				const f = field(e.left), obj = ex(e.left.expression), r = ex(e.right), off = f.off, size = f.size
				if (f.kind === 'embed') throw new EvalError('assignment to an embedded view field: ' + e.getText())
				return () => { const a = W(obj() + off), v = W(r()); env().mem.store(a, size, v); return v }
			}
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

/** Function declarations with a body in a source file, by name. */
const localCache = new WeakMap<ts.SourceFile, Map<string, ts.FunctionDeclaration>>()
function localFunctions(sf: ts.SourceFile): Map<string, ts.FunctionDeclaration> {
	let m = localCache.get(sf)
	if (!m) { m = new Map(); for (const s of sf.statements) if (ts.isFunctionDeclaration(s) && s.name && s.body) m.set(s.name.text, s); localCache.set(sf, m) }
	return m
}

/** Run a helper defined in the output in the caller's environment (aborts and step limits propagate). */
function runLocal(fn: ts.FunctionDeclaration, args: bigint[], env: EvalEnv): bigint {
	let c = cache.get(fn)
	if (!c) { c = compile(fn); cache.set(fn, c) }
	const cc = c as Compiled & { fpSlot: number }
	if (cc.env.cur) throw new EvalError(`helper ${fn.name?.text} entered twice`)
	cc.vals.fill(undefined)
	for (let i = 0; i < cc.nparams; i++) cc.vals[i] = W(args[i] ?? 0n)
	cc.vals[cc.fpSlot] = env.fp
	cc.env.cur = env
	cc.ctl.steps = 0; cc.ctl.max = env.maxSteps; cc.ctl.label = null; cc.ctl.ret = undefined
	try {
		const r = cc.body()
		return r === 3 && cc.ctl.ret !== undefined ? cc.ctl.ret : 0n
	} finally { cc.env.cur = null }
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
