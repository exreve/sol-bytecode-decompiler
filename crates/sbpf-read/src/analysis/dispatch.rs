//! Indirect calls and native dispatchers (`src/analysis/flow.ts`, part 4): functions reached through
//! constant function pointers / tables, and the per-instruction regions of a function matching on the
//! instruction tag (splitDispatch).

use super::anchor::snake2;
use super::flow::*;
use super::An;
use sbpf_ir::fx::{IndexMap, IndexSet};
use sbpf_ir::{BinOp, CallTarget, CmpOp, Ir, Node, Stmt, Term, E};
use std::collections::VecDeque;
use sbpf_ir::fx::{HashMap, HashSet};
use std::rc::Rc;

pub struct Indirect {
    pub targets: IndexMap<i64, Vec<i64>>,
    pub by_disc: IndexMap<u64, Vec<i64>>,
}

impl<'a> An<'a> {
    pub fn indirect_targets(&self) -> Indirect {
        let p = self.p;
        let img = p.image();
        let mut targets: IndexMap<i64, Vec<i64>> = IndexMap::default();
        let mut by_disc: IndexMap<u64, Vec<i64>> = IndexMap::default();
        let text = p.text_vaddr;
        let fn_at = |a: u64| -> Option<i64> {
            if a < text {
                return None;
            }
            let o = a - text;
            if o % 8 != 0 {
                return None;
            }
            let pc = (o / 8) as i64;
            if p.funcs.contains_key(&pc) {
                Some(pc)
            } else {
                None
            }
        };
        let ro = |a: u64| {
            img.region(a, 8)
                .is_some_and(|g| !g.exec && (g.name == ".rodata" || g.name == ".data.rel.ro"))
        };
        let read = |a: u64, k: u64| a.checked_add(k).and_then(|x| img.read_const(x, 8));
        let discs: HashSet<u64> = self.instructions.iter().map(|i| i.disc).collect();
        let mut const_fns: HashMap<u64, Vec<i64>> = HashMap::default();
        let mut lowest = text;
        for g in &p.elf.regions {
            if g.vaddr < lowest {
                lowest = g.vaddr;
            }
        }
        for fo in &self.funcs {
            let f = fo.f;
            let ir = fir(f);
            let mut out: IndexSet<i64> = IndexSet::default();
            let mut consts: HashMap<u32, Vec<(u64, usize)>> = HashMap::default();
            let mut other: HashSet<u32> = HashSet::default();
            for (bi, b) in f.blocks.iter().enumerate() {
                for s in &b.stmts {
                    match s {
                        Stmt::Set { dst, e, .. } => match ir.get(*e) {
                            Node::Const(v) => consts.entry(*dst as u32).or_default().push((v, bi)),
                            _ => {
                                other.insert(*dst as u32);
                            }
                        },
                        Stmt::Call { dst, .. } if *dst >= 0 => {
                            other.insert(*dst as u32);
                        }
                        _ => {}
                    }
                    for e in crate::util::stmt_exprs(ir, s) {
                        let mut cs: Vec<u64> = Vec::new();
                        ir.walk(e, &mut |_, n| {
                            if let Node::Const(v) = n {
                                cs.push(v);
                            }
                        });
                        for v in cs {
                            if v < lowest {
                                continue;
                            }
                            let ts = const_fns.entry(v).or_insert_with(|| {
                                let mut ts = Vec::new();
                                let t = fn_at(v);
                                if t.is_some_and(|t| p.address_taken.contains(&t)) {
                                    ts.push(t.unwrap());
                                } else if ro(v) {
                                    for k in 0..12u64 {
                                        let w = read(v, 8 * k);
                                        let t2 = w.and_then(fn_at);
                                        if t2.is_some_and(|t| p.address_taken.contains(&t)) {
                                            ts.push(t2.unwrap());
                                        } else if w.is_none_or(|w| w > 0x10000) {
                                            break;
                                        }
                                    }
                                }
                                ts
                            });
                            for &t in ts.iter() {
                                out.insert(t);
                            }
                        }
                    }
                }
            }
            for b in &f.blocks {
                for s in &b.stmts {
                    let Some((CallTarget::Ind { e }, _)) = call_of(ir, s) else {
                        continue;
                    };
                    match ir.get(e) {
                        Node::Const(v) => {
                            if let Some(t) = fn_at(v) {
                                out.insert(t);
                            }
                            continue;
                        }
                        Node::Load { size: 8, addr } => {
                            let (base, k) = match ir.get(addr) {
                                Node::Bin(BinOp::Add, a, c) => match ir.get(c) {
                                    Node::Const(k) => (a, k),
                                    _ => (addr, 0),
                                },
                                _ => (addr, 0),
                            };
                            if let Node::Const(bv) = ir.get(base) {
                                if let Some(t) = read(bv, k).and_then(fn_at) {
                                    out.insert(t);
                                }
                                continue;
                            }
                            let Node::Var(bid) = ir.get(base) else {
                                continue;
                            };
                            if other.contains(&bid) {
                                continue;
                            }
                            for &(dv, db) in consts.get(&bid).map_or(&[][..], |v| &v[..]) {
                                let Some(t) = read(dv, k).and_then(fn_at) else {
                                    continue;
                                };
                                let cd = match &f.blocks[db].term {
                                    Term::Br { c, .. } => match ir.get(*c) {
                                        Node::Cmp(CmpOp::Eq | CmpOp::Ne, ca, cb) => {
                                            match (ir.get(ca), ir.get(cb)) {
                                                (_, Node::Const(v)) => Some(v),
                                                (Node::Const(v), _) => Some(v),
                                                _ => None,
                                            }
                                        }
                                        _ => None,
                                    },
                                    _ => None,
                                };
                                match cd {
                                    Some(cd) if discs.contains(&cd) => {
                                        by_disc.entry(cd).or_default().push(t)
                                    }
                                    _ => {
                                        out.insert(t);
                                    }
                                }
                            }
                        }
                        _ => {}
                    }
                }
            }
            out.shift_remove(&fo.pc);
            if !out.is_empty() {
                targets.insert(fo.pc, out.into_iter().collect());
            }
        }
        Indirect { targets, by_disc }
    }
}

