// Control-flow structuring. Reducible CFGs are structured with the "stackifier" algorithm
// (Ramsey, "Beyond Relooper", ICFP 2022) which is correct by construction; irreducible
// CFGs fall back to a state-machine dispatcher. Clean-up passes then turn labeled
// blocks/breaks into if/else, while and do-while where the rewrite is an exact equivalence.
import type { Expr, Stmt } from './ir.ts';
import { negate } from './simplify.ts';
import type { VarFunc } from './dataflow.ts';

export type Node =
  | { k: 'stmt'; s: Stmt }
  | { k: 'if'; c: Expr; then: Node[]; else: Node[] }
  | { k: 'block'; label: string; body: Node[] }
  | { k: 'loop'; label: string | null; body: Node[]; form: 'for' | 'while' | 'do'; c?: Expr }
  | { k: 'break'; label: string | null }
  | { k: 'continue'; label: string | null }
  | { k: 'return'; e: Expr | null }
  | { k: 'trap'; msg: string }
  | { k: 'switch'; v: number; cases: { vals: number[]; body: Node[] }[] }
  | { k: 'setstate'; v: number; val: number };

export interface Structured { body: Node[]; irreducible: boolean; stateVar?: number }

function computeRpo(f: VarFunc): { order: number[]; rpo: Int32Array } {
  const n = f.blocks.length;
  const seen = new Uint8Array(n), post: number[] = [];
  const stack: [number, number][] = [[0, 0]];
  seen[0] = 1;
  while (stack.length) {
    const top = stack[stack.length - 1];
    const b = f.blocks[top[0]];
    if (top[1] < b.succs.length) {
      const s = b.succs[top[1]++];
      if (!seen[s]) { seen[s] = 1; stack.push([s, 0]); }
    } else { post.push(top[0]); stack.pop(); }
  }
  const order = post.reverse();
  const rpo = new Int32Array(n).fill(-1);
  order.forEach((b, i) => (rpo[b] = i));
  return { order, rpo };
}

function dominators(f: VarFunc, order: number[], rpo: Int32Array): Int32Array {
  const idom = new Int32Array(f.blocks.length).fill(-1);
  idom[0] = 0;
  const intersect = (a: number, b: number) => {
    while (a !== b) {
      while (rpo[a] > rpo[b]) a = idom[a];
      while (rpo[b] > rpo[a]) b = idom[b];
    }
    return a;
  };
  for (let changed = true; changed;) {
    changed = false;
    for (const b of order) {
      if (b === 0) continue;
      let nd = -1;
      for (const p of f.blocks[b].preds) {
        if (idom[p] < 0 || rpo[p] < 0) continue;
        nd = nd < 0 ? p : intersect(p, nd);
      }
      if (nd >= 0 && idom[b] !== nd) { idom[b] = nd; changed = true; }
    }
  }
  return idom;
}

