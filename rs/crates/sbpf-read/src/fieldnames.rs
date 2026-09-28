//! `src/fieldnames.ts`: semantic names for generated struct fields (after how the program uses them),
//! and role names of small unnamed functions.

use crate::sem::known_key;
use crate::util::{b58, call_of, expr_eq, is_fn_hex, jkey_s, js_hex, n_s, stmt_exprs, u16len, N};
use crate::views::{expr_type, fid, Field, Views, FT};
use sbpf_ir::fx::{IndexMap, IndexSet};
use regex::Regex;
use sbpf_ir::{BinOp, CallTarget, CmpOp, Ir, Node, Stmt, Term, E};
use sbpf_program::Func;
use sbpf_ir::fx::{HashMap, HashSet};
use std::sync::OnceLock;

pub struct FieldNameCfg<'a> {
    pub funcs: IndexMap<i64, &'a Func>,
    pub types: &'a dyn Fn(i64) -> IndexMap<u32, String>,
    pub fn_name: &'a dyn Fn(i64) -> String,
    pub str_at: &'a dyn Fn(u64, u64) -> Option<String>,
}

/// `/^[fd]0x[0-9a-f]+_(u(8|16|32|64)|ref)$/`
pub fn generated(n: &str) -> bool {
    let b = n.as_bytes();
    if b.len() < 4 || !(b[0] == b'f' || b[0] == b'd') || &n[1..3] != "0x" {
        return false;
    }
    let r = &n[3..];
    let Some(i) = r.find('_') else { return false };
    let (h, t) = (&r[..i], &r[i + 1..]);
    !h.is_empty()
        && h.bytes()
            .all(|c| c.is_ascii_digit() || (b'a'..=b'f').contains(&c))
        && matches!(t, "u8" | "u16" | "u32" | "u64" | "ref")
}

const RESERVED: &[&str] = &[
    "key",
    "owner",
    "is_signer",
    "is_writable",
    "executable",
    "rent_epoch",
    "data",
    "lamports",
    "original_data_len",
    "data_len",
    "info",
    "borrow",
    "strong",
    "weak",
    "dup_marker",
    "len",
    "ptr",
    "tag",
    "val",
];

fn is_word(c: u8) -> bool {
    c.is_ascii_alphanumeric() || c == b'_'
}

/// `KEY_WORDS.exec(s)?.[1]` with KEY_WORDS = /\b(owner|admin|authority)\b/
fn key_word(s: &str) -> Option<&'static str> {
    let b = s.as_bytes();
    for i in 0..b.len() {
        if i > 0 && is_word(b[i - 1]) {
            continue;
        }
        for w in ["owner", "admin", "authority"] {
            if b[i..].starts_with(w.as_bytes()) && !b.get(i + w.len()).is_some_and(|&c| is_word(c))
            {
                return Some(w);
            }
        }
    }
    None
}

fn js_trim(s: &str) -> &str {
    let ws = |c: char| {
        matches!(
            c,
            '\t' | '\n'
                | '\u{b}'
                | '\u{c}'
                | '\r'
                | ' '
                | '\u{a0}'
                | '\u{1680}'
                | '\u{2028}'
                | '\u{2029}'
                | '\u{202f}'
                | '\u{205f}'
                | '\u{3000}'
                | '\u{feff}'
        ) || ('\u{2000}'..='\u{200a}').contains(&c)
    };
    s.trim_matches(ws)
}

struct Pats {
    signer: Regex,
    writable: Regex,
    owned: Regex,
    invalid: Regex,
    matchp: Regex,
    insufficient: Regex,
    word: Regex,
    bad: Regex,
}

fn pats() -> &'static Pats {
    static P: OnceLock<Pats> = OnceLock::new();
    P.get_or_init(|| {
        let b = r"(?-u:\b)";
        let r = |s: &str| Regex::new(&s.replace("\\b", b)).unwrap();
        Pats {
            signer: r(r"^(?:the )?([a-z][a-z0-9 _]*?) (?:provided |account )?(?:must be|is not|was not) (?:a )?signer\b"),
            writable: r(r"^(?:the )?([a-z][a-z0-9 _]*?) (?:provided |account )?(?:must be|is not|was not) writable\b"),
            owned: r(r"^(?:the )?([a-z][a-z0-9 _]*?) (?:provided |account )?(?:is )?not owned by\b"),
            invalid: r(r"^(?:invalid|incorrect|wrong|unexpected|mismatched) ([a-z][a-z0-9 _]*?)(?: provided| account| key| address| pubkey)?(?:$|[,:;(]| for\b| in\b| on\b)"),
            matchp: r(r"^(?:the )?([a-z][a-z0-9 _]*?) (?:provided |account |key |address |pubkey )?(?:does not match|doesn't match|do not match|mismatch|is invalid|is incorrect|must match|must be)\b"),
            insufficient: r(r"^(?:insufficient|not enough) ([a-z][a-z0-9 _]*?)(?:$|[,:;(]| for\b| in\b| to\b)"),
            word: r(r"^[a-z][a-z0-9]*$"),
            bad: r(r"^(is|are|was|and|or|must|not|be|has|have|should|cannot|can)$"),
        }
    })
}

/// msgSubject: a snake_case name for the thing a failure message is about.
pub fn msg_subject(msg: &str, value: bool) -> Option<String> {
    let t = js_trim(msg);
    let t = t.trim_end_matches(['.', '!']);
    let m0 = crate::util::camel_split_space(t).to_lowercase();
    if u16len(&m0) > 120 {
        return None;
    }
    let p = pats();
    let list: Vec<(&Regex, &str)> = if value {
        vec![
            (&p.signer, "_is_signer"),
            (&p.writable, "_is_writable"),
            (&p.invalid, ""),
            (&p.matchp, ""),
            (&p.insufficient, ""),
        ]
    } else {
        vec![(&p.owned, "_owner"), (&p.invalid, ""), (&p.matchp, "")]
    };
    for (re, suf) in list {
        let Some(m) = re.captures(&m0) else { continue };
        let g = m.get(1).map_or("", |x| x.as_str());
        let w: Vec<&str> = g
            .split([' ', '_'])
            .filter(|x| !x.is_empty() && !["the", "a", "an", "provided", "given"].contains(x))
            .collect();
        if w.is_empty() || w.len() > 4 || w.iter().any(|x| !p.word.is_match(x) || p.bad.is_match(x))
        {
            return None;
        }
        return Some(w.join("_") + suf);
    }
    None
}

#[derive(Clone, Debug)]
struct Vote {
    name: String,
    rank: i32,
    why: String,
}

/// A place in a view: the field there (a copy, identified by id), the offset left in it.
#[derive(Clone, Debug)]
struct Loc {
    view: String,
    field: Option<Field>,
    rest: N,
    off: N,
    key: bool,
}

struct Votes {
    votes: IndexMap<u32, (String, Vec<Vote>)>,
    added: IndexMap<String, IndexMap<crate::util::K, Vec<Vote>>>,
    edges: Vec<(Loc, Loc)>,
    shared_memo: HashMap<String, bool>,
}

impl Votes {
    fn shared(&mut self, views: &Views, l: &Loc) -> bool {
        if let Some(&r) = self.shared_memo.get(&l.view) {
            return r;
        }
        let r = views
            .map
            .get(&l.view)
            .is_some_and(|v| v.doc.contains("unrelated objects"));
        self.shared_memo.insert(l.view.clone(), r);
        r
    }
    fn vote(&mut self, views: &Views, loc: Option<&Loc>, name: &str, rank: i32, why: String) {
        let Some(loc) = loc else { return };
        let okn = {
            let b = name.as_bytes();
            !b.is_empty()
                && (b[0].is_ascii_lowercase() || b[0] == b'_')
                && b.iter()
                    .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || *c == b'_')
        };
        if !okn || self.shared(views, loc) {
            return;
        }
        let v = Vote {
            name: name.into(),
            rank,
            why,
        };
        if let Some(f) = &loc.field {
            if !generated(&f.name) || loc.rest != 0.0 {
                return;
            }
            self.votes
                .entry(f.id)
                .or_insert_with(|| (loc.view.clone(), Vec::new()))
                .1
                .push(v);
        } else if loc.key
            && views
                .map
                .get(&loc.view)
                .is_some_and(|x| x.fields.iter().any(|f| generated(&f.name)))
        {
            self.added
                .entry(loc.view.clone())
                .or_default()
                .entry(crate::util::K::of(loc.off))
                .or_default()
                .push(v);
        }
    }
}