// ---- native dispatchers ----

/// a set of tag values 0..255 (256: any larger value) as a bitset
type Tags = [u32; 9];
const NT: usize = 257;
fn new_tags(all: bool) -> Tags {
    let mut t = [0u32; 9];
    if all {
        for x in t.iter_mut().take(8) {
            *x = 0xffffffff;
        }
        t[8] = 1;
    }
    t
}
fn has(t: &Tags, v: usize) -> bool {
    (t[v >> 5] >> (v & 31)) & 1 == 1
}
fn is_all(t: &Tags) -> bool {
    t[8] == 1 && t[..8].iter().all(|&w| w == 0xffffffff)
}
fn or_into(a: &mut Tags, b: &Tags) -> bool {
    let mut ch = false;
    for i in 0..9 {
        let x = a[i] | b[i];
        if x != a[i] {
            a[i] = x;
            ch = true;
        }
    }
    ch
}

fn eval_cmp_n(op: CmpOp, a: u64, b: u64) -> bool {
    let i = |x: u64| x as i64;
    match op {
        CmpOp::Eq => a == b,
        CmpOp::Ne => a != b,
        CmpOp::Ugt => a > b,
        CmpOp::Uge => a >= b,
        CmpOp::Ult => a < b,
        CmpOp::Ule => a <= b,
        CmpOp::Sgt => i(a) > i(b),
        CmpOp::Sge => i(a) >= i(b),
        CmpOp::Slt => i(a) < i(b),
        CmpOp::Sle => i(a) <= i(b),
        _ => true,
    }
}

pub struct TagStates {
    pub fo: i64,
    pub in_s: Vec<Option<Tags>>,
    pub family: IndexSet<u32>,
    pub primary: u32,
}

fn leaf_var(ir: &Ir, e: E) -> Option<u32> {
    match ir.get(e) {
        Node::Var(id) => Some(id),
        Node::Ext { a, .. } => match ir.get(a) {
            Node::Var(id) => Some(id),
            _ => None,
        },
        _ => None,
    }
}