export function structure(f: VarFunc): Structured {
  const { order, rpo } = computeRpo(f);
  const idom = dominators(f, order, rpo);
  const n = f.blocks.length;
  const dominates = (a: number, b: number) => { while (true) { if (a === b) return true; if (b === 0) return false; b = idom[b]; } };
  const isHeader = new Uint8Array(n), isMerge = new Uint8Array(n);
  let irreducible = false;
  for (const b of order) {
    let fwd = 0;
    for (const p of f.blocks[b].preds) {
      if (rpo[p] < 0) continue;
      if (rpo[p] >= rpo[b]) { isHeader[b] = 1; if (!dominates(b, p)) irreducible = true; }
      else fwd++;
    }
    if (fwd >= 2) isMerge[b] = 1;
  }
  if (irreducible) return dispatcher(f, order);

  const kids: number[][] = Array.from({ length: n }, () => []);
  for (const b of order) if (b !== 0) kids[idom[b]].push(b);
  const L = (b: number) => `L${b}`;
  const Bl = (b: number) => `B${b}`;

  const codeFor = (x: number): Node[] => {
    const ms = kids[x].filter(c => isMerge[c]).sort((a, b) => rpo[b] - rpo[a]);
    const body = nodeWithin(x, ms);
    return isHeader[x] ? [{ k: 'loop', label: L(x), body, form: 'for' }] : body;
  };
  const nodeWithin = (x: number, ys: number[]): Node[] => {
    if (!ys.length) {
      const b = f.blocks[x];
      const out: Node[] = b.stmts.map(s => ({ k: 'stmt', s }) as Node);
      const t = b.term;
      switch (t.k) {
        case 'ret': out.push({ k: 'return', e: t.e }); break;
        case 'trap': case 'tail': out.push({ k: 'trap', msg: t.k === 'trap' ? t.msg : 'fallthrough' }); break;
        case 'jmp': out.push(...doBranch(x, t.to)); break;
        case 'br':
          if (t.t === t.f) out.push(...doBranch(x, t.t));
          else out.push({ k: 'if', c: t.c, then: doBranch(x, t.t), else: doBranch(x, t.f) });
          break;
      }
      return out;
    }
    const [y, ...rest] = ys;
    return [{ k: 'block', label: Bl(y), body: nodeWithin(x, rest) }, ...codeFor(y)];
  };
  const doBranch = (x: number, t: number): Node[] => {
    if (rpo[t] <= rpo[x]) return [{ k: 'continue', label: L(t) }];
    if (isMerge[t]) return [{ k: 'break', label: Bl(t) }];
    return codeFor(t);
  };
  return { body: codeFor(0), irreducible: false };
}

/** Fallback for irreducible control flow: explicit state machine. */
function dispatcher(f: VarFunc, order: number[]): Structured {
  const sv = f.vars.length;
  f.vars.push({ id: sv, reg: -1, param: -1, undef: false });
  const jump = (t: number): Node[] => [{ k: 'setstate', v: sv, val: t }, { k: 'continue', label: 'L' }];
  const cases = order.map(id => {
    const b = f.blocks[id];
    const body: Node[] = b.stmts.map(s => ({ k: 'stmt', s }) as Node);
    const t = b.term;
    if (t.k === 'ret') body.push({ k: 'return', e: t.e });
    else if (t.k === 'trap' || t.k === 'tail') body.push({ k: 'trap', msg: t.k === 'trap' ? t.msg : 'fallthrough' });
    else if (t.k === 'jmp') body.push(...jump(t.to));
    else body.push({ k: 'if', c: t.c, then: jump(t.t), else: jump(t.f) });
    return { vals: [id], body };
  });
  return {
    body: [{ k: 'setstate', v: sv, val: 0 }, { k: 'loop', label: 'L', form: 'for', body: [{ k: 'switch', v: sv, cases }] }],
    irreducible: true, stateVar: sv,
  };
}

// ======================= clean-up =======================

/** Continuation: the set of jumps equivalent to "falling off the end" at a position. */
interface Cont { breaks: Set<string>; conts: Set<string>; ret: boolean }
const NONE: Cont = { breaks: new Set(), conts: new Set(), ret: false };

const endsInJump = (ns: Node[]): boolean => {
  const l = ns[ns.length - 1];
  if (!l) return false;
  if (l.k === 'break' || l.k === 'continue' || l.k === 'return' || l.k === 'trap') return true;
  if (l.k === 'stmt' && l.s.k === 'trap') return true;
  if (l.k === 'if') return endsInJump(l.then) && endsInJump(l.else);
  if (l.k === 'block') return false; // a break to the block would fall out of it
  if (l.k === 'loop') return l.form === 'for' && !hasBreakTo(l.body, l.label, true);
  if (l.k === 'switch') return false;
  return false;
};