fn pick(vs: &[Vote]) -> Vote {
    let mut c: IndexMap<String, (Vote, u32)> = IndexMap::default();
    for v in vs {
        match c.get_mut(&v.name) {
            None => {
                c.insert(v.name.clone(), (v.clone(), 1));
            }
            Some(x) => {
                x.1 += 1;
                if v.rank < x.0.rank {
                    x.0 = v.clone();
                }
            }
        }
    }
    let mut l: Vec<(Vote, u32)> = c.into_values().collect();
    l.sort_by(|a, b| {
        a.0.rank
            .cmp(&b.0.rank)
            .then((b.1 as i64).cmp(&(a.1 as i64)))
            .then(if a.0.name < b.0.name {
                std::cmp::Ordering::Less
            } else {
                std::cmp::Ordering::Greater
            })
    });
    l.remove(0).0
}

/// nameFields: rename the generated fields of the views after how the functions use them.
pub fn name_fields(cfg: &FieldNameCfg, views: &mut Views) -> usize {
    let mut vt = Votes {
        votes: IndexMap::default(),
        added: IndexMap::default(),
        edges: Vec::new(),
        shared_memo: HashMap::default(),
    };
    let mut gen: HashMap<String, bool> = HashMap::default();
    fn reach(views: &Views, t: &str, gen: &mut HashMap<String, bool>) -> bool {
        if let Some(&g) = gen.get(t) {
            return g;
        }
        gen.insert(t.to_string(), false);
        let r = match views.map.get(t) {
            None => false,
            Some(v) => v.fields.iter().any(|x| {
                generated(&x.name)
                    || match &x.t {
                        FT::Ref(to) => reach(views, to, gen),
                        FT::Embed(ty) => reach(views, ty, gen),
                        _ => false,
                    }
            }),
        };
        gen.insert(t.to_string(), r);
        r
    }
    for (&pc, f) in &cfg.funcs {
        let ir = f.ir.as_ref().unwrap();
        let tys = (cfg.types)(pc);
        let mut any = tys.values().any(|t| reach(views, t, &mut gen));
        if !any {
            'o: for b in &f.blocks {
                for s in &b.stmts {
                    let Some((CallTarget::Fn { pc: cpc }, _)) = call_of(ir, s) else {
                        continue;
                    };
                    let Some(cf) = cfg.funcs.get(&cpc) else {
                        continue;
                    };
                    let ct = (cfg.types)(cpc);
                    if ct.iter().any(|(v, t)| {
                        cf.vars.get(*v as usize).is_some_and(|x| x.param > 0)
                            && reach(views, t, &mut gen)
                    }) {
                        any = true;
                        break 'o;
                    }
                }
            }
        }
        if any {
            scan(cfg, views, pc, f, &tys, &mut vt);
        }
    }
    let mut n = 0;
    let mut by_view: IndexMap<String, Vec<(u32, Vote)>> = IndexMap::default();
    for (fid_, (view, v)) in &vt.votes {
        by_view
            .entry(view.clone())
            .or_default()
            .push((*fid_, pick(v)));
    }
    for (view, m) in &vt.added {
        if !views.map.contains_key(view) {
            continue;
        }
        for (off, vs) in m {
            let off = off.get();
            let overlaps = {
                let v = &views.map[view];
                v.fields.iter().any(|x| {
                    x.off < off + 32.0 && off < x.off + views.width(&x.t) * x.count.unwrap_or(1.0)
                }) || v.size.is_some_and(|s| off + 32.0 > s)
            };
            if overlaps {
                continue;
            }
            let fd = Field {
                id: fid(),
                name: format!("f0x{}_key", js_hex(off)),
                off,
                t: FT::Embed("Pubkey".into()),
                doc: None,
                count: None,
            };
            let id = fd.id;
            let v = views.map.get_mut(view).unwrap();
            v.fields.push(fd);
            v.fields.sort_by(|a, b| a.off.partial_cmp(&b.off).unwrap());
            by_view
                .entry(view.clone())
                .or_default()
                .push((id, pick(vs)));
        }
    }
    let mut chosen: IndexMap<u32, Vote> = IndexMap::default();
    for l in by_view.values() {
        for (fd, v) in l {
            chosen.insert(*fd, v.clone());
        }
    }
    for _round in 0..3 {
        let mut add: IndexMap<u32, (Loc, Vote)> = IndexMap::default();
        for (a, b) in &vt.edges {
            for (x, y, dir) in [(a, b, "from"), (b, a, "to")] {
                let yid = y.field.as_ref().unwrap().id;
                let xid = x.field.as_ref().unwrap().id;
                if let Some(v) = chosen.get(&yid) {
                    if !chosen.contains_key(&xid) && !add.contains_key(&xid) {
                        add.insert(
                            xid,
                            (
                                x.clone(),
                                Vote {
                                    name: v.name.clone(),
                                    rank: 9,
                                    why: format!("copied {dir} {}.{}", y.view, v.name),
                                },
                            ),
                        );
                    }
                }
            }
        }
        if add.is_empty() {
            break;
        }
        for (xid, (x, v)) in add {
            chosen.insert(xid, v.clone());
            by_view.entry(x.view.clone()).or_default().push((xid, v));
        }
    }
    for (view, list) in by_view.iter_mut() {
        let Some(vw) = views.map.get(view) else {
            continue;
        };
        let renamed: HashSet<u32> = list.iter().map(|x| x.0).collect();
        let mut names: HashSet<String> = vw
            .fields
            .iter()
            .filter(|x| !renamed.contains(&x.id))
            .map(|x| x.name.clone())
            .collect();
        let offs: HashMap<u32, (N, bool)> = vw
            .fields
            .iter()
            .map(|x| (x.id, (x.off, matches!(x.t, FT::Embed(_)))))
            .collect();
        list.sort_by(|a, b| {
            let oa = offs.get(&a.0).map_or(0.0, |x| x.0);
            let ob = offs.get(&b.0).map_or(0.0, |x| x.0);
            a.1.rank.cmp(&b.1.rank).then(oa.partial_cmp(&ob).unwrap())
        });
        let mut k = 0;
        for (id, v) in list.iter() {
            let Some(&(off, embed)) = offs.get(id) else {
                continue;
            };
            let mut nm = if RESERVED.contains(&v.name.as_str()) {
                if embed || v.rank <= 2 {
                    format!("{}_key", v.name)
                } else {
                    format!("{}_field", v.name)
                }
            } else {
                v.name.clone()
            };
            if names.contains(&nm) {
                let mut i = 2;
                while names.contains(&format!("{nm}_{i}")) {
                    i += 1;
                }
                nm = format!("{nm}_{i}");
            }
            names.insert(nm.clone());
            let vw = views.map.get_mut(view).unwrap();
            let fd = vw.fields.iter_mut().find(|x| x.id == *id).unwrap();
            let was = fd.name.clone();
            let d = was
                .strip_prefix("d0x")
                .and_then(|r| r.split_once('_'))
                .filter(|(h, _)| {
                    !h.is_empty()
                        && h.bytes()
                            .all(|c| c.is_ascii_digit() || (b'a'..=b'f').contains(&c))
                })
                .map(|x| x.0.to_string());
            let head = match d {
                Some(h) => format!("data +0x{h}"),
                None => format!("+0x{}", js_hex(off)),
            };
            fd.doc = Some(format!(
                "{head} [heur: {}]{}",
                v.why,
                fd.doc
                    .as_ref()
                    .filter(|x| !x.is_empty())
                    .map_or(String::new(), |x| format!(" {x}"))
            ));
            fd.name = nm;
            k += 1;
        }
        if k > 0 {
            let vw = views.map.get_mut(view).unwrap();
            vw.doc.push_str(&format!(
                "; {k} field{} named after their use [heur]",
                if k > 1 { "s" } else { "" }
            ));
        }
        n += k;
    }
    n
}

#[derive(Clone, Debug)]
enum Key {
    Field(Loc, bool),
    Acct(E),
    Const(String),
}

enum Write {
    Src(E, (usize, usize)),
    View(String, N),
    Store,
}

struct Scan<'a> {
    cfg: &'a FieldNameCfg<'a>,
    views: &'a Views,
    pc: i64,
    f: &'a Func,
    ir: &'a Ir,
    tys: &'a IndexMap<u32, String>,
    fp: Option<u32>,
    defs: HashMap<u32, Option<E>>,
    def_at: HashMap<u32, (usize, usize)>,
    logs: bool,
    cur: (usize, usize),
    loc_memo: HashMap<E, Option<Loc>>,
    words: Option<HashMap<crate::util::K, Option<E>>>,
    signers: Option<IndexSet<String>>,
    cx: Option<Conds>,
    clock_slots: Vec<N>,
    byte_copies: HashMap<crate::util::K, Loc>,
    fnm: String,
}