fn leaves(ir: &Ir, c: E, f: &mut dyn FnMut(E)) {
    match ir.get(c) {
        Node::Cmp(..) => f(c),
        Node::Lnot(a) => leaves(ir, a, f),
        Node::Land(a, b) | Node::Lor(a, b) => {
            leaves(ir, a, f);
            leaves(ir, b, f);
        }
        _ => {}
    }
}

impl<'a> An<'a> {
    /// The tags each block of fo can be reached with
    fn tag_states(&self, pc: i64, forced: Option<u32>) -> Option<TagStates> {
        let f = self.fo(pc)?.f;
        if f.blocks.len() > 20000 {
            return None;
        }
        let ir = fir(f);
        let mut defs: HashMap<u32, Vec<E>> = HashMap::default();
        for b in &f.blocks {
            for s in &b.stmts {
                if let Stmt::Set { dst, e, .. } = s {
                    defs.entry(*dst as u32).or_default().push(*e);
                }
            }
        }
        let mut cmp_consts: IndexMap<u32, IndexSet<u64>> = IndexMap::default();
        for b in &f.blocks {
            if let Term::Br { c, .. } = &b.term {
                leaves(ir, *c, &mut |x| {
                    let Node::Cmp(op, ca, cb) = ir.get(x) else {
                        return;
                    };
                    if op == CmpOp::Set {
                        return;
                    }
                    let (xx, k) = match (ir.get(ca), ir.get(cb)) {
                        (_, Node::Const(k)) => (Some(ca), k),
                        (Node::Const(k), _) => (Some(cb), k),
                        _ => (None, 0),
                    };
                    let v = xx.and_then(|x| leaf_var(ir, x));
                    let Some(v) = v else { return };
                    if k > 0xffffffff {
                        return;
                    }
                    cmp_consts.entry(v).or_default().insert(k);
                });
            }
        }
        let tag_like = |v: u32, only_const: bool| -> bool {
            let Some(ds) = defs.get(&v) else { return false };
            if ds.is_empty() {
                return false;
            }
            ds.iter().all(|&e| match ir.get(e) {
                Node::Const(c) => c <= 0xff,
                Node::Load { size, .. } => !only_const && (size == 1 || size == 4),
                Node::Ext { a, .. } => !only_const && matches!(ir.get(a), Node::Load { .. }),
                _ => false,
            })
        };
        let mut primary = forced;
        if primary.is_none() {
            let mut best = 0;
            for (&v, ks) in &cmp_consts {
                if ks.len() > best
                    && tag_like(v, false)
                    && ks.iter().filter(|&&k| k <= 0xff).count() >= 2
                {
                    best = ks.len();
                    primary = Some(v);
                }
            }
            let pv = primary?;
            if best < 3
                && !defs[&pv]
                    .iter()
                    .any(|&e| matches!(ir.get(e), Node::Load { size: 1, .. }))
            {
                return None;
            }
        } else if cmp_consts.get(&primary.unwrap()).map_or(0, |s| s.len()) < 2 {
            return None;
        }
        let primary = primary.unwrap();
        let mut family: IndexSet<u32> = IndexSet::default();
        family.insert(primary);
        for (&v, ks) in &cmp_consts {
            if v != primary && ks.len() >= 2 && tag_like(v, true) {
                family.insert(v);
            }
        }
        let g = self.cfg(pc);
        let mut order: Vec<usize> = (0..f.blocks.len()).filter(|&b| g.rpo[b] >= 0).collect();
        order.sort_by_key(|&b| g.rpo[b]);
        let n = f.blocks.len();
        let mut in_s: Vec<Option<Tags>> = vec![None; n];
        in_s[0] = Some(new_tags(true));
        let mut mask_memo: HashMap<(E, bool), Option<Tags>> = HashMap::default();
        fn narrow(
            ir: &Ir,
            family: &IndexSet<u32>,
            memo: &mut HashMap<(E, bool), Option<Tags>>,
            c: E,
            truth: bool,
            t: Tags,
        ) -> Tags {
            match ir.get(c) {
                Node::Lnot(a) => return narrow(ir, family, memo, a, !truth, t),
                Node::Land(a, b) | Node::Lor(a, b) => {
                    let is_and = matches!(ir.get(c), Node::Land(..));
                    if is_and == truth {
                        let x = narrow(ir, family, memo, a, truth, t);
                        return narrow(ir, family, memo, b, truth, x);
                    }
                    let mut o = narrow(ir, family, memo, a, truth, t);
                    let y = narrow(ir, family, memo, b, truth, t);
                    or_into(&mut o, &y);
                    return o;
                }
                _ => {}
            }
            let Node::Cmp(op, ca, cb) = ir.get(c) else {
                return t;
            };
            if op == CmpOp::Set {
                return t;
            }
            let mask = match memo.get(&(c, truth)) {
                Some(m) => *m,
                None => {
                    let (x, k, swap) = match (ir.get(ca), ir.get(cb)) {
                        (_, Node::Const(k)) => (Some(ca), k, false),
                        (Node::Const(k), _) => (Some(cb), k, true),
                        _ => (None, 0, false),
                    };
                    let v = x.and_then(|x| leaf_var(ir, x));
                    let m = match v {
                        Some(v) if family.contains(&v) => {
                            let ext = match ir.get(x.unwrap()) {
                                Node::Ext { signed, bits, .. } => Some((signed, bits)),
                                _ => None,
                            };
                            let mut o = new_tags(false);
                            for nn in 0..NT {
                                let mut a = nn as u64;
                                if let Some((signed, bits)) = ext {
                                    let m: u128 = (1u128 << bits) - 1;
                                    a = (a as u128 & m) as u64;
                                    if signed && (a >> (bits - 1)) != 0 {
                                        a = (a as u128).wrapping_sub(1u128 << bits) as u64;
                                    }
                                }
                                let r = if swap {
                                    eval_cmp_n(op, k, a)
                                } else {
                                    eval_cmp_n(op, a, k)
                                };
                                if r == truth {
                                    o[nn >> 5] |= 1 << (nn & 31);
                                }
                            }
                            Some(o)
                        }
                        _ => None,
                    };
                    memo.insert((c, truth), m);
                    m
                }
            };
            let Some(mask) = mask else { return t };
            let mut o = [0u32; 9];
            for i in 0..9 {
                o[i] = t[i] & mask[i];
            }
            o
        }
        let set_to: Vec<Option<usize>> = f
            .blocks
            .iter()
            .map(|bl| {
                let mut v = None;
                for s in &bl.stmts {
                    if let Stmt::Set { dst, e, .. } = s {
                        if *dst >= 0 && family.contains(&(*dst as u32)) {
                            if let Node::Const(c) = ir.get(*e) {
                                v = Some(if c > 256 { 256 } else { c as usize });
                            }
                        }
                    }
                }
                v
            })
            .collect();
        let mut dirty = vec![false; n];
        dirty[0] = true;
        let mut any = true;
        let mut sweep = 0;
        while any && sweep < 60 {
            any = false;
            for &b in &order {
                if !dirty[b] {
                    continue;
                }
                dirty[b] = false;
                let mut t = in_s[b].unwrap();
                if let Some(sv) = set_to[b] {
                    t = new_tags(false);
                    t[sv >> 5] |= 1 << (sv & 31);
                }
                let mut succ = |x: usize,
                                tt: Tags,
                                in_s: &mut Vec<Option<Tags>>,
                                dirty: &mut Vec<bool>,
                                any: &mut bool| {
                    match &mut in_s[x] {
                        None => in_s[x] = Some(tt),
                        Some(cur) => {
                            if !or_into(cur, &tt) {
                                return;
                            }
                        }
                    }
                    dirty[x] = true;
                    *any = true;
                };
                match &f.blocks[b].term {
                    Term::Br { c, t: bt, f: bf } => {
                        let tt = narrow(ir, &family, &mut mask_memo, *c, true, t);
                        succ(*bt as usize, tt, &mut in_s, &mut dirty, &mut any);
                        let ff = narrow(ir, &family, &mut mask_memo, *c, false, t);
                        succ(*bf as usize, ff, &mut in_s, &mut dirty, &mut any);
                    }
                    _ => {
                        for &x in &f.blocks[b].succs {
                            succ(x, t, &mut in_s, &mut dirty, &mut any);
                        }
                    }
                }
            }
            sweep += 1;
        }
        Some(TagStates {
            fo: pc,
            in_s,
            family,
            primary,
        })
    }
}