function hasBreakTo(ns: Node[], label: string | null, innermost: boolean): boolean {
  for (const n of ns) {
    switch (n.k) {
      case 'break': if (n.label === label && label !== null) return true; if (n.label === null && innermost) return true; break;
      case 'if': if (hasBreakTo(n.then, label, innermost) || hasBreakTo(n.else, label, innermost)) return true; break;
      case 'block': if (hasBreakTo(n.body, label, innermost)) return true; break;
      case 'loop': case 'switch':
        if (n.k === 'loop' ? hasBreakTo(n.body, label, false) : n.cases.some(c => hasBreakTo(c.body, label, false))) return true;
        break;
    }
  }
  return false;
}

function countRefs(ns: Node[], m: Map<string, number>) {
  for (const n of ns) {
    switch (n.k) {
      case 'break': case 'continue': if (n.label) m.set(n.label, (m.get(n.label) ?? 0) + 1); break;
      case 'if': countRefs(n.then, m); countRefs(n.else, m); break;
      case 'block': case 'loop': countRefs(n.body, m); break;
      case 'switch': n.cases.forEach(c => countRefs(c.body, m)); break;
    }
  }
}

function isJumpIn(n: Node, c: Cont): boolean {
  if (n.k === 'break' && n.label && c.breaks.has(n.label)) return true;
  if (n.k === 'continue' && n.label && c.conts.has(n.label)) return true;
  if (n.k === 'return' && !n.e && c.ret) return true;
  return false;
}

/** Remove jumps in tail position that equal the natural continuation; rewrite jumps out of loops. */
function tailPass(ns: Node[], cont: Cont, loopStack: { label: string; exit: Cont }[]): Node[] {
  const out: Node[] = [];
  for (let i = 0; i < ns.length; i++) {
    const last = i === ns.length - 1;
    const c = last ? cont : NONE;
    let n = ns[i];
    if (last && isJumpIn(n, c)) continue;
    switch (n.k) {
      case 'if':
        n = { ...n, then: tailPass(n.then, c, loopStack), else: tailPass(n.else, c, loopStack) };
        break;
      case 'block': {
        const bc: Cont = { breaks: new Set([...c.breaks, n.label]), conts: c.conts, ret: c.ret };
        n = { ...n, body: tailPass(n.body, bc, loopStack) };
        break;
      }
      case 'loop': {
        const label = n.label ?? '';
        const exit = c;
        const bodyCont: Cont = { breaks: new Set(), conts: new Set([label]), ret: false };
        const body = tailPass(n.body, bodyCont, [...loopStack, { label, exit }]);
        n = { ...n, body };
        break;
      }
      case 'switch':
        n = { ...n, cases: n.cases.map(cs => ({ ...cs, body: tailPass(cs.body, NONE, loopStack) })) };
        break;
      case 'break': {
        // a break whose target equals the exit of the innermost enclosing loop becomes `break <loop>`
        const top = loopStack[loopStack.length - 1];
        if (top && n.label && !n.label.startsWith('L') && top.exit.breaks.has(n.label)) n = { k: 'break', label: top.label };
        break;
      }
      case 'return': {
        const top = loopStack[loopStack.length - 1];
        void top;
        break;
      }
    }
    out.push(n);
  }
  return out;
}

/** Splice unreferenced blocks, drop unreferenced loop labels. */
function labelPass(ns: Node[], refs: Map<string, number>): Node[] {
  const out: Node[] = [];
  for (const n of ns) {
    switch (n.k) {
      case 'block': {
        const body = labelPass(n.body, refs);
        if (!refs.get(n.label)) out.push(...body);
        else out.push({ ...n, body });
        break;
      }
      case 'loop': out.push({ ...n, body: labelPass(n.body, refs) }); break;
      case 'if': out.push({ ...n, then: labelPass(n.then, refs), else: labelPass(n.else, refs) }); break;
      case 'switch': out.push({ ...n, cases: n.cases.map(c => ({ ...c, body: labelPass(c.body, refs) })) }); break;
      default: out.push(n);
    }
  }
  return out;
}

