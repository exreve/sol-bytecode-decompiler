// Interpreter for the decompiler's TypeScript output, implementing exactly the semantics
// documented in the output header. Used to prove output == bytecode on random inputs.
import ts from 'ts5'
import { Abort, StepLimit, UNDEF, type TestMem, type CallHook } from '../src/emu.ts'

const M = (1n << 64n) - 1n
const W = (v: bigint) => v & M

class Break { label: string | null; constructor(l: string | null) { this.label = l } }
class Continue { label: string | null; constructor(l: string | null) { this.label = l } }
class Return { v: bigint | undefined; constructor(v: bigint | undefined) { this.v = v } }
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

export function parseFunctions(src: string): Map<string, ts.FunctionDeclaration> {
	const sf = ts.createSourceFile('out.ts', src, ts.ScriptTarget.ES2022, true)
	const diags = (sf as any).parseDiagnostics as ts.Diagnostic[]
	if (diags?.length) throw new EvalError('syntax error: ' + diags.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n') + ' @' + d.start).join('; '))
	const m = new Map<string, ts.FunctionDeclaration>()
	for (const s of sf.statements) if (ts.isFunctionDeclaration(s) && s.name) m.set(s.name.text, s)
	return m
}

export function runFunction(fn: ts.FunctionDeclaration, args: bigint[], env: EvalEnv): { ret?: bigint; abort?: string; limit?: boolean } {
	const scopes: Map<string, bigint | undefined>[] = [new Map()]
	fn.parameters.forEach((p, i) => scopes[0].set((p.name as ts.Identifier).text, W(args[i] ?? 0n)))
	scopes[0].set('fp', env.fp)
	let steps = 0
	const tick = () => { if (++steps > env.maxSteps) throw new StepLimit() }
	const lookup = (n: string): bigint => {
		for (let i = scopes.length - 1; i >= 0; i--) if (scopes[i].has(n)) {
			const v = scopes[i].get(n)
			if (v === undefined) throw new EvalError(`read of uninitialized variable ${n}`)
			return v
		}
		if (n === 'undef') return UNDEF
		const fa = env.fnAddr.get(n)
		if (fa !== undefined) return fa
		throw new EvalError(`unknown identifier ${n}`)
	}
	const assign = (n: string, v: bigint) => {
		for (let i = scopes.length - 1; i >= 0; i--) if (scopes[i].has(n)) { scopes[i].set(n, W(v)); return }
		throw new EvalError(`assignment to undeclared ${n}`)
	}
	const truth = (v: bigint) => W(v) !== 0n
	const B = (b: boolean) => (b ? 1n : 0n)

	const call = (name: string, a: bigint[]): bigint => {
		const ld = /^ld(8|16|32|64)$/.exec(name)
		if (ld) { const v = env.mem.load(W(a[0]), Number(ld[1]) / 8); if (process.env.SBPF_TRACE) console.log(`LD ${name} ${W(a[0]).toString(16)} = ${v.toString(16)}`); return v }
		const st = /^st(8|16|32|64)$/.exec(name)
		if (st) { const sz = Number(st[1]) / 8; for (let i = 1; i < a.length; i++) env.mem.store(W(a[0] + BigInt((i - 1) * sz)), sz, W(a[i])); return 0n }
		if (name === 'copy') { for (let o = 0n; o < a[2]; o += 8n) env.mem.store(W(a[0] + o), 8, env.mem.load(W(a[1] + o), 8)); return 0n }
		if (name === 'copyr') { for (let o = a[2] - 8n; o >= 0n; o -= 8n) env.mem.store(W(a[0] + o), 8, env.mem.load(W(a[1] + o), 8)); return 0n }
		switch (name) {
			case 'sar': if (W(a[1]) > 63n) throw new EvalError('shift >= 64'); return W(BigInt.asIntN(64, a[0]) >> W(a[1]))
			case 'sdiv': case 'srem': {
				const x = BigInt.asIntN(64, a[0]), y = BigInt.asIntN(64, a[1])
				if (y === 0n) throw new Abort('division by zero')
				if (x === -(1n << 63n) && y === -1n) throw new Abort('division overflow')
				return W(name === 'sdiv' ? x / y : x % y)
			}
			case 'sdiv32': case 'srem32': {
				const x = BigInt.asIntN(32, a[0]), y = BigInt.asIntN(32, a[1])
				if (y === 0n) throw new Abort('division by zero')
				if (x === -(1n << 31n) && y === -1n) throw new Abort('division overflow')
				return BigInt.asUintN(32, name === 'sdiv32' ? x / y : x % y)
			}
			case 'mulhu': return (W(a[0]) * W(a[1])) >> 64n
			case 'mulhs': return W((BigInt.asIntN(64, a[0]) * BigInt.asIntN(64, a[1])) >> 64n)
			case 'bswap16': case 'bswap32': case 'bswap64': {
				const bits = Number(name.slice(5))
				let x = BigInt.asUintN(bits, a[0]), y = 0n
				for (let i = 0; i < bits / 8; i++) { y = (y << 8n) | (x & 0xffn); x >>= 8n }
				return y
			}
			// pure helpers (independent implementations of src/ir.ts INTRINSICS)
			case 'popcount': { let x = W(a[0]), n = 0n; for (let i = 0; i < 64; i++) n += (x >> BigInt(i)) & 1n; return n }
			case 'clz': { const x = W(a[0]); let n = 0n; for (let i = 63; i >= 0 && ((x >> BigInt(i)) & 1n) === 0n; i--) n++; return n }
			case 'ctz': { const x = W(a[0]); let n = 0n; for (let i = 0; i < 64 && ((x >> BigInt(i)) & 1n) === 0n; i++) n++; return n }
			case 'rotl': { const x = W(a[0]), n = W(a[1]) % 64n; return W((x << n) | (x >> (64n - n))) }
			case 'min': return W(a[0]) < W(a[1]) ? W(a[0]) : W(a[1])
			case 'max': return W(a[0]) > W(a[1]) ? W(a[0]) : W(a[1])
			case 'smin': return BigInt.asIntN(64, a[0]) < BigInt.asIntN(64, a[1]) ? W(a[0]) : W(a[1])
			case 'smax': return BigInt.asIntN(64, a[0]) > BigInt.asIntN(64, a[1]) ? W(a[0]) : W(a[1])
			case 'memeq': {
				for (let o = 0n; o < W(a[2]); o += 8n) if (env.mem.load(W(a[0] + o), 8) !== env.mem.load(W(a[1] + o), 8)) return 0n
				return 1n
			}
			case 'trap': throw new Abort('trap')
			case 'callx': return W(env.onCall(`ptr:${W(a[0]).toString(16)}`, a.slice(1).map(W)))
		}
		const ft = env.fnTarget.get(name)
		if (ft) return W(env.onCall(ft, a.map(W)))
		const sc = env.sysTarget.get(name)
		if (sc) return W(env.onCall(sc, a.map(W)))
		throw new EvalError(`unknown function ${name}`)
	}

	const ev = (e: ts.Expression): bigint => {
		if (ts.isParenthesizedExpression(e)) return ev(e.expression)
		if (ts.isNumericLiteral(e)) return BigInt(e.getText())
		if (e.kind === ts.SyntaxKind.TrueKeyword) return 1n
		if (ts.isStringLiteral(e)) return 0n // only used as trap() message
		if (ts.isIdentifier(e)) return lookup(e.text)
		if (ts.isPrefixUnaryExpression(e)) {
			// a negative numeric literal is a signed value (used as-is by relational operators)
			if (e.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(e.operand)) return -BigInt(e.operand.getText())
			const v = ev(e.operand)
			switch (e.operator) {
				case ts.SyntaxKind.MinusToken: return W(-v)
				case ts.SyntaxKind.TildeToken: return W(~v)
				case ts.SyntaxKind.ExclamationToken: return B(!truth(v))
			}
			throw new EvalError('bad unary')
		}
		if (ts.isVoidExpression(e)) { ev(e.expression); return 0n }
		if (ts.isAsExpression(e)) {
			const v = ev(e.expression)
			const t = e.type.getText()
			const m = /^([ui])(8|16|32|64)$/.exec(t)
			if (!m) throw new EvalError('bad cast ' + t)
			return m[1] === 'u' ? BigInt.asUintN(Number(m[2]), v) : BigInt.asIntN(Number(m[2]), v)
		}
		if (ts.isCallExpression(e)) {
			const name = e.expression.getText()
			return call(name, e.arguments.map(ev))
		}
		if (ts.isConditionalExpression(e)) return truth(ev(e.condition)) ? ev(e.whenTrue) : ev(e.whenFalse)
		if (ts.isBinaryExpression(e)) {
			const op = e.operatorToken.kind
			const K = ts.SyntaxKind
			if (op === K.AmpersandAmpersandToken) return B(truth(ev(e.left)) && truth(ev(e.right)))
			if (op === K.BarBarToken) return B(truth(ev(e.left)) || truth(ev(e.right)))
			if (op === K.EqualsToken) { const v = ev(e.right); assign((e.left as ts.Identifier).text, v); return v }
			const a = ev(e.left), b = ev(e.right)
			switch (op) {
				case K.PlusToken: return W(a + b)
				case K.MinusToken: return W(a - b)
				case K.AsteriskToken: return W(a * b)
				case K.SlashToken: if (W(b) === 0n) throw new Abort('division by zero'); if (a < 0n || b < 0n) throw new EvalError('signed operand to /'); return a / b
				case K.PercentToken: if (W(b) === 0n) throw new Abort('division by zero'); if (a < 0n || b < 0n) throw new EvalError('signed operand to %'); return a % b
				case K.AmpersandToken: return W(a & b)
				case K.BarToken: return W(a | b)
				case K.CaretToken: return W(a ^ b)
				case K.LessThanLessThanToken: if (b < 0n || b > 63n) throw new EvalError('shift amount out of range'); return W(a << b)
				case K.GreaterThanGreaterThanToken: if (b < 0n || b > 63n) throw new EvalError('shift amount out of range'); if (a < 0n) throw new EvalError('signed operand to >>'); return a >> b
				case K.EqualsEqualsToken: case K.EqualsEqualsEqualsToken: return B(W(a) === W(b))
				case K.ExclamationEqualsToken: case K.ExclamationEqualsEqualsToken: return B(W(a) !== W(b))
				case K.LessThanToken: return B(a < b)
				case K.LessThanEqualsToken: return B(a <= b)
				case K.GreaterThanToken: return B(a > b)
				case K.GreaterThanEqualsToken: return B(a >= b)
			}
			throw new EvalError('bad binary ' + e.operatorToken.getText())
		}
		throw new EvalError('unsupported expression ' + ts.SyntaxKind[e.kind] + ': ' + e.getText())
	}

	const execList = (ss: readonly ts.Statement[]) => {
		scopes.push(new Map())
		try { for (const s of ss) exec(s) } finally { scopes.pop() }
	}
	const loopBody = (s: ts.Statement, label: string | null): 'break' | 'next' => {
		try { tick(); exec(s) } catch (x) {
			if (x instanceof Break && (x.label === null || x.label === label)) return 'break'
			if (x instanceof Continue && (x.label === null || x.label === label)) return 'next'
			throw x
		}
		return 'next'
	}
	const exec = (s: ts.Statement, label: string | null = null): void => {
		if (ts.isBlock(s)) return execList(s.statements)
		if (ts.isExpressionStatement(s)) { ev(s.expression); return }
		if (ts.isVariableStatement(s)) {
			for (const d of s.declarationList.declarations) {
				const n = (d.name as ts.Identifier).text
				scopes[scopes.length - 1].set(n, d.initializer ? W(ev(d.initializer)) : undefined)
			}
			return
		}
		if (ts.isIfStatement(s)) {
			if (truth(ev(s.expression))) exec(s.thenStatement)
			else if (s.elseStatement) exec(s.elseStatement)
			return
		}
		if (ts.isWhileStatement(s)) {
			while (truth(ev(s.expression))) if (loopBody(s.statement, label) === 'break') break
			return
		}
		if (ts.isDoStatement(s)) {
			do { if (loopBody(s.statement, label) === 'break') break } while (truth(ev(s.expression)))
			return
		}
		if (ts.isLabeledStatement(s)) {
			const l = s.label.text
			const inner = s.statement
			if (ts.isWhileStatement(inner) || ts.isDoStatement(inner)) return exec(inner, l)
			try { exec(inner) } catch (x) { if (x instanceof Break && x.label === l) return; throw x }
			return
		}
		if (ts.isBreakStatement(s)) throw new Break(s.label?.text ?? null)
		if (ts.isContinueStatement(s)) throw new Continue(s.label?.text ?? null)
		if (ts.isReturnStatement(s)) throw new Return(s.expression ? W(ev(s.expression)) : undefined)
		if (ts.isSwitchStatement(s)) {
			const v = W(ev(s.expression))
			let matched = false
			try {
				for (const c of s.caseBlock.clauses) {
					if (!matched && ts.isCaseClause(c) && W(ev(c.expression)) === v) matched = true
					if (matched) for (const st of c.statements) exec(st)
				}
			} catch (x) { if (x instanceof Break && x.label === null) return; throw x }
			return
		}
		throw new EvalError('unsupported statement ' + ts.SyntaxKind[s.kind])
	}
	try {
		execList(fn.body!.statements)
		return { ret: undefined }
	} catch (x) {
		if (x instanceof Return) return { ret: x.v }
		if (x instanceof Abort) return { abort: x.message }
		if (x instanceof StepLimit) return { limit: true }
		throw x
	}
}