/// The dispatchers of a split and their per-tag reachability.
pub struct Dispatch {
    pub ds: Vec<TagStates>,
    pub before: Vec<Vec<bool>>,
    pub d_idx: HashMap<i64, usize>,
}

#[derive(Clone)]
pub struct DispatchGroup {
    pub tags: Vec<u32>,
    pub name: String,
    pub source: &'static str,
    pub accounts: Option<Vec<String>>,
    pub dispatchers: Vec<String>,
    /// (the group's tags; None: the code before the dispatch)
    pub mask: Option<Tags>,
    pub dsp: Rc<Dispatch>,
    pub tag: (i64, u32),
}

impl DispatchGroup {
    /// is block b of fn reachable with one of the group's tags? (true outside the dispatchers)
    pub fn allowed(&self, fn_: i64, b: usize) -> bool {
        let Some(&i) = self.dsp.d_idx.get(&fn_) else {
            return true;
        };
        let before = self.dsp.before[i].get(b).copied().unwrap_or(false);
        match &self.mask {
            None => return before,
            Some(_) if before => return false,
            _ => {}
        }
        let mask = self.mask.unwrap();
        let Some(Some(t)) = self.dsp.ds[i].in_s.get(b) else {
            return false;
        };
        (0..9).any(|j| t[j] & mask[j] != 0)
    }
    /// is code at pc of fn reachable with one of the group's tags?
    pub fn keep(&self, an: &An, fn_: i64, pc: i64) -> bool {
        let Some(&i) = self.dsp.d_idx.get(&fn_) else {
            return true;
        };
        let g = an.cfg(self.dsp.ds[i].fo);
        match g.pc_block.get(&pc) {
            None => true,
            Some(&b) => {
                self.allowed(fn_, b)
                    || g.pc_copies.get(&pc).is_some_and(|l| {
                        l.iter().any(|&x| {
                            let t = self.dsp.ds[i].in_s.get(x).copied().flatten();
                            t.is_some_and(|t| !is_all(&t)) && self.allowed(fn_, x)
                        })
                    })
            }
        }
    }
}