/**
 * if/else shaping:
 *  - `if (c) {A; jump} else {B}` + rest  -> `if (c) {A; jump} B rest`
 *  - `if (c) {} else {B}` -> `if (!c) {B}`
 *  - inside a block B: `if (c) { break B } rest` (rest runs to block end) -> `if (!c) { rest }`
 */
function ifPass(ns: Node[], cont: Cont): Node[] {
  const out: Node[] = [];
  for (let i = 0; i < ns.length; i++) {
    let n = ns[i];
    const last = i === ns.length - 1;
    const c = last ? cont : NONE;
    switch (n.k) {
      case 'block': {
        const bc: Cont = { breaks: new Set([...c.breaks, n.label]), conts: c.conts, ret: c.ret };
        n = { ...n, body: ifPass(n.body, bc) };
        break;
      }
      case 'loop': n = { ...n, body: ifPass(n.body, { breaks: new Set(), conts: new Set([n.label ?? '']), ret: false }) }; break;
      case 'switch': n = { ...n, cases: n.cases.map(cs => ({ ...cs, body: ifPass(cs.body, NONE) })) }; break;
      case 'if': {
        let th = ifPass(n.then, c), el = ifPass(n.else, c);
        let cond = n.c;
        if (!th.length && el.length) { th = el; el = []; cond = negate(cond); }
        // early exit: `if (c) { <cont-jump> } rest...` where rest continues to the same continuation
        const rest = ns.slice(i + 1);
        if (!el.length && th.length === 1 && rest.length && isJumpIn(th[0], cont) && !endsInJump(rest) ) {
          // rest falls off the end -> same continuation; guard it instead
          out.push({ k: 'if', c: negate(cond), then: ifPass(rest, cont), else: [] });
          return out;
        }
        if (el.length && endsInJump(th)) { out.push({ k: 'if', c: cond, then: th, else: [] }); out.push(...el); continue; }
        if (el.length && endsInJump(el) && !endsInJump(th)) { out.push({ k: 'if', c: negate(cond), then: el, else: [] }); out.push(...th); continue; }
        if (!th.length && !el.length) { out.push({ k: 'stmt', s: { k: 'eval', e: cond, pc: -1 } }); continue; }
        n = { k: 'if', c: cond, then: th, else: el };
        // merge `if (a) { if (b) { X } }`
        if (!n.else.length && n.then.length === 1 && n.then[0].k === 'if' && !n.then[0].else.length) {
          n = { k: 'if', c: { k: 'land', a: n.c, b: n.then[0].c }, then: n.then[0].then, else: [] };
        }
        break;
      }
    }
    out.push(n);
  }
  return out;
}

/** for(;;) { if (c) break; body } -> while (!c) body ; for(;;) { body; if (c) continue; break } -> do-while. */
function loopPass(ns: Node[]): Node[] {
  return ns.map(n => {
    switch (n.k) {
      case 'if': return { ...n, then: loopPass(n.then), else: loopPass(n.else) };
      case 'block': return { ...n, body: loopPass(n.body) };
      case 'switch': return { ...n, cases: n.cases.map(c => ({ ...c, body: loopPass(c.body) })) };
      case 'loop': {
        let body = loopPass(n.body);
        if (n.form !== 'for') return { ...n, body };
        const first = body[0];
        const isExit = (x: Node) => x.k === 'break' && (x.label === null || x.label === n.label);
        if (first && first.k === 'if' && !first.else.length && first.then.length === 1 && isExit(first.then[0])) {
          return { ...n, form: 'while', c: negate(first.c), body: body.slice(1) } as Node;
        }
        const last = body[body.length - 1];
        if (last && last.k === 'if' && !last.else.length && last.then.length === 1 && isExit(last.then[0]) && !hasContinueTo(body, n.label)) {
          return { ...n, form: 'do', c: negate(last.c), body: body.slice(0, -1) } as Node;
        }
        if (last && last.k === 'if' && last.then.length === 1 && last.then[0].k === 'continue' && last.then[0].label === n.label
          && last.else.length === 1 && isExit(last.else[0]) && !hasContinueTo(body.slice(0, -1), n.label)) {
          return { ...n, form: 'do', c: last.c, body: body.slice(0, -1) } as Node;
        }
        return { ...n, body };
      }
      default: return n;
    }
  });
}