struct Conds {
    cond_of: HashMap<E, usize>,
    cond_vars: HashMap<u32, usize>,
    set_of: HashMap<E, u32>,
    used_by: HashMap<u32, Vec<u32>>,
}

impl<'a> Scan<'a> {
    fn ty(&self) -> impl Fn(u32) -> Option<String> + '_ {
        move |id| self.tys.get(&id).cloned()
    }
    fn etype(&self, e: E) -> Option<String> {
        expr_type(self.views, self.ir, e, &self.ty())
    }
    fn val(&self, mut e: E, depth: u32) -> E {
        let mut d = depth;
        while d > 0 {
            d -= 1;
            let Node::Var(id) = self.ir.get(e) else { break };
            if !crate::util::is_local(self.f, id) {
                break;
            }
            match self.defs.get(&id) {
                Some(Some(x)) if !matches!(self.ir.get(*x), Node::Call(..)) => e = *x,
                _ => break,
            }
        }
        e
    }
    fn frame_off(&self, e: E) -> Option<N> {
        let e = self.val(e, 2);
        crate::util::fo_add(self.ir, e, self.fp)
    }
    fn loc(&mut self, addr: E) -> Option<Loc> {
        if let Some(r) = self.loc_memo.get(&addr) {
            return r.clone();
        }
        let r = self.loc0(addr);
        self.loc_memo.insert(addr, r.clone());
        r
    }
    fn loc0(&self, addr: E) -> Option<Loc> {
        let (b, off) = match self.ir.get(addr) {
            Node::Bin(BinOp::Add, a, c) => match self.ir.get(c) {
                Node::Const(c) => (a, n_s(c)),
                _ => (addr, 0.0),
            },
            _ => (addr, 0.0),
        };
        if !(0.0..=65536.0).contains(&off) {
            return None;
        }
        let mut t = self.etype(b);
        if t.is_none() {
            if let Node::Var(_) = self.ir.get(b) {
                let d = self.val(b, 3);
                if d != b {
                    t = self.etype(d);
                }
            }
        }
        t.and_then(|t| self.loc_in(&t, off))
    }
    fn loc_in(&self, t: &str, off: N) -> Option<Loc> {
        let (mut t, mut off) = (t.to_string(), off);
        for _ in 0..4 {
            let v = self.views.map.get(&t)?;
            if let Some(s) = v.size.filter(|s| *s != 0.0 && !s.is_nan()) {
                if off >= s {
                    off %= s;
                }
            }
            let Some(fd) = self.views.field_at(&t, off) else {
                return Some(Loc {
                    view: t,
                    field: None,
                    rest: 0.0,
                    off,
                    key: false,
                });
            };
            let d = off - fd.off;
            if let FT::Embed(et) = &fd.t {
                if self.views.map.contains_key(et) && fd.count.is_none() {
                    t = et.clone();
                    off = d;
                    continue;
                }
            }
            return Some(Loc {
                view: t,
                field: Some(fd.clone()),
                rest: d,
                off,
                key: false,
            });
        }
        None
    }
    fn load_loc(&mut self, e: E, size: Option<u8>) -> Option<Loc> {
        let mut at = self.cur;
        let mut e = e;
        for _ in 0..3 {
            let Node::Var(id) = self.ir.get(e) else { break };
            if !crate::util::is_local(self.f, id) {
                break;
            }
            match self.defs.get(&id) {
                Some(Some(x)) if !matches!(self.ir.get(*x), Node::Call(..)) => {
                    at = self.def_at[&id];
                    e = *x;
                }
                _ => break,
            }
        }
        if let Node::Ext { a, .. } = self.ir.get(e) {
            e = self.val(a, 3);
        }
        let Node::Load { size: esz, addr } = self.ir.get(e) else {
            return None;
        };
        if size.is_some_and(|s| s != esz) {
            return None;
        }
        let l = match self.frame_off(addr) {
            Some(o) => self.frame_field(o, esz as N, at, 0),
            None => self.loc(addr),
        };
        let l = l?;
        let fd = l.field.as_ref()?;
        let ok = match &fd.t {
            FT::Embed(_) => false,
            FT::Ref(_) => esz == 8,
            FT::Scalar(s) => *s == esz,
        };
        if ok && l.rest == 0.0 {
            Some(l)
        } else {
            None
        }
    }
    fn frame_field(&mut self, o: N, size: N, at: (usize, usize), depth: u32) -> Option<Loc> {
        match self.last_write(o, size, at)? {
            Write::Store => None,
            Write::View(v, off) => self.loc_in(&v, off),
            Write::Src(src, at2) => match self.frame_off(src) {
                Some(so) => {
                    if depth < 4 {
                        self.frame_field(so, size, at2, depth + 1)
                    } else {
                        None
                    }
                }
                None => self.loc(src),
            },
        }
    }
    fn copy_of(&self, s: &Stmt) -> Option<(E, E, N)> {
        if let Stmt::Copy { dst, src, n, .. } = s {
            return Some((*dst, *src, *n as N));
        }
        let (t, args) = call_of(self.ir, s)?;
        let CallTarget::Fn { pc } = t else {
            return None;
        };
        if args.len < 3 || !is_memcpy_only(&(self.cfg.fn_name)(pc)) {
            return None;
        }
        let n = self.val(self.ir.at(args, 2), 3);
        match self.ir.get(n) {
            Node::Const(v) if v <= 0x10000 => {
                Some((self.ir.at(args, 0), self.ir.at(args, 1), v as N))
            }
            _ => None,
        }
    }
    fn add(&self, e: E, d: N) -> E {
        if d == 0.0 {
            return e;
        }
        let ir = self.ir;
        let du = crate::util::big_u(d);
        match ir.get(e) {
            Node::Bin(BinOp::Add, a, b) if matches!(ir.get(b), Node::Const(_)) => {
                let Node::Const(c) = ir.get(b) else {
                    unreachable!()
                };
                let c2 = ir.c(c.wrapping_add(du));
                ir.bin(BinOp::Add, a, c2)
            }
            _ => {
                let c2 = ir.c(du);
                ir.bin(BinOp::Add, e, c2)
            }
        }
    }
    fn param_type(&self, cpc: i64, reg: i32) -> Option<String> {
        let cf = self.cfg.funcs.get(&cpc)?;
        let v = cf.vars.iter().find(|x| x.param == reg)?;
        (self.cfg.types)(cpc).get(&v.id).cloned()
    }
    fn last_write(&self, o: N, n: N, at: (usize, usize)) -> Option<Write> {
        let (mut bi, mut si) = at;
        for _ in 0..8 {
            let ss = &self.f.blocks[bi].stmts;
            for k in (0..si).rev() {
                let s = &ss[k];
                if let Some((dst, src, cn)) = self.copy_of(s) {
                    let Some(d) = self.frame_off(dst) else {
                        continue;
                    };
                    if d <= o && o + n <= d + cn {
                        return Some(Write::Src(self.add(src, o - d), (bi, k)));
                    }
                    if d < o + n && o < d + cn {
                        return None;
                    }
                    continue;
                }
                match s {
                    Stmt::Store { addr, size, .. } => {
                        if let Some(d) = self.frame_off(*addr) {
                            if d < o + n && o < d + *size as N {
                                return Some(Write::Store);
                            }
                        }
                        continue;
                    }
                    Stmt::Stores {
                        addr, size, vals, ..
                    } => {
                        if let Some(d) = self.frame_off(*addr) {
                            if d < o + n && o < d + (*size as u32 * vals.len) as N {
                                return Some(Write::Store);
                            }
                        }
                        continue;
                    }
                    _ => {}
                }
                let Some((t, args)) = call_of(self.ir, s) else {
                    continue;
                };
                let mut best: Option<(usize, N)> = None;
                for (i, x) in self.ir.items(args).enumerate() {
                    if let Some(a) = self.frame_off(x) {
                        if a <= o && o - a < 1024.0 && best.is_none_or(|b| a > b.1) {
                            best = Some((i, a));
                        }
                    }
                }
                let Some((i, a)) = best else { continue };
                let view = match t {
                    CallTarget::Fn { pc } => self.param_type(pc, i as i32 + 1),
                    _ => None,
                };
                return view.map(|v| Write::View(v, o - a));
            }
            let ps = &self.f.blocks[bi].preds;
            if ps.len() != 1 {
                return None;
            }
            bi = ps[0];
            si = self.f.blocks[bi].stmts.len();
        }
        None
    }
    fn words(&mut self) -> &HashMap<crate::util::K, Option<E>> {
        if self.words.is_none() {
            let mut w: HashMap<crate::util::K, Option<E>> = HashMap::default();
            for b in &self.f.blocks {
                for s in &b.stmts {
                    let (addr, vals): (E, Vec<E>) = match s {
                        Stmt::Store {
                            addr, size: 8, v, ..
                        } => (*addr, vec![*v]),
                        Stmt::Stores {
                            addr,
                            size: 8,
                            vals,
                            ..
                        } => (*addr, self.ir.to_vec(*vals)),
                        _ => continue,
                    };
                    if let Some(o) = self.frame_off(addr) {
                        for (i, x) in vals.iter().enumerate() {
                            let k = crate::util::K::of(o + 8.0 * i as N);
                            let nv = if w.contains_key(&k) { None } else { Some(*x) };
                            w.insert(k, nv);
                        }
                    }
                }
            }
            self.words = Some(w);
        }
        self.words.as_ref().unwrap()
    }
    fn acct_id(&self, e: E) -> String {
        let e = self.val(e, 3);
        if let Node::Bin(BinOp::Add, a, b) = self.ir.get(e) {
            if let Node::Const(c) = self.ir.get(b) {
                if c % 0x30 == 0 && self.etype(a).as_deref() == Some("AccountInfo") {
                    return format!("{}#{}", jkey_s(self.ir, self.val(a, 3)), c / 0x30);
                }
            }
        }
        format!("{}#0", jkey_s(self.ir, e))
    }
    fn key_of(&mut self, a: E, at: (usize, usize), depth: u32) -> Option<Key> {
        let ir = self.ir;
        let a = self.val(a, 3);
        if let Some(o) = self.frame_off(a) {
            if depth > 4 {
                return None;
            }
            match self.last_write(o, 32.0, at) {
                Some(Write::Src(src, at2)) => return self.key_of(src, at2, depth + 1),
                Some(Write::View(v, off)) => {
                    let l = self.loc_in(&v, off)?;
                    let ok = match &l.field {
                        None => true,
                        Some(f) => l.rest == 0.0 && !matches!(f.t, FT::Ref(_)),
                    };
                    if !ok {
                        return None;
                    }
                    let key = l.field.is_none();
                    return Some(Key::Field(Loc { key, ..l }, false));
                }
                Some(Write::Store) => {
                    let ws: Vec<Option<E>> = [0.0, 8.0, 16.0, 24.0]
                        .iter()
                        .map(|i| {
                            self.words()
                                .get(&crate::util::K::of(o + i))
                                .copied()
                                .flatten()
                        })
                        .collect();
                    let ls: Vec<Option<E>> = ws
                        .iter()
                        .map(|x| x.map(|x| self.val(x, 3)))
                        .map(|x| match x.map(|x| ir.get(x)) {
                            Some(Node::Load { size: 8, addr }) => Some(addr),
                            _ => None,
                        })
                        .collect();
                    if let Some(b0) = ls[0] {
                        if ls.iter().enumerate().all(|(i, x)| {
                            x.is_some_and(|x| {
                                let y = self.add(b0, 8.0 * i as N);
                                expr_eq(ir, x, y)
                            })
                        }) {
                            return self.key_of(b0, at, depth + 1);
                        }
                    }
                }
                None => {}
            }
            return None;
        }
        if let Node::Load { size: 8, addr: x } = ir.get(a) {
            if self.etype(x).as_deref() == Some("AccountInfo") {
                return Some(Key::Acct(x));
            }
            if let Node::Bin(BinOp::Add, xa, xb) = ir.get(x) {
                if let Node::Const(c) = ir.get(xb) {
                    if c % 0x30 == 0 && self.etype(xa).as_deref() == Some("AccountInfo") {
                        return Some(Key::Acct(x));
                    }
                }
            }
        }
        if let Node::Bin(BinOp::Add, aa, ab) = ir.get(a) {
            if ir.get(ab) == Node::Const(8) && self.etype(aa).is_some_and(|t| t.ends_with("Record"))
            {
                return Some(Key::Acct(aa));
            }
        }
        if let Some(ll) = self.load_loc(a, Some(8)) {
            return Some(Key::Field(ll, true));
        }
        let l = self.loc(a)?;
        let ok = match &l.field {
            None => true,
            Some(f) => l.rest == 0.0 && !matches!(f.t, FT::Ref(_)),
        };
        if !ok {
            return None;
        }
        let key = l.field.is_none();
        Some(Key::Field(Loc { key, ..l }, false))
    }
    fn signers(&mut self) -> &IndexSet<String> {
        if self.signers.is_none() {
            let mut r = IndexSet::default();
            let ir = self.ir;
            for b in &self.f.blocks {
                let mut es: Vec<E> = Vec::new();
                for s in &b.stmts {
                    es.extend(stmt_exprs(ir, s));
                }
                if let Term::Br { c, .. } = &b.term {
                    es.push(*c);
                }
                for e in es {
                    let mut found: Vec<(E, u64, u8)> = Vec::new();
                    ir.walk(e, &mut |_, x| {
                        if let Node::Load { size: 1, addr } = x {
                            if let Node::Bin(BinOp::Add, a, c) = ir.get(addr) {
                                if let Node::Const(c) = ir.get(c) {
                                    found.push((a, c, 0));
                                }
                            }
                        }
                    });
                    for (a, c, _) in found {
                        let t = self.etype(a);
                        if t.as_deref() == Some("AccountInfo") && c % 0x30 == 0x28 {
                            r.insert(format!("{}#{}", jkey_s(ir, self.val(a, 3)), c / 0x30));
                        } else if t.as_ref().is_some_and(|t| t.ends_with("Record")) && c == 1 {
                            r.insert(format!("{}#0", jkey_s(ir, self.val(a, 3))));
                        }
                    }
                }
            }
            self.signers = Some(r);
        }
        self.signers.as_ref().unwrap()
    }
    fn acct_name(&mut self, e: E) -> Option<String> {
        let mut e = e;
        for _ in 0..3 {
            e = self.val(e, 3);
            let Node::Load { size: 8, addr } = self.ir.get(e) else {
                return None;
            };
            let l = self.loc(addr)?;
            let fd = l.field.as_ref()?;
            if l.rest != 0.0 {
                return None;
            }
            if (l.view.ends_with("Accounts") || l.view.ends_with("Context")) && !generated(&fd.name)
            {
                return Some(strip_num_suffix(&fd.name).to_string());
            }
            if fd.name != "info" {
                return None;
            }
            e = match self.ir.get(addr) {
                Node::Bin(_, a, _) => a,
                _ => addr,
            };
        }
        None
    }
    fn log_in(&self, bi: usize) -> Option<String> {
        let mut at = bi as i64;
        for _ in 0..3 {
            if at < 0 || at as usize >= self.f.blocks.len() {
                break;
            }
            let b = &self.f.blocks[at as usize];
            for s in &b.stmts {
                let Some((t, args)) = call_of(self.ir, s) else {
                    continue;
                };
                let is_log = match &t {
                    CallTarget::Sys { name, .. } => &**name == "sol_log_",
                    CallTarget::Fn { pc } => is_log_name(&(self.cfg.fn_name)(*pc)),
                    _ => false,
                };
                if !is_log || args.len < 2 {
                    continue;
                }
                let p = self.val(self.ir.at(args, 0), 3);
                let n = self.val(self.ir.at(args, 1), 3);
                if let (Node::Const(p), Node::Const(n)) = (self.ir.get(p), self.ir.get(n)) {
                    if let Some(t) = (self.cfg.str_at)(p, n).filter(|t| !t.is_empty()) {
                        return Some(t);
                    }
                }
            }
            match &b.term {
                Term::Jmp { to } => at = *to,
                _ => break,
            }
        }
        None
    }
    fn branch_msg(&self, bi: usize) -> Option<String> {
        let Term::Br { t, f, .. } = &self.f.blocks[bi].term else {
            return None;
        };
        let a = self.log_in(*t as usize);
        let b = self.log_in(*f as usize);
        match (a, b) {
            (Some(a), None) => Some(a),
            (None, Some(b)) => Some(b),
            _ => None,
        }
    }
    fn conds(&mut self) -> &Conds {
        if self.cx.is_none() {
            let ir = self.ir;
            let mut c = Conds {
                cond_of: HashMap::default(),
                cond_vars: HashMap::default(),
                set_of: HashMap::default(),
                used_by: HashMap::default(),
            };
            for (bi, b) in self.f.blocks.iter().enumerate() {
                if let Term::Br { c: cc, .. } = &b.term {
                    ir.walk(*cc, &mut |x, n| {
                        c.cond_of.insert(x, bi);
                        if let Node::Var(v) = n {
                            c.cond_vars.insert(v, bi);
                        }
                    });
                }
            }
            for b in &self.f.blocks {
                for s in &b.stmts {
                    if let Stmt::Set { dst, e, .. } = s {
                        if *dst < 0 {
                            continue;
                        }
                        let d = *dst as u32;
                        ir.walk(*e, &mut |x, n| {
                            c.set_of.insert(x, d);
                            if let Node::Var(v) = n {
                                c.used_by.entry(v).or_default().push(d);
                            }
                        });
                    }
                }
            }
            self.cx = Some(c);
        }
        self.cx.as_ref().unwrap()
    }
    fn msg_for_var(&mut self, v: u32, depth: u32) -> Option<String> {
        if !self.logs {
            return None;
        }
        if let Some(&bi) = self.conds().cond_vars.get(&v) {
            return self.branch_msg(bi);
        }
        if depth < 2 {
            let ws = self.conds().used_by.get(&v).cloned().unwrap_or_default();
            for w in ws {
                if let Some(m) = self.msg_for_var(w, depth + 1) {
                    return Some(m);
                }
            }
        }
        None
    }
    fn msg_for(&mut self, e: E) -> Option<String> {
        if !self.logs {
            return None;
        }
        if let Some(&bi) = self.conds().cond_of.get(&e) {
            return self.branch_msg(bi);
        }
        let v = self.conds().set_of.get(&e).copied()?;
        self.msg_for_var(v, 0)
    }
    fn key_compare(&mut self, vt: &mut Votes, a: Option<Key>, b: Option<Key>, msg: Option<String>) {
        for (p, q) in [(&a, &b), (&b, &a)] {
            let Some(Key::Field(l0, ptr)) = p else {
                continue;
            };
            let words: Option<Vec<Option<Loc>>> =
                if !*ptr && matches!(l0.field.as_ref().map(|f| &f.t), Some(FT::Scalar(_))) {
                    Some(
                        [0.0, 8.0, 16.0, 24.0]
                            .iter()
                            .map(|d| self.loc_in(&l0.view, l0.off + d))
                            .collect(),
                    )
                } else {
                    None
                };
            if let Some(ws) = &words {
                if !ws.iter().all(|w| {
                    w.as_ref().is_some_and(|w| {
                        w.rest == 0.0 && w.field.as_ref().is_some_and(|f| f.t == FT::Scalar(8))
                    })
                }) {
                    continue;
                }
            }
            let views = self.views;
            let mut vote = |vt: &mut Votes, name: &str, rank: i32, why: String| {
                if let Some(ws) = &words {
                    for (i, w) in ws.iter().enumerate() {
                        vt.vote(
                            views,
                            w.as_ref(),
                            &format!("{name}_w{i}"),
                            rank,
                            format!("{why} (word {i} of the key)"),
                        );
                    }
                } else {
                    vt.vote(views, Some(l0), name, rank, why);
                }
            };
            let sub = msg.as_ref().and_then(|m| msg_subject(m, false));
            let kw = msg.as_ref().and_then(|m| key_word(&m.to_lowercase()));
            let fnm = self.fnm.clone();
            match q {
                Some(Key::Acct(e)) => {
                    let nm = self.acct_name(*e);
                    let id = self.acct_id(*e);
                    if self.signers().contains(&id) {
                        vote(
                            vt,
                            kw.unwrap_or("authority"),
                            1,
                            format!(
                                "compared with the key of a signer{}{} in {fnm}",
                                nm.as_ref().map_or(String::new(), |n| format!(" ({n})")),
                                if kw.is_some() {
                                    format!(" (\"{}\")", msg.as_ref().unwrap())
                                } else {
                                    String::new()
                                }
                            ),
                        );
                    } else if let Some(nm) = nm {
                        vote(
                            vt,
                            &nm,
                            0,
                            format!("compared with the key of account {nm} (has_one) in {fnm}"),
                        );
                    } else if let Some(sub) = &sub {
                        vote(
                            vt,
                            sub,
                            2,
                            format!(
                                "compared with an account's key; \"{}\" on failure in {fnm}",
                                msg.as_ref().unwrap()
                            ),
                        );
                    }
                }
                Some(Key::Const(name)) => {
                    vote(vt, name, 3, format!("compared with the {name} id in {fnm}"));
                }
                _ => {
                    if let Some(sub) = &sub {
                        vote(
                            vt,
                            sub,
                            2,
                            format!(
                                "a key compared; \"{}\" on failure in {fnm}",
                                msg.as_ref().unwrap()
                            ),
                        );
                    }
                }
            }
        }
    }
    fn clock_of(&self, e: E) -> Option<&'static str> {
        let e = self.val(e, 3);
        let Node::Load { size: 8, addr } = self.ir.get(e) else {
            return None;
        };
        let o = self.frame_off(addr)?;
        for &c in &self.clock_slots {
            if o == c + 32.0 {
                return Some("ts");
            }
            if o == c {
                return Some("slot");
            }
        }
        None
    }
    fn has_clock(&self, e: E) -> Option<&'static str> {
        if self.clock_slots.is_empty() {
            return None;
        }
        let mut r: Option<&'static str> = None;
        self.ir.walk(e, &mut |x, _| {
            if r.is_none() {
                r = self.clock_of(x);
            }
        });
        if r.is_none() {
            if let Node::Var(_) = self.ir.get(e) {
                r = self.clock_of(e);
            }
        }
        if r.is_none() {
            let d = self.val(e, 3);
            if d != e {
                self.ir.walk(d, &mut |x, _| {
                    if r.is_none() {
                        r = self.clock_of(x);
                    }
                });
            }
        }
        r
    }
}