pub struct DispatchGroups {
    pub groups: Vec<DispatchGroup>,
    pub via: IndexMap<i64, Vec<u32>>,
}

impl<'a> An<'a> {
    /// The instructions of a native program whose handler is `root` (splitDispatch)
    pub fn split_dispatch(&self, root: i64, roots: &HashSet<i64>) -> Option<DispatchGroups> {
        let mut q: VecDeque<(i64, i32)> = VecDeque::from([(root, 0)]);
        let mut seen: HashSet<i64> = HashSet::from_iter([root]);
        while let Some((pc, d)) = q.pop_front() {
            if self.fo(pc).is_none() {
                continue;
            }
            let first = self.tag_states(pc, None);
            if let Some(first) = first {
                if let Some(gs) = self.split_from(first, roots) {
                    return Some(gs);
                }
            }
            if d < 2 {
                let calls: Vec<(i64, bool)> = self.facts.borrow().get(&pc).map_or(vec![], |f| {
                    f.calls.iter().map(|c| (c.callee, c.err_path)).collect()
                });
                for (callee, err) in calls {
                    if !err && !seen.contains(&callee) && !roots.contains(&callee) {
                        seen.insert(callee);
                        q.push_back((callee, d + 1));
                    }
                }
            }
        }
        None
    }