function hasContinueTo(ns: Node[], label: string | null): boolean {
  for (const n of ns) {
    switch (n.k) {
      case 'continue': if (n.label === label) return true; break;
      case 'if': if (hasContinueTo(n.then, label) || hasContinueTo(n.else, label)) return true; break;
      case 'block': case 'loop': if (hasContinueTo(n.body, label)) return true; break;
      case 'switch': if (n.cases.some(c => hasContinueTo(c.body, label))) return true; break;
    }
  }
  return false;
}

/** Replace `break L`/`continue L` with unlabeled forms when L is the innermost loop, then drop unused labels. */
function unlabel(ns: Node[], inner: string | null, inSwitch: boolean): Node[] {
  return ns.map(n => {
    switch (n.k) {
      case 'break': return n.label !== null && n.label === inner && !inSwitch ? { k: 'break', label: null } : n;
      case 'continue': return n.label !== null && n.label === inner ? { k: 'continue', label: null } : n;
      case 'if': return { ...n, then: unlabel(n.then, inner, inSwitch), else: unlabel(n.else, inner, inSwitch) };
      case 'block': return { ...n, body: unlabel(n.body, inner, inSwitch) };
      case 'loop': return { ...n, body: unlabel(n.body, n.label, false) };
      case 'switch': return { ...n, cases: n.cases.map(c => ({ ...c, body: unlabel(c.body, inner, true) })) };
      default: return n;
    }
  });
}

function dropLoopLabels(ns: Node[], refs: Map<string, number>): Node[] {
  return ns.map(n => {
    switch (n.k) {
      case 'if': return { ...n, then: dropLoopLabels(n.then, refs), else: dropLoopLabels(n.else, refs) };
      case 'block': return { ...n, body: dropLoopLabels(n.body, refs) };
      case 'loop': return { ...n, label: n.label && refs.get(n.label) ? n.label : null, body: dropLoopLabels(n.body, refs) };
      case 'switch': return { ...n, cases: n.cases.map(c => ({ ...c, body: dropLoopLabels(c.body, refs) })) };
      default: return n;
    }
  });
}

/**
 * Deep structural equality of plain data (what comparing JSON serializations checked, minus the
 * sensitivity to property order; properties holding `undefined` count as absent). Shared
 * subtrees (statements are never copied by the passes) compare in O(1).
 */
function sameTree(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!sameTree(a[i], b[i])) return false;
    return true;
  }
  if (Array.isArray(b)) return false;
  let na = 0, nb = 0;
  for (const k in a) { if (a[k] === undefined) continue; na++; if (!sameTree(a[k], b[k])) return false; }
  for (const k in b) if (b[k] !== undefined) nb++;
  return na === nb;
}

export function cleanup(s: Structured, returnsValue: boolean): Node[] {
  let body = s.body;
  if (process.env.SBPF_DISABLE?.includes('cleanup')) return body;
  const top: Cont = { breaks: new Set(), conts: new Set(), ret: !returnsValue };
  for (let i = 0; i < 12; i++) {
    const before = body;
    body = tailPass(body, top, []);
    let refs = new Map<string, number>(); countRefs(body, refs);
    body = labelPass(body, refs);
    body = ifPass(body, top);
    body = tailPass(body, top, []);
    refs = new Map(); countRefs(body, refs);
    body = labelPass(body, refs);
    body = loopPass(body);
    // fixpoint: the passes only look at the tree's values, so once a round leaves the tree
    // structurally unchanged every further round would too
    if (sameTree(body, before)) break;
  }
  body = unlabel(body, null, false);
  const refs = new Map<string, number>(); countRefs(body, refs);
  body = dropLoopLabels(labelPass(body, refs), refs);
  return body;
}