fn is_log_name(n: &str) -> bool {
    // /^(log|msg|sol_log)\w*$/
    (n.starts_with("log") || n.starts_with("msg") || n.starts_with("sol_log"))
        && n.bytes().all(|c| c.is_ascii_alphanumeric() || c == b'_')
}
fn is_memcpy_only(n: &str) -> bool {
    // /^memcpy\d*_?$/
    n.strip_prefix("memcpy").is_some_and(|r| {
        let r = r.strip_suffix('_').unwrap_or(r);
        r.bytes().all(|c| c.is_ascii_digit())
    })
}
fn strip_num_suffix(n: &str) -> &str {
    if let Some(i) = n.rfind('_') {
        let t = &n[i + 1..];
        if !t.is_empty() && t.bytes().all(|c| c.is_ascii_digit()) {
            return &n[..i];
        }
    }
    n
}

#[derive(Default)]
struct Use {
    l: Option<Loc>,
    stores: Vec<u64>,
    non_const: bool,
    cmps: Vec<u64>,
    other: bool,
    msgs: Vec<String>,
}

fn scan(
    cfg: &FieldNameCfg,
    views: &Views,
    pc: i64,
    f: &Func,
    tys: &IndexMap<u32, String>,
    vt: &mut Votes,
) {
    let ir = f.ir.as_ref().unwrap();
    let mut sc = Scan {
        cfg,
        views,
        pc,
        f,
        ir,
        tys,
        fp: crate::util::fp_var(f),
        defs: HashMap::default(),
        def_at: HashMap::default(),
        logs: false,
        cur: (0, 0),
        loc_memo: HashMap::default(),
        words: None,
        signers: None,
        cx: None,
        clock_slots: Vec::new(),
        byte_copies: HashMap::default(),
        fnm: (cfg.fn_name)(pc),
    };
    let mut pda = false;
    let mut clock_args: Vec<E> = Vec::new();
    for (bi, b) in f.blocks.iter().enumerate() {
        for (si, s) in b.stmts.iter().enumerate() {
            if let Some(d) = crate::util::dst_of(s) {
                let prev = sc.defs.contains_key(&d);
                let nv = match s {
                    Stmt::Set { e, .. } if !prev => Some(*e),
                    _ => None,
                };
                sc.defs.insert(d, nv);
                sc.def_at.insert(d, (bi, si));
            }
            let Some((t, args)) = call_of(ir, s) else {
                continue;
            };
            if matches!(t, CallTarget::Ind { .. }) {
                continue;
            }
            let (nm, sys) = match &t {
                CallTarget::Sys { name, .. } => (name.to_string(), true),
                CallTarget::Fn { pc } => ((cfg.fn_name)(*pc), false),
                _ => unreachable!(),
            };
            if if sys {
                nm == "sol_log_"
            } else {
                is_log_name(&nm)
            } {
                sc.logs = true;
            }
            if nm.contains("program_address")
                || nm.contains("invoke_signed")
                || (!sys && nm.starts_with("cpi_"))
            {
                pda = true;
            }
            let clk = if sys {
                nm == "sol_get_clock_sysvar"
            } else {
                nm.to_ascii_lowercase().contains("clock")
            };
            if clk && args.len > 0 {
                clock_args.push(ir.at(args, 0));
            }
        }
    }
    for a in clock_args {
        if let Some(o) = sc.frame_off(a) {
            if !sc.clock_slots.contains(&o) {
                sc.clock_slots.push(o);
            }
        }
    }
    if pda {
        for (bi, b) in f.blocks.iter().enumerate() {
            for (si, s) in b.stmts.iter().enumerate() {
                sc.cur = (bi, si);
                let Stmt::Store {
                    size: 1, addr, v, ..
                } = s
                else {
                    continue;
                };
                let o = sc.frame_off(*addr);
                let l = sc.load_loc(*v, Some(1));
                if let (Some(o), Some(l)) = (o, l) {
                    sc.byte_copies.insert(crate::util::K::of(o), l);
                }
            }
        }
    }
    let fnm = sc.fnm.clone();
    // tags and flags
    let mut uses: IndexMap<u32, Use> = IndexMap::default();
    let mut var_field: HashMap<u32, Loc> = HashMap::default();
    let defs: Vec<(u32, Option<E>)> = sc.defs.iter().map(|(k, v)| (*k, *v)).collect();
    for (v, d) in defs {
        let Some(d) = d else { continue };
        let ld = match ir.get(d) {
            Node::Ext { a, .. } => a,
            _ => d,
        };
        let Node::Load { size, addr } = ir.get(ld) else {
            continue;
        };
        if let Some(l) = sc.loc(addr) {
            if let Some(fd) = &l.field {
                if l.rest == 0.0 && fd.t == FT::Scalar(size) && generated(&fd.name) {
                    var_field.insert(v, l);
                }
            }
        }
    }
    let use_of = |uses: &mut IndexMap<u32, Use>, l: &Loc| -> u32 {
        let id = l.field.as_ref().unwrap().id;
        uses.entry(id).or_insert_with(|| Use {
            l: Some(l.clone()),
            ..Default::default()
        });
        id
    };
    fn on_node(sc: &mut Scan, vt: &mut Votes, x: E, fnm: &str) {
        let ir = sc.ir;
        match ir.get(x) {
            Node::Fn(n, args) if ir.with_name(n, |s| s == "memeq") && args.len == 3 => {
                let nn = sc.val(ir.at(args, 2), 3);
                if ir.get(nn) == Node::Const(32) {
                    let cur = sc.cur;
                    let a = sc.key_of(ir.at(args, 0), cur, 0);
                    let b = sc.key_of(ir.at(args, 1), cur, 0);
                    let m = sc.msg_for(x);
                    sc.key_compare(vt, a, b, m);
                }
            }
            Node::Fn(n, args)
                if ir.with_name(n, |s| s == "keyeq")
                    && args.len == 5
                    && ir
                        .items(args)
                        .skip(1)
                        .all(|a| matches!(ir.get(a), Node::Const(_))) =>
            {
                let mut bytes = [0u8; 32];
                for (i, a) in ir.items(args).skip(1).enumerate() {
                    let Node::Const(v) = ir.get(a) else {
                        unreachable!()
                    };
                    bytes[i * 8..i * 8 + 8].copy_from_slice(&v.to_le_bytes());
                }
                let nm = known_key(&b58(&bytes));
                let cur = sc.cur;
                let k = sc.key_of(ir.at(args, 0), cur, 0);
                if let (Some(nm), Some(Key::Field(..))) = (nm, &k) {
                    if nm != "SYSTEM_PROGRAM" {
                        let m = sc.msg_for(x);
                        sc.key_compare(vt, k.clone(), Some(Key::Const(nm.to_lowercase())), m);
                    }
                }
            }
            Node::Cmp(op, a, b) if op != CmpOp::Set => {
                let m = sc.msg_for(x);
                let sub = m.as_ref().and_then(|m| msg_subject(m, true));
                for (p, q) in [(a, b), (b, a)] {
                    let ck = sc.has_clock(q);
                    if ck.is_none() && sub.is_none() {
                        continue;
                    }
                    let Some(l) = sc.load_loc(p, None) else {
                        continue;
                    };
                    let FT::Scalar(sz) = l.field.as_ref().unwrap().t else {
                        continue;
                    };
                    if ck.is_some() && sz == 8 {
                        let ck = ck.unwrap();
                        vt.vote(
                            sc.views,
                            Some(&l),
                            if ck == "ts" { "deadline" } else { "slot" },
                            4,
                            format!(
                                "compared with Clock.{} in {fnm}",
                                if ck == "ts" { "unix_timestamp" } else { "slot" }
                            ),
                        );
                    } else if let Some(sub) = &sub {
                        if sc.load_loc(q, None).is_none() {
                            vt.vote(
                                sc.views,
                                Some(&l),
                                sub,
                                2,
                                format!(
                                    "compared; \"{}\" on failure in {fnm}",
                                    m.as_ref().unwrap()
                                ),
                            );
                        }
                    }
                }
            }
            Node::Bin(BinOp::Sub, a, b) if sc.has_clock(a).is_some() => {
                if let Some(l) = sc.load_loc(b, Some(8)) {
                    if matches!(l.field.as_ref().unwrap().t, FT::Scalar(_)) {
                        let ts = sc.has_clock(a) == Some("ts");
                        vt.vote(
                            sc.views,
                            Some(&l),
                            if ts { "start_ts" } else { "start_slot" },
                            4,
                            format!(
                                "subtracted from Clock.{} in {fnm}",
                                if ts { "unix_timestamp" } else { "slot" }
                            ),
                        );
                    }
                }
            }
            _ => {}
        }
    }
    #[allow(clippy::too_many_arguments)]
    fn visit(
        sc: &mut Scan,
        vt: &mut Votes,
        uses: &mut IndexMap<u32, Use>,
        var_field: &HashMap<u32, Loc>,
        e: E,
        parent: Option<E>,
        fnm: &str,
        use_of: &dyn Fn(&mut IndexMap<u32, Use>, &Loc) -> u32,
    ) {
        on_node(sc, vt, e, fnm);
        let ir = sc.ir;
        let mut l: Option<Loc> = None;
        match ir.get(e) {
            Node::Load { size, addr } => {
                if let Some(x) = sc.loc(addr) {
                    if let Some(fd) = &x.field {
                        if x.rest == 0.0 && fd.t == FT::Scalar(size) && generated(&fd.name) {
                            l = Some(x.clone());
                        }
                    }
                }
            }
            Node::Var(v) => l = var_field.get(&v).cloned(),
            _ => {}
        }
        if let Some(l) = l {
            let id = use_of(uses, &l);
            let cmp_other = match parent.map(|p| ir.get(p)) {
                Some(Node::Cmp(op, a, b)) => Some((op, if a == e { b } else { a })),
                _ => None,
            };
            match cmp_other {
                Some((op, other))
                    if (op == CmpOp::Eq || op == CmpOp::Ne)
                        && matches!(ir.get(other), Node::Const(_)) =>
                {
                    let Node::Const(ov) = ir.get(other) else {
                        unreachable!()
                    };
                    uses[&id].cmps.push(ov);
                    if let Some(m) = sc.msg_for(parent.unwrap()) {
                        uses[&id].msgs.push(m);
                    }
                }
                _ => uses[&id].other = true,
            }
        }
        match ir.get(e) {
            Node::Bin(_, a, b) | Node::Cmp(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => {
                visit(sc, vt, uses, var_field, a, Some(e), fnm, use_of);
                visit(sc, vt, uses, var_field, b, Some(e), fnm, use_of);
            }
            Node::Sel(c, a, b) => {
                visit(sc, vt, uses, var_field, c, Some(e), fnm, use_of);
                visit(sc, vt, uses, var_field, a, Some(e), fnm, use_of);
                visit(sc, vt, uses, var_field, b, Some(e), fnm, use_of);
            }
            Node::Load { addr, .. } => visit(sc, vt, uses, var_field, addr, Some(e), fnm, use_of),
            Node::Ext { a, .. }
            | Node::Neg(a)
            | Node::Not(a)
            | Node::Lnot(a)
            | Node::Bswap { a, .. } => visit(sc, vt, uses, var_field, a, Some(e), fnm, use_of),
            Node::Call(_, args) | Node::Fn(_, args) => {
                for x in ir.items(args) {
                    visit(sc, vt, uses, var_field, x, Some(e), fnm, use_of);
                }
            }
            _ => {}
        }
    }
    for (bi, b) in f.blocks.iter().enumerate() {
        for (si, s) in b.stmts.iter().enumerate() {
            sc.cur = (bi, si);
            on_stmt(&mut sc, vt, s, pda, &fnm);
            if let Stmt::Store { .. } | Stmt::Stores { .. } = s {
                let (addr, size, vals): (E, u8, Vec<E>) = match s {
                    Stmt::Store { addr, size, v, .. } => (*addr, *size, vec![*v]),
                    Stmt::Stores {
                        addr, size, vals, ..
                    } => (*addr, *size, ir.to_vec(*vals)),
                    _ => unreachable!(),
                };
                let (aa, ao) = match ir.get(addr) {
                    Node::Bin(BinOp::Add, a, c) if matches!(ir.get(c), Node::Const(_)) => {
                        let Node::Const(c) = ir.get(c) else {
                            unreachable!()
                        };
                        (a, c)
                    }
                    _ => (addr, 0),
                };
                for (i, x) in vals.iter().enumerate() {
                    let at = if i == 0 {
                        addr
                    } else {
                        let c = ir.c(ao.wrapping_add((i * size as usize) as u64));
                        ir.bin(BinOp::Add, aa, c)
                    };
                    let l = sc.loc(at);
                    if let Some(l) = l {
                        if let Some(fd) = &l.field {
                            if l.rest == 0.0 && fd.t == FT::Scalar(size) && generated(&fd.name) {
                                let id = use_of(&mut uses, &l);
                                let c = sc.val(*x, 3);
                                match ir.get(c) {
                                    Node::Const(v) => uses[&id].stores.push(v),
                                    _ => uses[&id].non_const = true,
                                }
                            }
                        }
                    }
                }
            }
            if let Stmt::Set { dst, e, .. } = s {
                if *dst >= 0 && var_field.contains_key(&(*dst as u32)) {
                    let ld = match ir.get(*e) {
                        Node::Ext { a, .. } => a,
                        _ => *e,
                    };
                    if let Node::Load { addr, .. } = ir.get(ld) {
                        visit(
                            &mut sc,
                            vt,
                            &mut uses,
                            &var_field,
                            addr,
                            Some(ld),
                            &fnm,
                            &use_of,
                        );
                    }
                    continue;
                }
            }
            for e in stmt_exprs(ir, s) {
                visit(&mut sc, vt, &mut uses, &var_field, e, None, &fnm, &use_of);
            }
        }
        sc.cur = (bi, b.stmts.len());
        match &b.term {
            Term::Br { c, .. } => {
                let l = match ir.get(*c) {
                    Node::Var(v) => var_field.get(&v).cloned(),
                    _ => None,
                };
                if let Some(l) = l {
                    let id = use_of(&mut uses, &l);
                    uses[&id].cmps.push(0);
                } else {
                    visit(&mut sc, vt, &mut uses, &var_field, *c, None, &fnm, &use_of);
                }
            }
            Term::Ret { e: Some(e) } => {
                visit(&mut sc, vt, &mut uses, &var_field, *e, None, &fnm, &use_of)
            }
            _ => {}
        }
    }
    for u in uses.values() {
        if u.non_const || u.other {
            continue;
        }
        let l = u.l.as_ref().unwrap();
        let fd = l.field.as_ref().unwrap();
        let all: Vec<u64> = u.stores.iter().chain(u.cmps.iter()).copied().collect();
        let boolish = all.iter().all(|&x| x == 0 || x == 1);
        let init = |m: &String| {
            let x = m.to_ascii_lowercase();
            x.contains("initialised") || x.contains("initialized")
        };
        let init_msg = u.msgs.iter().any(init);
        if fd.t == FT::Scalar(1)
            && boolish
            && !u.cmps.is_empty()
            && (init_msg || (u.stores.contains(&1) && u.cmps.contains(&0)))
        {
            vt.vote(
                views,
                Some(l),
                "is_initialized",
                4,
                format!(
                    "a flag tested against 0{}{} in {fnm}",
                    if u.stores.contains(&1) {
                        " and set to 1"
                    } else {
                        ""
                    },
                    if init_msg {
                        format!(" (\"{}\")", u.msgs.iter().find(|m| init(m)).unwrap())
                    } else {
                        String::new()
                    }
                ),
            );
        } else if fd.off == 0.0
            && l.off == 0.0
            && (u.cmps.iter().any(|&x| x != 0)
                || (!u.stores.is_empty() && u.cmps.is_empty() && u.stores.iter().any(|&x| x != 0)))
            && matches!(fd.t, FT::Scalar(_))
        {
            vt.vote(
                views,
                Some(l),
                "kind",
                8,
                format!("offset 0, only written and compared constants (a variant tag) in {fnm}"),
            );
        }
    }
}

fn on_stmt(sc: &mut Scan, vt: &mut Votes, s: &Stmt, pda: bool, fnm: &str) {
    let ir = sc.ir;
    if pda {
        let vals: Option<Vec<E>> = match s {
            Stmt::Store { size: 8, v, .. } => Some(vec![*v]),
            Stmt::Stores { size: 8, vals, .. } => Some(ir.to_vec(*vals)),
            _ => None,
        };
        if let Some(vals) = vals {
            for i in 0..vals.len() {
                let x = vals[i];
                let len = if i + 1 < vals.len() {
                    Some(sc.val(vals[i + 1], 3))
                } else {
                    None
                };
                let lv = match len.map(|l| ir.get(l)) {
                    Some(Node::Const(v)) if v != 0 && v <= 32 => v,
                    _ => continue,
                };
                let fo = sc.frame_off(x);
                let l = match fo {
                    Some(fo) => {
                        if lv == 1 {
                            sc.byte_copies.get(&crate::util::K::of(fo)).cloned()
                        } else {
                            None
                        }
                    }
                    None => {
                        let vx = sc.val(x, 3);
                        sc.loc(vx)
                    }
                };
                let Some(l) = l else { continue };
                if l.field.is_some() && l.rest != 0.0 {
                    continue;
                }
                let why = format!("given as a PDA seed ({lv} bytes) in {fnm}");
                if lv == 1 {
                    if l.field.as_ref().is_some_and(|f| f.t == FT::Scalar(1)) {
                        vt.vote(
                            sc.views,
                            Some(&l),
                            "bump",
                            3,
                            format!("given as a 1-byte PDA seed in {fnm}"),
                        );
                    }
                } else if l.field.is_none() {
                    if lv == 32 {
                        vt.vote(
                            sc.views,
                            Some(&Loc {
                                key: true,
                                ..l.clone()
                            }),
                            "seed",
                            5,
                            why,
                        );
                    }
                } else if matches!(l.field.as_ref().unwrap().t, FT::Scalar(sz) if sz as u64 == lv) {
                    vt.vote(sc.views, Some(&l), "seed", 5, why);
                } else if lv == 32 && matches!(l.field.as_ref().unwrap().t, FT::Scalar(_)) {
                    let ws: Vec<Option<Loc>> = [0.0, 8.0, 16.0, 24.0]
                        .iter()
                        .map(|d| sc.loc_in(&l.view, l.off + d))
                        .collect();
                    if ws.iter().all(|w| {
                        w.as_ref().is_some_and(|w| {
                            w.rest == 0.0 && w.field.as_ref().is_some_and(|f| f.t == FT::Scalar(8))
                        })
                    }) {
                        for (i, w) in ws.iter().enumerate() {
                            vt.vote(
                                sc.views,
                                w.as_ref(),
                                &format!("seed_w{i}"),
                                5,
                                format!("{why} (word {i} of the key)"),
                            );
                        }
                    }
                }
            }
        }
    }
    if let Stmt::Store { addr, size, v, .. } = s {
        let Some(l) = sc.loc(*addr) else { return };
        let Some(fd) = l.field.clone() else { return };
        if l.rest != 0.0 || matches!(fd.t, FT::Embed(_)) {
            return;
        }
        let vv = sc.val(*v, 3);
        let ck = sc.has_clock(*v);
        let src = if matches!(fd.t, FT::Scalar(_)) && generated(&fd.name) {
            sc.load_loc(*v, Some(*size))
        } else {
            None
        };
        if let Some(src) = &src {
            let sf = src.field.as_ref().unwrap();
            if sf.id != fd.id && matches!(sf.t, FT::Scalar(_)) && generated(&sf.name) {
                let (sa, sb) = (vt.shared(sc.views, &l), vt.shared(sc.views, src));
                if !sa && !sb {
                    vt.edges.push((l.clone(), src.clone()));
                }
            }
        }
        if let (Some(ck), FT::Scalar(8)) = (ck, &fd.t) {
            vt.vote(
                sc.views,
                Some(&l),
                if ck == "ts" {
                    "updated_ts"
                } else {
                    "updated_slot"
                },
                4,
                format!(
                    "stored from Clock.{} in {fnm}",
                    if ck == "ts" { "unix_timestamp" } else { "slot" }
                ),
            );
        }
        if let (Node::Bin(op, a, b), FT::Scalar(fs)) = (ir.get(vv), &fd.t) {
            if (op == BinOp::Add || op == BinOp::Sub) && *fs >= 4 {
                let self_ = |e: E| {
                    let d = sc.val(e, 3);
                    matches!(ir.get(d), Node::Load { size: ds, addr: da } if ds == *size && expr_eq(ir, da, *addr))
                };
                let other = if self_(a) {
                    Some(b)
                } else if op == BinOp::Add && self_(b) {
                    Some(a)
                } else {
                    None
                };
                if let Some(other) = other {
                    if sc.has_clock(other).is_none() {
                        let o = sc.val(other, 3);
                        let sign = if op == BinOp::Add { "+" } else { "-" };
                        match ir.get(o) {
                            Node::Const(c) if c == 1 || c == u64::MAX => vt.vote(
                                sc.views,
                                Some(&l),
                                "count",
                                7,
                                format!("updated in place by {sign} 1 in {fnm}"),
                            ),
                            Node::Const(_) => {}
                            _ => vt.vote(
                                sc.views,
                                Some(&l),
                                "balance",
                                6,
                                format!("updated in place by {sign} an amount in {fnm}"),
                            ),
                        }
                    }
                }
            }
        }
    }
    let Some((t, args)) = call_of(ir, s) else {
        return;
    };
    if let CallTarget::Fn { pc } = &t {
        let nm = (sc.cfg.fn_name)(*pc);
        if [
            "cpi_token_transfer",
            "cpi_token_mint_to",
            "cpi_token_burn",
            "cpi_token_approve",
        ]
        .iter()
        .any(|p| nm.starts_with(p))
        {
            for a in ir.items(args) {
                if let Some(l) = sc.load_loc(a, Some(8)) {
                    if matches!(l.field.as_ref().unwrap().t, FT::Scalar(_)) {
                        vt.vote(
                            sc.views,
                            Some(&l),
                            "amount",
                            5,
                            format!("passed to {nm} in {fnm}"),
                        );
                    }
                }
            }
        }
    }
    let is_memcmp = match &t {
        CallTarget::Fn { pc } => (sc.cfg.fn_name)(*pc) == "memcmp",
        CallTarget::Sys { name, .. } => &**name == "sol_memcmp_",
        _ => false,
    };
    if is_memcmp && args.len > 2 {
        let n = sc.val(ir.at(args, 2), 3);
        if ir.get(n) == Node::Const(32) {
            let cur = sc.cur;
            let a = sc.key_of(ir.at(args, 0), cur, 0);
            let b = sc.key_of(ir.at(args, 1), cur, 0);
            let m = match crate::util::dst_of(s) {
                Some(d) => sc.msg_for_var(d, 0),
                None => None,
            };
            sc.key_compare(vt, a, b, m);
        }
    }
}

/// roleNames: `keys_eq` / `require_signer` for small unnamed functions.
pub fn role_names(cfg: &FieldNameCfg) -> IndexMap<i64, (String, String)> {
    let mut out = IndexMap::default();
    for (&pc, f) in &cfg.funcs {
        if !is_fn_hex(&(cfg.fn_name)(pc)) {
            continue;
        }
        let ir = f.ir.as_ref().unwrap();
        let stmts: Vec<&Stmt> = f.blocks.iter().flat_map(|b| b.stmts.iter()).collect();
        if stmts.len() > 24 || f.blocks.len() > 12 {
            continue;
        }
        let params: Vec<u32> = f
            .vars
            .iter()
            .filter(|v| v.param >= 1 && v.param <= 5)
            .map(|v| v.id)
            .collect();
        let types = (cfg.types)(pc);
        let mut exprs: Vec<E> = Vec::new();
        for s in &stmts {
            exprs.extend(stmt_exprs(ir, s));
        }
        for b in &f.blocks {
            match &b.term {
                Term::Br { c, .. } => exprs.push(*c),
                Term::Ret { e: Some(e) } => exprs.push(*e),
                _ => {}
            }
        }
        let mut loads: Vec<E> = Vec::new();
        let mut calls: Vec<E> = Vec::new();
        for &e in &exprs {
            ir.walk(e, &mut |x, n| match n {
                Node::Load { .. } => loads.push(x),
                Node::Call(..) => calls.push(x),
                _ => {}
            });
        }
        let has_call = stmts.iter().any(|s| call_of(ir, s).is_some());
        let has_store = stmts.iter().any(|s| {
            matches!(
                s,
                Stmt::Store { .. } | Stmt::Stores { .. } | Stmt::Copy { .. }
            )
        });
        let pv: HashSet<u32> = params.iter().copied().collect();
        let word_of = |a: E| -> Option<(u32, u64)> {
            match ir.get(a) {
                Node::Var(v) if pv.contains(&v) => Some((v, 0)),
                Node::Bin(BinOp::Add, x, c) => match (ir.get(x), ir.get(c)) {
                    (Node::Var(v), Node::Const(c)) if pv.contains(&v) => Some((v, c)),
                    _ => None,
                },
                _ => None,
            }
        };
        let memeq32 = exprs.iter().any(|&e| {
            let mut r = false;
            ir.walk(e, &mut |_, x| {
                if let Node::Fn(n, args) = x {
                    if ir.with_name(n, |s| s == "memeq")
                        && args.len == 3
                        && ir.get(ir.at(args, 2)) == Node::Const(32)
                        && ir
                            .items(args)
                            .take(2)
                            .all(|a| matches!(ir.get(a), Node::Var(v) if pv.contains(&v)))
                    {
                        r = true;
                    }
                }
            });
            r
        });
        if !has_call
            && !has_store
            && params.len() == 2
            && f.blocks
                .iter()
                .any(|b| matches!(b.term, Term::Ret { e: Some(_) }))
        {
            let mut offs: IndexSet<String> = IndexSet::default();
            for &l in &loads {
                let w = match ir.get(l) {
                    Node::Load { size: 8, addr } => word_of(addr),
                    _ => None,
                };
                offs.insert(match w {
                    Some((v, o)) => format!("{v}:{o}"),
                    None => "x".into(),
                });
            }
            let want: Vec<String> = params
                .iter()
                .flat_map(|p| [0, 8, 16, 24].map(|o| format!("{p}:{o}")))
                .collect();
            if (memeq32 && loads.is_empty())
                || (!offs.contains("x") && offs.len() == 8 && want.iter().all(|k| offs.contains(k)))
            {
                out.insert(
                    pc,
                    (
                        "keys_eq".to_string(),
                        "compares the 32 bytes its two pointer parameters point to (a key comparison)".to_string(),
                    ),
                );
                continue;
            }
        }
        let infos: Vec<u32> = params
            .iter()
            .copied()
            .filter(|v| types.get(v).map(|s| s.as_str()) == Some("AccountInfo"))
            .collect();
        if infos.len() == 1 && f.blocks.iter().any(|b| matches!(b.term, Term::Br { .. })) {
            let iv = infos[0];
            let is_signer = |x: E| matches!(ir.get(x), Node::Load { size: 1, addr } if matches!(ir.get(addr), Node::Bin(BinOp::Add, a, c) if ir.get(a) == Node::Var(iv) && ir.get(c) == Node::Const(0x28)));
            let ok_loads = loads.iter().all(|&x| {
                is_signer(x) || matches!(ir.get(x), Node::Load { size: 8, addr } if ir.get(addr) == Node::Var(iv))
            });
            let is_log_sys = |t: &CallTarget| matches!(t, CallTarget::Sys { name, .. } if name.starts_with("sol_log"));
            let ok_stores = stmts.iter().all(|s| match s {
                Stmt::Set { .. } | Stmt::Eval { .. } => true,
                Stmt::Store { v, .. } => matches!(ir.get(*v), Node::Const(_)),
                Stmt::Stores { vals, .. } => {
                    ir.items(*vals).all(|v| matches!(ir.get(v), Node::Const(_)))
                }
                Stmt::Call { t, .. } => is_log_sys(t),
                _ => false,
            });
            let calls_ok = calls.iter().all(|&c| match ir.get(c) {
                Node::Call(t, _) => is_log_sys(&ir.target(t)),
                _ => false,
            });
            if loads.iter().any(|&x| is_signer(x)) && ok_loads && ok_stores && calls_ok {
                out.insert(
                    pc,
                    (
                        "require_signer".to_string(),
                        "reads the is_signer flag of its AccountInfo parameter and gives an error constant when it is clear".to_string(),
                    ),
                );
            }
        }
    }
    out
}