    fn split_from(&self, first: TagStates, roots: &HashSet<i64>) -> Option<DispatchGroups> {
        let mut ds: Vec<TagStates> = vec![first];
        let mut tried: HashSet<i64> = HashSet::from_iter([ds[0].fo]);
        let mut i = 0;
        while i < ds.len() && ds.len() < 4 {
            let dpc = ds[i].fo;
            let f = self.fo(dpc).unwrap().f;
            let ir = fir(f);
            let mut add: Vec<TagStates> = Vec::new();
            for b in &f.blocks {
                for s in &b.stmts {
                    let Some((CallTarget::Fn { pc: cpc }, args)) = call_of(ir, s) else {
                        continue;
                    };
                    if tried.contains(&cpc) {
                        continue;
                    }
                    let fam = &ds[i].family;
                    let k = ir
                        .items(args)
                        .position(|a| leaf_var(ir, a).is_some_and(|v| fam.contains(&v)));
                    let callee = self.fo(cpc);
                    let pv = match (k, callee) {
                        (Some(k), Some(c)) => param_var(c.f, k as i32 + 1),
                        _ => None,
                    };
                    if pv.is_some() {
                        tried.insert(cpc);
                    }
                    if let Some(pv) = pv {
                        if let Some(t) = self.tag_states(cpc, Some(pv)) {
                            add.push(t);
                        }
                    }
                }
            }
            // (pushed as found: the loop bound reads the grown list)
            ds.extend(add);
            i += 1;
        }
        let mut per_tag: Vec<Vec<String>> = vec![Vec::new(); NT];
        for (i, d) in ds.iter().enumerate() {
            for (b, t) in d.in_s.iter().enumerate() {
                let Some(t) = t else { continue };
                if is_all(t) {
                    continue;
                }
                for w in 0..9 {
                    let mut x = t[w];
                    while x != 0 {
                        let low = x & x.wrapping_neg();
                        per_tag[w * 32 + low.trailing_zeros() as usize].push(format!("{i}:{b}"));
                        x &= x - 1;
                    }
                }
            }
        }
        let mut sig: IndexMap<String, Vec<u32>> = IndexMap::default();
        for (v, parts) in per_tag.iter().enumerate() {
            if parts.is_empty() {
                continue;
            }
            sig.entry(parts.join(",")).or_default().push(v as u32);
        }
        let d_idx: HashMap<i64, usize> = ds.iter().enumerate().map(|(i, d)| (d.fo, i)).collect();
        let before: Vec<Vec<bool>> = ds
            .iter()
            .map(|d| {
                let blocks = &self.fo(d.fo).unwrap().f.blocks;
                let mut reach = vec![false; blocks.len()];
                let mut q: Vec<usize> = Vec::new();
                for (b, t) in d.in_s.iter().enumerate() {
                    if let Some(t) = t {
                        if !is_all(t) {
                            reach[b] = true;
                            q.push(b);
                        }
                    }
                }
                while let Some(b) = q.pop() {
                    for &x in &blocks[b].preds {
                        if !reach[x] {
                            reach[x] = true;
                            q.push(x);
                        }
                    }
                }
                (0..blocks.len())
                    .map(|b| d.in_s[b].is_some() && !reach[b])
                    .collect()
            })
            .collect();
        let dsp = Rc::new(Dispatch { ds, before, d_idx });
        let mk_mask = |tags: &[u32]| -> Tags {
            let mut m = new_tags(false);
            for &v in tags {
                m[(v >> 5) as usize] |= 1 << (v & 31);
            }
            m
        };
        let line_text = |fn_: i64, pc: i64| -> String {
            let facts = self.facts.borrow();
            let Some(ff) = facts.get(&fn_) else {
                return String::new();
            };
            match ff.pc_line.get(&pc) {
                Some(&l) => ff.lines.get((l - 1) as usize).cloned().unwrap_or_default(),
                None => String::new(),
            }
        };
        struct Cand {
            tags: Vec<u32>,
            logs: IndexSet<String>,
            acts: i64,
        }
        let mut cand: Vec<Cand> = Vec::new();
        let mut via: IndexMap<i64, Vec<u32>> = IndexMap::default();
        let mut via_rest: Vec<(i64, u32)> = Vec::new();
        for (k, tags) in &sig {
            let mask = mk_mask(tags);
            let mut other = false;
            let mut acts = 0i64;
            let mut logs: IndexSet<String> = IndexSet::default();
            let mut hs: IndexSet<i64> = IndexSet::default();
            for part in k.split(',') {
                let mut it = part.split(':');
                let i: usize = it.next().unwrap().parse().unwrap();
                let b: usize = it.next().unwrap().parse().unwrap();
                let d = &dsp.ds[i];
                let t = d.in_s[b].unwrap();
                let excl = (0..9).all(|j| t[j] & !mask[j] == 0);
                let f = self.fo(d.fo).unwrap().f;
                let ir = fir(f);
                if let Term::Ret { e: Some(e) } = &f.blocks[b].term {
                    let mut xs: Vec<Node> = Vec::new();
                    ir.walk(*e, &mut |_, n| xs.push(n));
                    for n in xs {
                        if let Node::Call(t, _) = n {
                            acts += 1;
                            if let CallTarget::Fn { pc } = ir.target(t) {
                                if roots.contains(&pc) {
                                    other = true;
                                    if excl {
                                        hs.insert(pc);
                                    }
                                }
                            }
                        }
                    }
                }
                for s in &f.blocks[b].stmts {
                    let c = call_of(ir, s);
                    if let Some((CallTarget::Fn { pc }, _)) = &c {
                        if roots.contains(pc) {
                            other = true;
                            if excl {
                                hs.insert(*pc);
                            }
                        }
                    }
                    if c.is_some() || matches!(s, Stmt::Store { .. } | Stmt::Stores { .. }) {
                        acts += 1;
                    }
                    if excl {
                        if let Some((CallTarget::Sys { name, .. }, _)) = &c {
                            if name.contains("log") {
                                let lt = line_text(d.fo, stmt_pc(s));
                                if let Some(m) =
                                    crate::jre!(r#""Instruction: ([^"]+)""#).captures(&lt)
                                {
                                    logs.insert(snake2(&m[1]));
                                }
                            }
                        }
                    }
                }
            }
            if !other && acts != 0 && tags[0] < 256 {
                cand.push(Cand {
                    tags: tags.clone(),
                    logs,
                    acts,
                });
            }
            if other && hs.len() == 1 && tags[0] < 256 {
                let h = hs[0];
                if tags.len() <= 4 {
                    via.entry(h).or_default().extend(tags.iter().copied());
                } else if tags.len() > 16 {
                    via_rest.push((h, tags[0]));
                }
            }
        }
        let mut small: Vec<(Vec<u32>, IndexSet<String>, i64)> = cand
            .iter()
            .filter(|c| c.tags.len() <= 4)
            .map(|c| (c.tags.clone(), c.logs.clone(), c.acts))
            .collect();
        let max_small: i64 = small
            .iter()
            .flat_map(|c| c.0.iter().map(|&x| x as i64))
            .fold(-1, i64::max);
        let rest = {
            let mut r: Vec<&Cand> = cand.iter().filter(|c| c.tags.len() > 16).collect();
            r.sort_by(|a, b| b.acts.cmp(&a.acts));
            r.first().map(|c| (c.tags.clone(), c.logs.clone(), c.acts))
        };
        let mut rest_pushed = false;
        if let Some(r) = &rest {
            if r.0[0] as i64 == max_small + 1 && !small.is_empty() {
                small.push((vec![r.0[0]], r.1.clone(), r.2));
                rest_pushed = true;
            }
        }
        let covered: HashSet<u32> = small
            .iter()
            .flat_map(|c| c.0.iter().copied())
            .chain(via.values().flatten().copied())
            .collect();
        for (h, t) in via_rest {
            if t > 0 && !via.contains_key(&h) && (0..t).all(|v| covered.contains(&v)) {
                via.insert(h, vec![t]);
            }
        }
        let dispatchers: Vec<String> = dsp
            .ds
            .iter()
            .map(|d| self.fo(d.fo).unwrap().name.clone())
            .collect();
        let tag = (dsp.ds[0].fo, dsp.ds[0].primary);
        let nsmall = small.len();
        let mut groups: Vec<DispatchGroup> = small
            .iter()
            .enumerate()
            .map(|(ci, c)| {
                let is_rest = ci == nsmall - 1
                    && rest_pushed
                    && c.0.len() == 1
                    && rest.as_ref().is_some_and(|r| c.0[0] == r.0[0]);
                let mtags = if is_rest {
                    rest.as_ref().unwrap().0.clone()
                } else {
                    c.0.clone()
                };
                let name = if c.1.len() == 1 {
                    c.1[0].clone()
                } else if c.0.len() == 1 {
                    format!("tag_{}", c.0[0])
                } else {
                    format!(
                        "tags_{}",
                        c.0.iter()
                            .map(|x| x.to_string())
                            .collect::<Vec<_>>()
                            .join("_")
                    )
                };
                DispatchGroup {
                    tags: c.0.clone(),
                    name,
                    source: if c.1.len() == 1 { "str" } else { "tag" },
                    accounts: None,
                    dispatchers: dispatchers.clone(),
                    mask: Some(mk_mask(&mtags)),
                    dsp: dsp.clone(),
                    tag,
                }
            })
            .collect();
        if groups.len() < 2 {
            return None;
        }
        let d0f = self.fo(dsp.ds[0].fo).unwrap().f;
        let d0ir = fir(d0f);
        let has_before = (0..dsp.ds[0].in_s.len()).any(|b| {
            dsp.before[0][b]
                && d0f.blocks[b].stmts.iter().any(|s| {
                    call_of_any(d0ir, s) || matches!(s, Stmt::Store { .. } | Stmt::Stores { .. })
                })
        });
        if has_before {
            groups.push(DispatchGroup {
                tags: vec![],
                name: format!("{}_before_dispatch", dispatchers[0]),
                source: "tag",
                accounts: None,
                dispatchers: vec![dispatchers[0].clone()],
                mask: None,
                dsp: dsp.clone(),
                tag,
            });
        }
        if groups.iter().all(|x| x.source == "tag") {
            let tag_set: Vec<u32> = groups
                .iter()
                .filter(|x| x.tags.len() == 1)
                .flat_map(|x| x.tags.iter().copied())
                .collect();
            for (known, label, ixs) in crate::cpi::known_families() {
                let has_ix = |t: u32| ixs.iter().any(|x| x.0 == t as u64);
                let cover = tag_set.iter().filter(|&&t| has_ix(t)).count();
                let named = || {
                    let w: Vec<String> = label
                        .to_lowercase()
                        .split(' ')
                        .take(2)
                        .map(|x| x.to_string())
                        .collect();
                    let w = w.join(" ");
                    self.funcs
                        .iter()
                        .any(|x| x.text.to_lowercase().contains(&w))
                };
                let exact =
                    ixs.len() == tag_set.len() && cover == ixs.len() && (ixs.len() >= 6 || named());
                let pat = format!("/* {known} */");
                if !(exact
                    || (cover as f64 >= 0.8 * tag_set.len() as f64
                        && cover >= 2
                        && self.funcs.iter().any(|x| x.text.contains(&pat))))
                {
                    continue;
                }
                for x in groups.iter_mut() {
                    if x.tags.len() == 1 {
                        if let Some(l) = ixs.iter().find(|y| y.0 == x.tags[0] as u64) {
                            x.name = snake2(l.1);
                            x.source = "known";
                            x.accounts = Some(l.2.iter().map(|s| s.to_string()).collect());
                        }
                    }
                }
                break;
            }
        }
        groups.sort_by_key(|a| a.tags.first().map_or(-1, |&t| t as i64));
        let mut names: HashMap<String, usize> = HashMap::default();
        for x in groups.iter_mut() {
            let n = names.get(&x.name).copied().unwrap_or(0);
            names.insert(x.name.clone(), n + 1);
            if n != 0 {
                x.name = format!("{}_{}", x.name, n + 1);
            }
        }
        Some(DispatchGroups { groups, via })
    }
}

/// callOf(s) is defined (a call statement, a set / eval of a call)
fn call_of_any(ir: &Ir, s: &Stmt) -> bool {
    call_of(ir, s).is_some()
}
