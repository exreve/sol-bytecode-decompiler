//! `src/anchorstate.ts`: in-memory layouts of deserialized Anchor accounts from concrete runs of the
//! account-taking callees of try_accounts (sbpf-exec), and the objects try_accounts builds from them.

use crate::anchor::{name_arg, out_aliases, StrAt};
use crate::idl::{borsh_sample, get, js_string_opt, truthy, IdlInfo, LeafKind, SampleLeaf};
use crate::util::{fo_any, is_memcpy_name, js_hex, stmt_exprs, term_br, to_int32, unb58, K, N};
use crate::views::{fid, Field, View, Views, FT};
use sbpf_ir::fx::{IndexMap, IndexSet};
use sbpf_exec::{
    call_target_name, CallName, Exec, ExecMem, MemObserver, NoHooks, ProgCtx, TaintArg,
};
use sbpf_ir::{BinOp, CallTarget, Ir, Node, Stmt, E};
use sbpf_program::Func;
use sbpf_struct::{SNode, Tree};
use serde_json::Value;
use std::cell::RefCell;
use sbpf_ir::fx::{HashMap, HashSet};
use std::rc::Rc;

/// A (boxed) deserialized account: its account name, the view of the object, the Rust account type.
#[derive(Clone, Debug)]
pub struct AccountObj {
    pub name: String,
    pub view: String,
    pub rust: String,
}

#[derive(Clone, Copy, Debug)]
pub struct InfoAt {
    pub off: N,
    pub embed: bool,
}

#[derive(Clone, Debug, Default)]
pub struct AccountObjs {
    pub boxes: IndexMap<u32, AccountObj>,
    pub inline: IndexMap<K, AccountObj>,
    pub refs: IndexMap<K, AccountObj>,
    pub infos: IndexMap<K, (String, Option<String>, bool)>,
    /// call pc -> (name, view unless boxed)
    pub calls: IndexMap<i64, (Option<String>, Option<String>)>,
}

/// A located leaf: the sample leaf and its offset in the object.
#[derive(Clone, Debug)]
pub struct Loc {
    pub leaf: SampleLeaf,
    pub mem: N,
}

fn pascal(s: &str) -> String {
    crate::util::pascal_us(s)
}

struct Rng(u32);
impl Rng {
    fn new() -> Self {
        Rng(0x2545f491)
    }
    fn next(&mut self) -> u8 {
        self.0 ^= self.0 << 13;
        self.0 ^= self.0 >> 17;
        self.0 ^= self.0 << 5;
        (self.0 & 0xff) as u8
    }
}

struct Sample {
    bytes: Vec<u8>,
    leaves: Vec<SampleLeaf>,
    disc: Option<u64>,
    owner: String,
}

fn spl_sample(kind: &str) -> Sample {
    let mut rnd = Rng::new();
    let mut bytes: Vec<u8> = Vec::new();
    let mut leaves: Vec<SampleLeaf> = Vec::new();
    let mut put = |bytes: &mut Vec<u8>, n: usize, path: &str, ty: &str, fixed: Option<&[u8]>| {
        leaves.push(SampleLeaf {
            path: path.into(),
            off: bytes.len() as N,
            size: n as N,
            kind: if n == 32 {
                LeafKind::Key
            } else {
                LeafKind::Int
            },
            ty: ty.into(),
            heap: false,
        });
        for i in 0..n {
            bytes.push(match fixed {
                Some(f) => f[i],
                None => rnd.next(),
            });
        }
    };
    let some = |bytes: &mut Vec<u8>| bytes.extend_from_slice(&[1, 0, 0, 0]);
    if kind == "TokenAccount" {
        put(&mut bytes, 32, "mint", "pubkey", None);
        put(&mut bytes, 32, "owner", "pubkey", None);
        put(&mut bytes, 8, "amount", "u64", None);
        some(&mut bytes);
        put(&mut bytes, 32, "delegate", "COption<Pubkey>", None);
        put(&mut bytes, 1, "state", "AccountState", Some(&[1]));
        some(&mut bytes);
        put(&mut bytes, 8, "is_native", "COption<u64>", None);
        put(&mut bytes, 8, "delegated_amount", "u64", None);
        some(&mut bytes);
        put(&mut bytes, 32, "close_authority", "COption<Pubkey>", None);
    } else {
        some(&mut bytes);
        put(&mut bytes, 32, "mint_authority", "COption<Pubkey>", None);
        put(&mut bytes, 8, "supply", "u64", None);
        put(&mut bytes, 1, "decimals", "u8", None);
        put(&mut bytes, 1, "is_initialized", "bool", Some(&[1]));
        some(&mut bytes);
        put(&mut bytes, 32, "freeze_authority", "COption<Pubkey>", None);
    }
    Sample {
        bytes,
        leaves,
        disc: None,
        owner: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA".into(),
    }
}

const OUT: u64 = 0x2_0000_0200;
const SIZE: usize = 0x1000;
const AI: u64 = 0x4_2000_0400;
const BASE: u64 = 0x4_2000_0000;
const K2: u64 = BASE + 0x100;
const DC: u64 = BASE + 0x200;
const LC: u64 = BASE + 0x300;

/// The shared state of the runs of a decompilation (memo tables the TS keeps per program).
pub struct StateCtx<'c> {
    pub ctx: &'c ProgCtx<'c>,
    loader_memo: std::sync::Mutex<HashMap<(i64, u64), Option<N>>>,
    deser_memo: std::sync::Mutex<HashMap<i64, Option<IndexMap<usize, usize>>>>,
}

impl<'c> StateCtx<'c> {
    pub fn new(ctx: &'c ProgCtx<'c>) -> Self {
        StateCtx {
            ctx,
            loader_memo: std::sync::Mutex::new(HashMap::default()),
            deser_memo: std::sync::Mutex::new(HashMap::default()),
        }
    }

    fn run_account_callee(
        &self,
        x: i64,
        data: &[u8],
        owner: &[u8],
        flags: [u8; 3],
        box_at: Option<N>,
        args: Option<[u64; 5]>,
    ) -> Option<Vec<u8>> {
        let mut mem = ExecMem::new(self.ctx, 5);
        let k1 = BASE;
        let lv = BASE + 0x380;
        let sl = BASE + 0x500;
        let db = BASE + 0x1000;
        mem.write(k1, owner, TaintArg::Keep);
        let k2b: Vec<u8> = (0..32).map(|i| 0x40 + i as u8).collect();
        mem.write(K2, &k2b, TaintArg::Keep);
        mem.write(db, data, TaintArg::Keep);
        let st = |mem: &mut ExecMem, a: u64, v: u64| {
            let _ = mem.store(a, 8, v);
        };
        st(&mut mem, DC, 1);
        st(&mut mem, DC + 8, 1);
        st(&mut mem, DC + 0x10, 0);
        st(&mut mem, DC + 0x18, db);
        st(&mut mem, DC + 0x20, data.len() as u64);
        st(&mut mem, LC, 1);
        st(&mut mem, LC + 8, 1);
        st(&mut mem, LC + 0x10, 0);
        st(&mut mem, LC + 0x18, lv);
        st(&mut mem, lv, 1_000_000_000);
        st(&mut mem, AI, K2);
        st(&mut mem, AI + 8, LC);
        st(&mut mem, AI + 0x10, DC);
        st(&mut mem, AI + 0x18, k1);
        st(&mut mem, AI + 0x20, 0);
        mem.write(AI + 0x28, &flags, TaintArg::Keep);
        st(&mut mem, sl, AI);
        st(&mut mem, sl + 8, 1);
        st(&mut mem, BASE + 0x600, AI);
        let mut e = Exec::new(self.ctx, mem, 60_000, false);
        e.no_panic = true;
        let a = args.unwrap_or([OUT, sl, sl, sl, sl]);
        let r = match e.run(&mut NoHooks, x, &a, 0x2_0000_3000, None, &[]) {
            Ok(r) => r,
            Err(m) => crate::util::js_throw(&m),
        };
        if r.abort.is_some() || r.limit || r.stopped {
            return None;
        }
        let mem = &mut e.mem;
        match box_at {
            None => Some(mem.read(OUT, SIZE)),
            Some(b) => {
                let q = mem.read_u(OUT.wrapping_add(b as u64), 8);
                if (0x3_0000_0000..0x4_0000_0000).contains(&q) {
                    Some(mem.read(q, SIZE))
                } else {
                    None
                }
            }
        }
    }

    /// loaderWord: the out word AccountLoader::load gives the data pointer in (from runs).
    pub fn loader_word(&self, x: i64, disc: u64, owner: &[u8], size: N) -> Option<N> {
        if let Some(r) = self.loader_memo.lock().unwrap().get(&(x, disc)) {
            return *r;
        }
        let n = (size + 256.0).max(1024.0).min(262144.0) as usize;
        let data: Vec<u8> = (0..n)
            .map(|i| if i < 8 { (disc >> (8 * i)) as u8 } else { 0 })
            .collect();
        let db = BASE + 0x1000;
        let slot = BASE + 0x600;
        let mut hit = None;
        for how in [0, 1] {
            let b = self.run_account_callee(
                x,
                &data,
                owner,
                [0, 1, 0],
                None,
                Some([OUT, if how == 0 { AI } else { slot }, 0, 0, 0]),
            );
            if let Some(b) = b {
                let mut i = 0;
                while i < 0x40 && hit.is_none() {
                    if u64::from_le_bytes(b[i..i + 8].try_into().unwrap()) == db + 8 {
                        hit = Some(i as N);
                    }
                    i += 8;
                }
            }
            if hit.is_some() {
                break;
            }
        }
        self.loader_memo.lock().unwrap().insert((x, disc), hit);
        hit
    }

    fn locate(&self, x: i64, smp: &Sample) -> Option<Located> {
        if let Some(r) = self.locate_in(x, smp, None) {
            return Some(r);
        }
        let owner = unb58(&smp.owner);
        let out =
            self.run_account_callee(x, &data_of(smp, &smp.bytes), &owner, [0, 1, 0], None, None);
        for w in out.as_deref().map(heap_words).unwrap_or_default() {
            if let Some(mut b) = self.locate_in(x, smp, Some(w)) {
                b.box_at = Some(w);
                return Some(b);
            }
        }
        None
    }

    fn locate_in(&self, x: i64, smp: &Sample, box_at: Option<N>) -> Option<Located> {
        let owner = unb58(&smp.owner);
        let run = |bytes: &[u8]| {
            self.run_account_callee(x, &data_of(smp, bytes), &owner, [0, 1, 0], box_at, None)
        };
        let base = run(&smp.bytes)?;
        let mut at4: HashMap<u32, Vec<usize>> = HashMap::default();
        let mut i = 0;
        while i + 4 <= base.len() {
            let k = u32::from_le_bytes(base[i..i + 4].try_into().unwrap());
            at4.entry(k).or_default().push(i);
            i += 1;
        }
        let find = |b: &[u8]| -> i64 {
            let mut hit: i64 = -1;
            let k = u32::from_le_bytes([b[0], b[1], b[2], b[3]]);
            for &i in at4.get(&k).map_or(&[][..], |x| x.as_slice()) {
                if i + b.len() > base.len() {
                    continue;
                }
                if base[i + 4..i + b.len()] == b[4..] {
                    if hit >= 0 {
                        return -2;
                    }
                    hit = i as i64;
                }
            }
            hit
        };
        let mut at: IndexMap<String, Loc> = IndexMap::default();
        let mut big = 0;
        for l in &smp.leaves {
            if l.heap || l.size < 4.0 {
                continue;
            }
            big += 1;
            let (o, n) = (l.off as usize, l.size as usize);
            let h = find(&smp.bytes[o..(o + n).min(smp.bytes.len())]);
            if h >= 0 {
                at.insert(
                    l.path.clone(),
                    Loc {
                        leaf: l.clone(),
                        mem: h as N,
                    },
                );
            }
        }
        if big > 0 && at.len() * 2 < big {
            return None;
        }
        let mut runs = 0;
        for l in &smp.leaves {
            if l.heap
                || l.size >= 4.0
                || runs >= 24
                || l.ty == "AccountState"
                || (l.ty == "bool" && smp.disc.is_none())
            {
                continue;
            }
            runs += 1;
            let mut b2 = smp.bytes.clone();
            for i in 0..l.size as usize {
                let k = l.off as usize + i;
                b2[k] = if l.kind == LeafKind::Bool {
                    0
                } else {
                    b2[k] ^ 0x5a
                };
            }
            let Some(o2) = run(&b2) else { continue };
            let diff: Vec<usize> = (0..SIZE).filter(|&i| o2[i] != base[i]).collect();
            if !diff.is_empty()
                && diff.len() as N <= l.size
                && ((diff[diff.len() - 1] - diff[0]) as N) < l.size
            {
                at.insert(
                    l.path.clone(),
                    Loc {
                        leaf: l.clone(),
                        mem: diff[0] as N,
                    },
                );
            }
        }
        if at.is_empty() {
            return None;
        }
        Some(Located {
            at,
            info: info_in(&base, SIZE),
            box_at: None,
        })
    }

    fn probe_layout(&self, x: i64, disc: u64, owner: &[u8]) -> Option<Located> {
        for n in [0x400usize, 0x2800] {
            let make = |f: &dyn Fn(usize) -> u8| -> Vec<u8> {
                let mut d: Vec<u8> = (0..8).map(|j| (disc >> (8 * j)) as u8).collect();
                for i in 0..n {
                    d.push(f(i));
                }
                d
            };
            let run = |box_at: Option<N>, f: &dyn Fn(usize) -> u8| {
                self.run_account_callee(x, &make(f), owner, [0, 1, 0], box_at, None)
            };
            let Some(base0) = run(None, &|_| 0) else {
                continue;
            };
            let mut cands: Vec<Option<N>> = vec![None];
            cands.extend(heap_words(&base0).into_iter().map(Some));
            for box_at in cands {
                let map = decode_copies(&|f: &dyn Fn(usize) -> u8| run(box_at, f), n);
                let Some(map) = map.filter(|m| m.len() >= 8) else {
                    continue;
                };
                let base = run(box_at, &|_| 0).unwrap();
                return Some(Located {
                    at: copy_leaves(&map, 8),
                    info: info_in(&base, SIZE),
                    box_at,
                });
            }
        }
        None
    }

    /// probeDeserializer: output bytes a native deserializer x(out, data, len) copies from the data.
    pub fn probe_deserializer(&self, x: i64, lens: &[usize]) -> Option<IndexMap<usize, usize>> {
        if let Some(r) = self.deser_memo.lock().unwrap().get(&x) {
            return r.clone();
        }
        let db = BASE + 0x1000;
        const NN: usize = 0x2800;
        let read = Rc::new(RefCell::new(0usize));
        struct Track {
            read: Rc<RefCell<usize>>,
            db: u64,
            n: usize,
        }
        impl Track {
            fn note(&mut self, a: u64, k: usize) {
                if a >= self.db && a < self.db + self.n as u64 {
                    let r = ((a - self.db) as usize + k).min(self.n);
                    let mut rd = self.read.borrow_mut();
                    *rd = (*rd).max(r);
                }
            }
        }
        impl MemObserver for Track {
            fn load(&mut self, addr: u64, size: u8, _v: u64) {
                self.note(addr, size as usize);
            }
            fn copy(&mut self, addr: u64, b: &[u8]) {
                self.note(addr, b.len());
            }
        }
        let run_n = |n: usize, f: &dyn Fn(usize) -> u8, track: bool| -> Option<Vec<u8>> {
            let mut mem = ExecMem::new(self.ctx, 5);
            let d: Vec<u8> = (0..n).map(f).collect();
            mem.write(db, &d, TaintArg::Keep);
            if track {
                mem.observer = Some(Rc::new(RefCell::new(Track {
                    read: read.clone(),
                    db,
                    n,
                })));
            }
            let mut e = Exec::new(self.ctx, mem, 60_000, false);
            e.no_panic = true;
            let r = match e.run(
                &mut NoHooks,
                x,
                &[OUT, db, n as u64, 0, 0],
                0x2_0000_3000,
                None,
                &[],
            ) {
                Ok(r) => r,
                Err(m) => crate::util::js_throw(&m),
            };
            if r.abort.is_some() || r.limit || r.stopped {
                return None;
            }
            Some(e.mem.read(OUT, SIZE))
        };
        let mut res: Option<IndexMap<usize, usize>> = None;
        if run_n(NN, &|_| 0, true).is_some() {
            let rd = *read.borrow();
            let mut ns: Vec<usize> = Vec::new();
            for n in std::iter::once(rd)
                .chain(lens.iter().copied())
                .chain(std::iter::once(NN))
            {
                if !ns.contains(&n) {
                    ns.push(n);
                }
            }
            for first in [false, true] {
                for &n in &ns {
                    if n < 1 || res.is_some() {
                        continue;
                    }
                    let m = decode_copies(
                        &|f: &dyn Fn(usize) -> u8| {
                            if first {
                                run_n(n, &|i| if i == 0 { 1 } else { f(i) }, false)
                            } else {
                                run_n(n, f, false)
                            }
                        },
                        n,
                    );
                    let m = m.map(|mut m| {
                        if first {
                            m.retain(|_, i| *i != 0);
                        }
                        m
                    });
                    if let Some(m) = m.filter(|m| m.len() >= 4) {
                        res = Some(m);
                    }
                }
            }
        }
        self.deser_memo.lock().unwrap().insert(x, res.clone());
        res
    }
}

pub struct Located {
    pub at: IndexMap<String, Loc>,
    pub info: Option<InfoAt>,
    pub box_at: Option<N>,
}

fn data_of(smp: &Sample, bytes: &[u8]) -> Vec<u8> {
    let mut d: Vec<u8> = match smp.disc {
        Some(disc) => (0..8).map(|i| (disc >> (8 * i)) as u8).collect(),
        None => Vec::new(),
    };
    d.extend_from_slice(bytes);
    d
}

fn heap_words(b: &[u8]) -> Vec<N> {
    let mut out = Vec::new();
    let mut i = 0;
    while i < 0x40 {
        let v = u64::from_le_bytes(b[i..i + 8].try_into().unwrap());
        if (0x3_0000_0000..0x4_0000_0000).contains(&v) {
            out.push(i as N);
        }
        i += 8;
    }
    out
}

fn info_in(b: &[u8], n: usize) -> Option<InfoAt> {
    let word = |i: usize| u64::from_le_bytes(b[i..i + 8].try_into().unwrap());
    let mut i = 0;
    while i + 8 <= n {
        if word(i) == AI {
            return Some(InfoAt {
                off: i as N,
                embed: false,
            });
        }
        i += 8;
    }
    let mut i = 0;
    while i + 0x30 <= n {
        if word(i) == K2 && word(i + 8) == LC && word(i + 0x10) == DC {
            return Some(InfoAt {
                off: i as N,
                embed: true,
            });
        }
        i += 8;
    }
    None
}

/// decodeCopies: output offset -> input index of the output bytes that copy one input byte each.
fn decode_copies(
    run: &dyn Fn(&dyn Fn(usize) -> u8) -> Option<Vec<u8>>,
    n: usize,
) -> Option<IndexMap<usize, usize>> {
    let hash = |i: usize, k: u32| -> u8 {
        (((((i as u32).wrapping_add(1)).wrapping_mul(0x9e3779b1) ^ k.wrapping_mul(0x85ebca6b))
            >> 16)
            & 1) as u8
    };
    let mut bits = 0u32;
    while (1u64 << bits) < n as u64 + 1 {
        bits += 1;
    }
    let base = run(&|_| 0)?;
    let mut rs = Vec::new();
    for b in 0..bits {
        let r = run(&move |i| (((i + 1) >> b) & 1) as u8)?;
        rs.push(r);
    }
    let v1 = run(&|i| hash(i, 1));
    let v2 = run(&|i| hash(i, 2));
    let (v1, v2) = (v1?, v2?);
    let mut map = IndexMap::default();
    for m in 0..base.len() {
        if base[m] != 0 {
            continue;
        }
        let mut k: usize = 0;
        let mut ok = true;
        for b in 0..bits as usize {
            if !ok {
                break;
            }
            let v = rs[b][m];
            if v > 1 {
                ok = false;
            } else {
                k |= (v as usize) << b;
            }
        }
        if !ok || k == 0 || k > n {
            continue;
        }
        if v1[m] == hash(k - 1, 1) && v2[m] == hash(k - 1, 2) {
            map.insert(m, k - 1);
        }
    }
    Some(map)
}

/// copyLeaves: runs of consecutive copied bytes cut at their natural alignment: d0x21_u64.
pub fn copy_leaves(map: &IndexMap<usize, usize>, shift: usize) -> IndexMap<String, Loc> {
    let mut at = IndexMap::default();
    let mut ms: Vec<usize> = map.keys().copied().collect();
    ms.sort();
    let mut q = 0;
    while q < ms.len() {
        let mut e = q + 1;
        while e < ms.len() && ms[e] == ms[e - 1] + 1 && map[&ms[e]] == map[&ms[e - 1]] + 1 {
            e += 1;
        }
        let mut m = ms[q];
        while m < ms[e - 1] + 1 {
            let left = ms[e - 1] + 1 - m;
            let size = [8usize, 4, 2, 1]
                .into_iter()
                .find(|&z| z <= left && m % z == 0)
                .unwrap();
            let d = map[&m] + shift;
            let nm = format!("d0x{:x}_u{}", d, size * 8);
            at.insert(
                nm.clone(),
                Loc {
                    leaf: SampleLeaf {
                        path: nm,
                        off: (d - shift) as N,
                        size: size as N,
                        kind: LeafKind::Int,
                        ty: format!("u{}", size * 8),
                        heap: false,
                    },
                    mem: m as N,
                },
            );
            m += size;
        }
        q = e;
    }
    at
}

/// fields equal as JSON.stringify sees them
fn fields_eq(a: &[Field], b: &[Field]) -> bool {
    a.len() == b.len()
        && a.iter().zip(b).all(|(x, y)| {
            x.name == y.name && x.off == y.off && x.t == y.t && x.doc == y.doc && x.count == y.count
        })
}

/// buildViews: views of a located layout (nested structs flattened, arrays of structs as element views).
fn build_views(
    views: &mut Views,
    top: &str,
    doc: &str,
    at: &IndexMap<String, Loc>,
    info: Option<InfoAt>,
) -> Option<String> {
    #[derive(Default)]
    struct T {
        leaf: Option<Loc>,
        kids: IndexMap<String, T>,
    }
    let taken = |v: &Views, n: &str| v.map.contains_key(n) || v.opaque.contains_key(n);
    let view_name = |v: &Views, n: &str| -> String {
        if !taken(v, n) {
            return n.to_string();
        }
        let own = |x: &str| {
            v.map
                .get(x)
                .is_some_and(|w| w.doc.starts_with("Account<") || w.doc.starts_with("element of"))
        };
        let b = if own(n) {
            n.to_string()
        } else {
            format!("{n}Obj")
        };
        if !taken(v, &b) {
            return b;
        }
        let mut k = 2;
        while taken(v, &format!("{b}_{k}")) {
            k += 1;
        }
        format!("{b}_{k}")
    };
    let mut root = T::default();
    for (path, l) in at {
        // path.split(/\.|(?=\[)/)
        let mut segs: Vec<String> = Vec::new();
        let mut cur = String::new();
        for c in path.chars() {
            if c == '.' {
                segs.push(std::mem::take(&mut cur));
            } else if c == '[' {
                segs.push(std::mem::take(&mut cur));
                cur.push(c);
            } else {
                cur.push(c);
            }
        }
        segs.push(cur);
        let mut t = &mut root;
        for s in segs {
            t = t.kids.entry(s).or_default();
        }
        t.leaf = Some(l.clone());
    }
    fn lo(t: &T) -> N {
        match &t.leaf {
            Some(l) => l.mem,
            None => t.kids.values().map(lo).fold(f64::INFINITY, f64::min),
        }
    }
    fn hi(t: &T) -> N {
        match &t.leaf {
            Some(l) => l.mem + l.leaf.size,
            None => t.kids.values().map(hi).fold(f64::NEG_INFINITY, f64::max),
        }
    }
    fn type_doc(l: &SampleLeaf) -> Option<String> {
        if ["u8", "u16", "u32", "u64", "u128", "pubkey"].contains(&l.ty.as_str()) {
            None
        } else {
            Some(l.ty.clone())
        }
    }
    fn leaf_type(v: &mut Views, l: &SampleLeaf) -> FT {
        if [1.0, 2.0, 4.0, 8.0].contains(&l.size) {
            if l.kind == LeafKind::Key || l.kind == LeafKind::Bytes {
                FT::Embed(v.bytes(l.size))
            } else {
                FT::Scalar(l.size as u8)
            }
        } else if l.size == 16.0 && l.kind == LeafKind::Int {
            FT::Embed(v.u128())
        } else {
            FT::Embed(v.bytes(l.size))
        }
    }
    #[allow(clippy::too_many_arguments)]
    fn fields_of(
        v: &mut Views,
        t: &T,
        base: N,
        prefix: &str,
        type_hint: &str,
        top: &str,
        view_name: &dyn Fn(&Views, &str) -> String,
    ) -> Vec<Field> {
        let mut out = Vec::new();
        for (seg, c) in &t.kids {
            let name = format!("{prefix}{seg}");
            if let (Some(l), true) = (&c.leaf, c.kids.is_empty()) {
                let ft = leaf_type(v, &l.leaf);
                out.push(Field {
                    id: fid(),
                    name,
                    off: l.mem - base,
                    t: ft,
                    doc: type_doc(&l.leaf),
                    count: None,
                });
                continue;
            }
            let is_idx = |k: &str| {
                k.len() > 2
                    && k.starts_with('[')
                    && k.ends_with(']')
                    && k[1..k.len() - 1].bytes().all(|b| b.is_ascii_digit())
            };
            if c.kids.keys().all(|k| is_idx(k)) {
                let els: Vec<&T> = c.kids.values().collect();
                let struct_els = els.iter().all(|e| e.leaf.is_none() && !e.kids.is_empty());
                if struct_els && els.len() > 1 {
                    let stride = lo(els[1]) - lo(els[0]);
                    let ok = stride > 0.0
                        && els
                            .iter()
                            .enumerate()
                            .all(|(i, e)| lo(e) == lo(els[0]) + i as N * stride)
                        && els.iter().all(|e| hi(e) - lo(e) <= stride);
                    if ok {
                        let ev = view_name(v, &format!("{type_hint}{}Elem", pascal(seg)));
                        let eb = lo(els[0]);
                        let fs = fields_of(v, els[0], eb, "", &ev, top, view_name);
                        v.add(View {
                            name: ev.clone(),
                            doc: format!("element of {top}.{name} (in-memory layout)"),
                            size: Some(stride),
                            fields: fs,
                            builtin: false,
                        });
                        out.push(Field {
                            id: fid(),
                            name,
                            off: eb - base,
                            t: FT::Embed(ev),
                            doc: None,
                            count: Some(els.len() as N),
                        });
                        continue;
                    }
                }
                for (i, e) in els.iter().enumerate() {
                    if let (Some(l), true) = (&e.leaf, e.kids.is_empty()) {
                        let ft = leaf_type(v, &l.leaf);
                        out.push(Field {
                            id: fid(),
                            name: format!("{name}_{i}"),
                            off: l.mem - base,
                            t: ft,
                            doc: type_doc(&l.leaf),
                            count: None,
                        });
                    } else {
                        out.extend(fields_of(
                            v,
                            e,
                            base,
                            &format!("{name}_{i}_"),
                            type_hint,
                            top,
                            view_name,
                        ));
                    }
                }
                continue;
            }
            out.extend(fields_of(
                v,
                c,
                base,
                &format!("{name}_"),
                type_hint,
                top,
                view_name,
            ));
        }
        out
    }
    let mut fields = fields_of(views, &root, 0.0, "", top, top, &view_name);
    if let Some(info) = info {
        fields.push(if info.embed {
            Field {
                id: fid(),
                name: "info".into(),
                off: info.off,
                t: FT::Embed("AccountInfo".into()),
                doc: Some("AccountInfo (a copy in place)".into()),
                count: None,
            }
        } else {
            Field {
                id: fid(),
                name: "info".into(),
                off: info.off,
                t: FT::Ref("AccountInfo".into()),
                doc: Some("&AccountInfo".into()),
                count: None,
            }
        });
    }
    fields.sort_by(|a, b| a.off.partial_cmp(&b.off).unwrap());
    for v in views.map.values() {
        if v.doc.starts_with("Account<")
            && strip_obj_suffix(&v.name) == top
            && fields_eq(&v.fields, &fields)
        {
            return Some(v.name.clone());
        }
    }
    let name = view_name(views, top);
    let mut end: N = 0.0;
    for f in &fields {
        end = crate::util::jmax(end, f.off + views.width(&f.t) * f.count.unwrap_or(1.0));
    }
    views.add(View {
        name: name.clone(),
        doc: doc.into(),
        fields,
        size: Some((to_int32(end + 7.0) & !7) as N),
        builtin: false,
    });
    Some(name)
}

/// `name.replace(/(Obj)?(_\d+)?$/, '')`
fn strip_obj_suffix(n: &str) -> &str {
    let mut s = n;
    if let Some(i) = s.rfind('_') {
        let t = &s[i + 1..];
        if !t.is_empty() && t.bytes().all(|b| b.is_ascii_digit()) {
            s = &s[..i];
        }
    }
    s.strip_suffix("Obj").unwrap_or(s)
}

/// inlineString: an identifier written with constant stores to consecutive bytes of one base.
pub fn inline_string(ir: &Ir, tree: &Tree, ns: &[SNode]) -> Option<String> {
    let mut bytes: IndexMap<u32, IndexMap<i64, Option<u8>>> = IndexMap::default();
    fn put(
        ir: &Ir,
        bytes: &mut IndexMap<u32, IndexMap<i64, Option<u8>>>,
        base: Option<u32>,
        o: i64,
        size: u8,
        v: E,
    ) {
        let Some(b) = base else { return };
        if !(0..=64).contains(&o) {
            return;
        }
        let m = bytes.entry(b).or_default();
        for i in 0..size as i64 {
            let x = match ir.get(v) {
                Node::Const(c) => Some((c >> (8 * i)) as u8),
                _ => None,
            };
            let k = o + i;
            let nv = if m.contains_key(&k) && m[&k] != x {
                None
            } else {
                x
            };
            m.insert(k, nv);
        }
    }
    fn scan(
        ir: &Ir,
        tree: &Tree,
        xs: &[SNode],
        bytes: &mut IndexMap<u32, IndexMap<i64, Option<u8>>>,
    ) {
        for n in xs {
            match n {
                SNode::Stmt(si) => match tree.stmt(*si) {
                    Stmt::Store { addr, size, v, .. } => {
                        let (base, o) = match ir.get(*addr) {
                            Node::Var(v) => (Some(v), 0),
                            Node::Bin(BinOp::Add, a, c) => match ir.get(c) {
                                Node::Const(c) => (crate::util::var_of(ir, a), c as i64),
                                _ => (crate::util::var_of(ir, a), -1),
                            },
                            _ => (None, -1),
                        };
                        let base = match ir.get(*addr) {
                            Node::Var(_) | Node::Bin(BinOp::Add, ..) => base,
                            _ => None,
                        };
                        put(ir, bytes, base, o, *size, *v);
                    }
                    Stmt::Stores {
                        addr, size, vals, ..
                    } => {
                        let (a, c) = match ir.get(*addr) {
                            Node::Bin(BinOp::Add, a, c) if matches!(ir.get(c), Node::Const(_)) => {
                                let Node::Const(c) = ir.get(c) else {
                                    unreachable!()
                                };
                                (a, c)
                            }
                            _ => (*addr, 0),
                        };
                        for (i, v) in ir.items(*vals).enumerate() {
                            let o = c.wrapping_add((i * *size as usize) as u64) as i64;
                            put(ir, bytes, crate::util::var_of(ir, a), o, *size, v);
                        }
                    }
                    _ => {}
                },
                SNode::If { then, els, .. } => {
                    scan(ir, tree, then, bytes);
                    scan(ir, tree, els, bytes);
                }
                SNode::Block { body, .. } | SNode::Loop { body, .. } => scan(ir, tree, body, bytes),
                _ => {}
            }
        }
    }
    scan(ir, tree, ns, &mut bytes);
    for m in bytes.values() {
        let mut s = String::new();
        let mut i = 0i64;
        while let Some(c) = m.get(&i) {
            match c {
                None => {
                    s.clear();
                    break;
                }
                Some(c) => s.push(*c as char),
            }
            i += 1;
        }
        let b = s.as_bytes();
        if s.chars().count() >= 3
            && s.chars().count() == m.len()
            && b[0].is_ascii_lowercase()
            && b.iter()
                .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || *c == b'_')
        {
            return Some(s);
        }
    }
    None
}

fn mentions_var(ir: &Ir, tree: &Tree, ns: &[SNode], v: u32) -> bool {
    let e = |x: E| crate::util::uses_var(ir, x, v);
    for n in ns {
        match n {
            SNode::Stmt(si) => {
                if stmt_exprs(ir, tree.stmt(*si)).into_iter().any(e) {
                    return true;
                }
            }
            SNode::If { c, then, els } => {
                if e(*c) || mentions_var(ir, tree, then, v) || mentions_var(ir, tree, els, v) {
                    return true;
                }
            }
            SNode::Block { body, .. } => {
                if mentions_var(ir, tree, body, v) {
                    return true;
                }
            }
            SNode::Loop { c, body, .. } => {
                if c.is_some_and(e) || mentions_var(ir, tree, body, v) {
                    return true;
                }
            }
            SNode::Return(Some(x)) => {
                if e(*x) {
                    return true;
                }
            }
            SNode::Switch { .. } => return true,
            _ => {}
        }
    }
    false
}

/// immediates: 64-bit immediates of a function's code and its callees within `depth` calls.
fn immediates(
    p: &sbpf_program::Program,
    ctx: &ProgCtx,
    pc: i64,
    depth: u32,
    memo: &mut HashMap<(i64, u32), IndexSet<u64>>,
) -> IndexSet<u64> {
    if let Some(r) = memo.get(&(pc, depth)) {
        return r.clone();
    }
    memo.insert((pc, depth), IndexSet::default());
    if !(pc >= 0 && (pc as usize) < p.insns.len()) {
        return IndexSet::default();
    }
    let end = ctx.extent_of(pc);
    let v2 = p.version == 2;
    let mut i = pc;
    while i < end {
        let ins = p.insns[i as usize];
        if ins.opc == 0x18 && !v2 && i + 1 < end {
            let v = ((p.insns[i as usize + 1].imm as u32 as u64) << 32) | ins.imm as u32 as u64;
            memo.get_mut(&(pc, depth)).unwrap().insert(v);
            i += 2;
            continue;
        }
        if v2 && ins.opc == 0xf7 && i > pc {
            let prev = p.insns[i as usize - 1];
            if prev.opc == 0xb4 && prev.dst == ins.dst {
                let v = ((ins.imm as u32 as u64) << 32) | prev.imm as u32 as u64;
                memo.get_mut(&(pc, depth)).unwrap().insert(v);
            }
        }
        if ins.opc == 0x85 && depth > 0 {
            if let CallName::Fn(t) = call_target_name(p, i, ins.imm) {
                let sub = immediates(p, ctx, t, depth - 1, memo);
                let r = memo.get_mut(&(pc, depth)).unwrap();
                for v in sub {
                    r.insert(v);
                }
            }
        }
        i += 1;
    }
    memo[&(pc, depth)].clone()
}

#[derive(Clone, Copy, Debug, PartialEq)]
struct Org {
    obj: usize,
    off: N,
}

/// An undoable map (the frame state around a branch that leaves).
#[derive(Default)]
struct UndoMap {
    m: HashMap<K, Org>,
    log: Vec<(K, Option<Org>)>,
}
impl UndoMap {
    fn get(&self, k: N) -> Option<Org> {
        self.m.get(&K::of(k)).copied()
    }
    fn set(&mut self, k: N, v: Org) {
        let k = K::of(k);
        self.log.push((k, self.m.get(&k).copied()));
        self.m.insert(k, v);
    }
    fn delete(&mut self, k: K) {
        if let Some(v) = self.m.remove(&k) {
            self.log.push((k, Some(v)));
        }
    }
    fn mark(&self) -> usize {
        self.log.len()
    }
    fn undo(&mut self, m: usize) {
        while self.log.len() > m {
            let (k, v) = self.log.pop().unwrap();
            match v {
                Some(v) => {
                    self.m.insert(k, v);
                }
                None => {
                    self.m.remove(&k);
                }
            }
        }
    }
}

#[derive(Clone, Debug, Default)]
struct Obj {
    ty: Option<String>,
    view: Option<String>,
    name: Option<String>,
    embed: bool,
    boxed: bool,
}

/// accountObjects: per try_accounts function, the boxed / in-place / referenced deserialized accounts.
#[allow(clippy::too_many_arguments)]
pub fn account_objects(
    st: &StateCtx,
    p: &sbpf_program::Program,
    fnames: &dyn Fn(i64) -> Option<String>,
    idl: Option<&IdlInfo>,
    idl_address: Option<&str>,
    views: &mut Views,
    fns: &[(i64, &Func, &Tree)],
    name_fn: i64,
    str_at: StrAt,
    named: Option<(&IndexMap<u64, String>, &str)>,
) -> IndexMap<i64, AccountObjs> {
    let ctx = st.ctx;
    let mut res = IndexMap::default();
    let mut discs: IndexMap<u64, String> = IndexMap::default();
    if idl_address.is_some_and(|a| !a.is_empty()) {
        for (name, d) in &idl.unwrap().accounts {
            discs.insert(*d, name.clone());
        }
    }
    let named_disc = |v: u64, discs: &IndexMap<u64, String>| -> Option<String> {
        let t = named.and_then(|(d, _)| d.get(&v))?;
        if !discs.contains_key(&v) {
            Some(format!("disc:{t}"))
        } else {
            None
        }
    };
    let mut memo: HashMap<(i64, u32), IndexSet<u64>> = HashMap::default();
    let mut type_of: HashMap<i64, Option<String>> = HashMap::default();
    let mut view_of: HashMap<(i64, String), Option<String>> = HashMap::default();
    let mut box_at_of: HashMap<(i64, String), N> = HashMap::default();
    let mut spl_memo: HashMap<(i64, u32), IndexSet<String>> = HashMap::default();
    fn spl_of(
        p: &sbpf_program::Program,
        ctx: &ProgCtx,
        fnames: &dyn Fn(i64) -> Option<String>,
        pc: i64,
        depth: u32,
        memo: &mut HashMap<(i64, u32), IndexSet<String>>,
    ) -> IndexSet<String> {
        if let Some(r) = memo.get(&(pc, depth)) {
            return r.clone();
        }
        memo.insert((pc, depth), IndexSet::default());
        let nm = fnames(pc).unwrap_or_default();
        if let Some(k) = spl_kind(&nm) {
            memo.get_mut(&(pc, depth)).unwrap().insert(k.into());
            return memo[&(pc, depth)].clone();
        }
        if depth == 0 || !(pc >= 0 && (pc as usize) < p.insns.len()) {
            return memo[&(pc, depth)].clone();
        }
        let end = ctx.extent_of(pc);
        let mut i = pc;
        while i < end {
            if p.insns[i as usize].opc == 0x85 {
                if let CallName::Fn(t) = call_target_name(p, i, p.insns[i as usize].imm) {
                    let sub = spl_of(p, ctx, fnames, t, depth - 1, memo);
                    let r = memo.get_mut(&(pc, depth)).unwrap();
                    for x in sub {
                        r.insert(x);
                    }
                }
            }
            i += 1;
        }
        memo[&(pc, depth)].clone()
    }
    let mut disc_at_memo: Option<HashMap<u64, String>> = None;
    let mut info_words: HashMap<i64, Option<InfoAt>> = HashMap::default();
    for &(pc, f, tree) in fns {
        let ir = f.ir.as_ref().unwrap();
        let fp = crate::util::fp_var(f);
        let out_p = crate::util::param_var(f, 1);
        if fp.is_none() || out_p.is_none() {
            continue;
        }
        let mut defs: HashMap<i32, usize> = HashMap::default();
        for b in &f.blocks {
            for s in &b.stmts {
                match s {
                    Stmt::Set { dst, .. } | Stmt::Call { dst, .. } => {
                        *defs.entry(*dst).or_default() += 1
                    }
                    _ => {}
                }
            }
        }
        let Some(aliases) = out_aliases(f) else {
            continue;
        };
        let fo = |e: E| fo_any(ir, e, fp);
        let oo = |e: E| -> Option<N> {
            match ir.get(e) {
                Node::Var(v) if aliases.contains(&v) => Some(0.0),
                Node::Bin(BinOp::Add, a, c) => match (ir.get(a), ir.get(c)) {
                    (Node::Var(v), Node::Const(c)) if aliases.contains(&v) => {
                        Some(crate::util::n_s(c))
                    }
                    _ => None,
                },
                _ => None,
            }
        };
        // spill-like frame words
        let mut own: HashMap<K, bool> = HashMap::default();
        {
            let mut touch = |o: N, n: N, word: bool| {
                let mut w = (to_int32(o) & !7) as N - 8.0;
                while w < o + n {
                    if w + 8.0 > o {
                        let prev = own.get(&K::of(w)).copied().unwrap_or(true);
                        own.insert(K::of(w), prev && word && w == o && n == 8.0);
                    }
                    w += 8.0;
                }
            };
            for b in &f.blocks {
                for s in &b.stmts {
                    for e in stmt_exprs(ir, s) {
                        ir.walk(e, &mut |_, x| {
                            if let Node::Load { size, addr } = x {
                                if let Some(o) = fo(addr) {
                                    touch(o, size as N, true);
                                }
                            }
                        });
                    }
                    match s {
                        Stmt::Store { addr, size, .. } => {
                            if let Some(o) = fo(*addr) {
                                touch(o, *size as N, true);
                            }
                        }
                        Stmt::Stores {
                            addr, size, vals, ..
                        } => {
                            if let Some(o) = fo(*addr) {
                                for i in 0..vals.len {
                                    touch(o + (i as usize * *size as usize) as N, *size as N, true);
                                }
                            }
                        }
                        Stmt::Copy { dst, src, n, .. } => {
                            for e in [*dst, *src] {
                                if let Some(o) = fo(e) {
                                    touch(o, *n as N, false);
                                }
                            }
                        }
                        _ => {}
                    }
                    if let Some((_, args)) = crate::util::call_of(ir, s) {
                        for a in ir.items(args) {
                            if let Some(o) = fo(a) {
                                touch(o, 1.0, false);
                            }
                        }
                    }
                }
                if let Some(c) = term_br(&b.term) {
                    ir.walk(c, &mut |_, x| {
                        if let Node::Load { size, addr } = x {
                            if let Some(o) = fo(addr) {
                                touch(o, size as N, true);
                            }
                        }
                    });
                }
            }
        }
        let accounts_p = crate::util::param_var(f, 3);
        let takes_accounts = |args: &[E]| {
            accounts_p.is_some_and(|ap| {
                !defs.contains_key(&(ap as i32)) && args.iter().any(|&a| ir.get(a) == Node::Var(ap))
            })
        };
        struct S<'a> {
            objs: Vec<Obj>,
            call_obj: IndexMap<i64, usize>,
            org: UndoMap,
            var_org: HashMap<u32, Org>,
            var_log: Vec<(u32, Option<Org>)>,
            out_words: IndexMap<K, Org>,
            box_vars: IndexMap<u32, usize>,
            own: &'a HashMap<K, bool>,
        }
        impl S<'_> {
            fn vset(&mut self, k: u32, v: Org) {
                self.var_log.push((k, self.var_org.get(&k).copied()));
                self.var_org.insert(k, v);
            }
            fn vdel(&mut self, k: u32) {
                if let Some(v) = self.var_org.remove(&k) {
                    self.var_log.push((k, Some(v)));
                }
            }
            fn vundo(&mut self, m: usize) {
                while self.var_log.len() > m {
                    let (k, v) = self.var_log.pop().unwrap();
                    match v {
                        Some(v) => {
                            self.var_org.insert(k, v);
                        }
                        None => {
                            self.var_org.remove(&k);
                        }
                    }
                }
            }
            fn clobber(&mut self, o: N, n: N, keep_own: bool) {
                let ks: Vec<K> = self.org.m.keys().copied().collect();
                for k in ks {
                    let w = k.get();
                    if w + 8.0 > o
                        && w < o + n
                        && !(keep_own && w != o && self.own.get(&k).copied().unwrap_or(false))
                    {
                        self.org.delete(k);
                    }
                }
            }
        }
        let mut s = S {
            objs: Vec::new(),
            call_obj: IndexMap::default(),
            org: UndoMap::default(),
            var_org: HashMap::default(),
            var_log: Vec::new(),
            out_words: IndexMap::default(),
            box_vars: IndexMap::default(),
            own: &own,
        };
        let origin_of = |s: &S, e: E| -> Option<Org> {
            match ir.get(e) {
                Node::Var(v) => s.var_org.get(&v).copied(),
                Node::Load { size: 8, addr } => fo(addr).and_then(|o| s.org.get(o)),
                _ => None,
            }
        };
        let put = |s: &mut S, dst: E, i: N, v: Option<Org>| {
            let (g, k) = (fo(dst), oo(dst));
            if let Some(g) = g {
                s.clobber(g + i, 8.0, false);
                if let Some(v) = v {
                    s.org.set(g + i, v);
                }
            } else if let (Some(k), Some(v)) = (k, v) {
                s.out_words.insert(K::of(k + i), v);
            }
        };
        let copy = |s: &mut S, dst: E, src: E, n: N| {
            let Some(f0) = fo(src) else {
                if let Some(g) = fo(dst) {
                    s.clobber(g, n, false);
                }
                return;
            };
            let nw = (to_int32(n) >> 3).max(0) as usize;
            let words: Vec<Option<Org>> = (0..nw).map(|i| s.org.get(f0 + 8.0 * i as N)).collect();
            let o0 = words.first().copied().flatten();
            if let (Node::Var(dv), Some(o0)) = (ir.get(dst), o0) {
                if o0.off == 0.0 && fo(dst).is_none() && oo(dst).is_none() {
                    if s.objs[o0.obj].view.is_some() {
                        s.box_vars.insert(dv, o0.obj);
                        s.vset(
                            dv,
                            Org {
                                obj: o0.obj,
                                off: -1.0,
                            },
                        );
                    }
                    return;
                }
            }
            if let Some(g) = fo(dst) {
                s.clobber(g, n, false);
            }
            for (i, w) in words.into_iter().enumerate() {
                put(s, dst, 8.0 * i as N, w);
            }
        };
        let is_name_call = |st: &Stmt| -> bool {
            match st {
                Stmt::Call {
                    t: CallTarget::Fn { pc },
                    ..
                } => *pc == name_fn,
                Stmt::Set { e, .. } => match ir.get(*e) {
                    Node::Call(t, _) => ir.target(t) == CallTarget::Fn { pc: name_fn },
                    _ => false,
                },
                _ => false,
            }
        };
        let names_err = |ns: &[SNode]| {
            ns.iter()
                .any(|n| matches!(n, SNode::Stmt(si) if is_name_call(tree.stmt(*si))))
        };
        let exits = |ns: &[SNode]| {
            matches!(
                ns.last(),
                Some(SNode::Return(_) | SNode::Break(_) | SNode::Continue(_) | SNode::Trap(_))
            ) || names_err(ns)
        };
        // the walk (statement order), with its environment passed explicitly
        struct Env<'a, 'b> {
            st: &'a StateCtx<'a>,
            p: &'a sbpf_program::Program,
            fnames: &'a dyn Fn(i64) -> Option<String>,
            idl: Option<&'a IdlInfo>,
            idl_address: Option<&'a str>,
            views: &'b mut Views,
            discs: &'b IndexMap<u64, String>,
            named: Option<(&'a IndexMap<u64, String>, &'a str)>,
            memo: &'b mut HashMap<(i64, u32), IndexSet<u64>>,
            type_of: &'b mut HashMap<i64, Option<String>>,
            view_of: &'b mut HashMap<(i64, String), Option<String>>,
            box_at_of: &'b mut HashMap<(i64, String), N>,
            spl_memo: &'b mut HashMap<(i64, u32), IndexSet<String>>,
            disc_at_memo: &'b mut Option<HashMap<u64, String>>,
            info_words: &'b mut HashMap<i64, Option<InfoAt>>,
        }
        let mut env = Env {
            st,
            p,
            fnames,
            idl,
            idl_address,
            views: &mut *views,
            discs: &discs,
            named,
            memo: &mut memo,
            type_of: &mut type_of,
            view_of: &mut view_of,
            box_at_of: &mut box_at_of,
            spl_memo: &mut spl_memo,
            disc_at_memo: &mut disc_at_memo,
            info_words: &mut info_words,
        };
        let callee_type = |env: &mut Env, x: i64| -> Option<String> {
            if let Some(t) = env.type_of.get(&x) {
                return t.clone();
            }
            let mut hits: IndexSet<String> = IndexSet::default();
            for v in immediates(env.p, env.st.ctx, x, 4, env.memo) {
                let t = env
                    .discs
                    .get(&v)
                    .cloned()
                    .or_else(|| {
                        if env.disc_at_memo.is_none() {
                            let mut m = HashMap::default();
                            for (d, name) in env.discs {
                                let needle = d.to_le_bytes();
                                let img = env.p.image();
                                for &ri in &img.order {
                                    let r = &env.p.elf.regions[ri];
                                    let hay = env.p.elf.region_bytes(r);
                                    let mut from = 0;
                                    while let Some(i) = crate::sem::find(&hay[from..], &needle) {
                                        m.insert(r.vaddr + (from + i) as u64, name.clone());
                                        from += i + 1;
                                        if from > hay.len() {
                                            break;
                                        }
                                    }
                                }
                            }
                            *env.disc_at_memo = Some(m);
                        }
                        env.disc_at_memo.as_ref().unwrap().get(&v).cloned()
                    })
                    .or_else(|| named_disc(v, env.discs));
                if let Some(t) = t {
                    hits.insert(t);
                }
            }
            if hits.is_empty() {
                for t in spl_of(env.p, env.st.ctx, env.fnames, x, 5, env.spl_memo) {
                    hits.insert(t);
                }
            }
            let t = if hits.len() == 1 {
                hits.first().cloned()
            } else {
                None
            };
            env.type_of.insert(x, t.clone());
            t
        };
        let layout = |env: &mut Env, x: i64, t: &str| -> Option<String> {
            let k = (x, t.to_string());
            if let Some(v) = env.view_of.get(&k) {
                return v.clone();
            }
            env.view_of.insert(k.clone(), None);
            let fname = (env.fnames)(x).unwrap_or_else(|| "fn".into());
            let (smp, name, doc);
            if let Some(nm) = t.strip_prefix("disc:") {
                let (nd, owner) = env.named.unwrap();
                let d = nd.iter().find(|(_, u)| u.as_str() == nm).map(|(d, _)| *d);
                let loc = d.and_then(|d| env.st.probe_layout(x, d, &unb58(owner)))?;
                let v = build_views(env.views, nm, &format!("Account<{nm}> as deserialized in memory (no IDL: the type from its discriminator, the fields [heur] from runs of {fname} on bit-pattern data: dN_uS is the bytes at offset N of the account data (discriminator included) of that size, at the offset a run put them; fields after a variable-length one not found; info = the &AccountInfo)"), &loc.at, loc.info);
                env.view_of.insert(k.clone(), v.clone());
                if let Some(b) = loc.box_at {
                    env.box_at_of.insert(k, b);
                }
                return v;
            }
            if let Some(kind) = t.strip_prefix("spl:") {
                smp = spl_sample(kind);
                name = kind.to_string();
                doc = format!("Account<{kind}> (anchor_spl, SPL Token {}) as unpacked in memory (fields [known: spl_token::state layout] at the offsets a run of {fname} put them [offsets from exec]; info = the &AccountInfo)", if kind == "Mint" { "Mint" } else { "Account" });
            } else {
                let idl = env.idl?;
                let def = idl.types.get(t)?;
                let acc = idl.accounts.iter().find(|a| a.0 == t)?;
                if get(def, "kind").and_then(|x| x.as_str()) != Some("struct") {
                    return None;
                }
                let Some(Value::Array(fs)) = get(def, "fields") else {
                    return None;
                };
                let fields: Vec<(String, Value)> = fs
                    .iter()
                    .filter(|f| f.is_object() && truthy(get(f, "name")))
                    .map(|f| {
                        (
                            js_string_opt(get(f, "name")),
                            get(f, "type").cloned().unwrap_or(Value::Null),
                        )
                    })
                    .collect();
                let mut rng = Rng::new();
                let (bytes, leaves) = borsh_sample(&fields, &idl.types, &mut || rng.next())?;
                smp = Sample {
                    bytes,
                    leaves,
                    disc: Some(acc.1),
                    owner: env.idl_address.unwrap_or("").to_string(),
                };
                name = pascal(t);
                doc = format!("Account<{t}> as deserialized in memory (the IDL fields at the offsets a run of {fname} put them [idl names; offsets from exec]; info = the &AccountInfo)");
            }
            let loc = env.st.locate(x, &smp)?;
            let v = build_views(env.views, &name, &doc, &loc.at, loc.info);
            env.view_of.insert(k.clone(), v.clone());
            if let Some(b) = loc.box_at {
                env.box_at_of.insert(k, b);
            }
            v
        };
        let info_word = |env: &mut Env, x: i64, t: Option<&str>| -> Option<InfoAt> {
            if !env.info_words.contains_key(&x) {
                let acc = t
                    .filter(|t| !t.starts_with("spl:"))
                    .and_then(|t| env.idl.and_then(|i| i.accounts.iter().find(|a| a.0 == t)));
                let n = match acc {
                    Some(_) => {
                        let vs = env
                            .views
                            .map
                            .get(&format!("{}Account", pascal(t.unwrap())))
                            .and_then(|v| v.size)
                            .unwrap_or(0.0);
                        // (JS Math.max / min: NaN propagates; a length of NaN is 0)
                        let n = vs + 256.0;
                        if n.is_nan() {
                            0
                        } else {
                            n.max(1024.0).min(262144.0) as usize
                        }
                    }
                    None => 0x400,
                };
                let data: Vec<u8> = (0..n)
                    .map(|i| match acc {
                        Some(a) if i < 8 => (a.1 >> (8 * i)) as u8,
                        Some(_) => 0,
                        None => (i & 0xff) as u8,
                    })
                    .collect();
                let owner: Vec<u8> = match (acc, env.idl_address.filter(|a| !a.is_empty())) {
                    (Some(_), Some(a)) => unb58(a),
                    _ => vec![7; 32],
                };
                let b = env
                    .st
                    .run_account_callee(x, &data, &owner, [1, 1, 0], None, None);
                let r = b.and_then(|b| info_in(&b, 0x40));
                env.info_words.insert(x, r);
            }
            env.info_words[&x]
        };
        let size_of = |env: &Env, v: &str| -> N {
            let view = &env.views.map[v];
            if let Some(s) = view.size.filter(|s| *s != 0.0 && !s.is_nan()) {
                return s;
            }
            let mut n: N = 0.0;
            for f in &view.fields {
                n = crate::util::jmax(n, f.off + env.views.width(&f.t) * f.count.unwrap_or(1.0));
            }
            (to_int32(n + 7.0) & !7) as N
        };
        let mut on_stmt = |s: &mut S, env: &mut Env, st0: &Stmt| {
            // (a call whose result is assigned: its side effects like a call statement's)
            let (is_call, dst, t, args, spc) = match st0 {
                Stmt::Set { dst, e, pc } => match ir.get(*e) {
                    Node::Call(t, args) => (true, *dst, Some(ir.target(t)), ir.to_vec(args), *pc),
                    _ => (false, *dst, None, vec![], *pc),
                },
                Stmt::Call {
                    dst, t, args, pc, ..
                } => (true, *dst, Some(t.clone()), ir.to_vec(*args), *pc),
                _ => (false, -1, None, vec![], 0),
            };
            if !is_call {
                match st0 {
                    Stmt::Set { dst, e, .. } => {
                        let o = origin_of(s, *e);
                        match o {
                            Some(o) => s.vset(*dst as u32, o),
                            None => s.vdel(*dst as u32),
                        }
                        if let Some(o) = o.filter(|o| o.off == -1.0) {
                            s.box_vars.insert(*dst as u32, o.obj);
                        }
                    }
                    Stmt::Store { addr, size, v, .. } => {
                        if *size == 8 {
                            let o = origin_of(s, *v);
                            put(s, *addr, 0.0, o);
                        } else if let Some(g) = fo(*addr) {
                            s.clobber(g, *size as N, false);
                        }
                    }
                    Stmt::Stores {
                        addr, size, vals, ..
                    } => {
                        if *size == 8 {
                            for (i, v) in ir.items(*vals).enumerate() {
                                let o = origin_of(s, v);
                                put(s, *addr, 8.0 * i as N, o);
                            }
                        } else if let Some(g) = fo(*addr) {
                            s.clobber(g, (*size as u32 * vals.len) as N, false);
                        }
                    }
                    Stmt::Copy { dst, src, n, .. } => copy(s, *dst, *src, *n as N),
                    _ => {}
                }
                return;
            }
            let t = t.unwrap();
            if matches!(t, CallTarget::Ind { .. }) {
                return;
            }
            if dst >= 0 {
                s.vdel(dst as u32);
            }
            let tpc = match t {
                CallTarget::Fn { pc } => pc,
                _ => -1,
            };
            if tpc == name_fn {
                let l = ir.list(args.iter().copied());
                let nm = name_arg(ir, l, str_at);
                let upto = args.len().saturating_sub(2);
                for &a in &args[..upto] {
                    let g = fo(a);
                    let o = origin_of(s, a).or_else(|| g.and_then(|g| s.org.get(g)));
                    if let (Some(o), Some(nm)) = (o, &nm) {
                        if s.objs[o.obj].name.is_none() {
                            s.objs[o.obj].name = Some(nm.clone());
                        }
                    }
                }
                return;
            }
            let is_copy = match &t {
                CallTarget::Sys { name, .. } => {
                    &**name == "sol_memcpy_" || &**name == "sol_memmove_"
                }
                _ => is_memcpy_name(&(env.fnames)(tpc).unwrap_or_default()),
            };
            if is_copy && args.len() >= 3 {
                if let Node::Const(n) = ir.get(args[2]) {
                    if n < 0x10000 {
                        copy(s, args[0], args[1], n as N);
                        return;
                    }
                }
            }
            for &a in &args {
                if let Some(g) = fo(a) {
                    s.clobber(g, 256.0, true);
                }
            }
            let out = args.first().and_then(|&a| fo(a));
            if let (Some(out), true) = (out, tpc >= 0) {
                let ty = callee_type(env, tpc);
                let view = ty.as_ref().and_then(|t| layout(env, tpc, t));
                if let (Some(ty), Some(view)) = (&ty, &view) {
                    let id = s.objs.len();
                    s.objs.push(Obj {
                        ty: Some(ty.clone()),
                        view: Some(view.clone()),
                        ..Default::default()
                    });
                    s.call_obj.insert(spc, id);
                    let bx = env.box_at_of.get(&(tpc, ty.clone())).copied();
                    if bx.is_some() {
                        s.objs[id].boxed = true;
                    }
                    if let Some(bx) = bx {
                        s.clobber(out, 64.0, false);
                        s.org.set(out + bx, Org { obj: id, off: -1.0 });
                    } else {
                        let n = size_of(env, view);
                        s.clobber(out, n, false);
                        let mut w = 0.0;
                        while w < n {
                            s.org.set(out + w, Org { obj: id, off: w });
                            w += 8.0;
                        }
                    }
                } else if takes_accounts(&args) {
                    if let Some(w) = info_word(env, tpc, ty.as_deref()) {
                        let id = s.objs.len();
                        s.objs.push(Obj {
                            ty: ty.clone(),
                            embed: w.embed,
                            ..Default::default()
                        });
                        s.call_obj.insert(spc, id);
                        let n = (w.off + 48.0).max(64.0);
                        s.clobber(out, n, false);
                        let mut w2 = 0.0;
                        while w2 < n {
                            s.org.set(
                                out + w2,
                                Org {
                                    obj: id,
                                    off: w2 - w.off,
                                },
                            );
                            w2 += 8.0;
                        }
                    }
                }
            }
        };
        fn walk(
            ns: &[SNode],
            s: &mut S,
            env: &mut Env,
            tree: &Tree,
            ir: &Ir,
            on_stmt: &mut dyn FnMut(&mut S, &mut Env, &Stmt),
            exits: &dyn Fn(&[SNode]) -> bool,
            name_inline: &dyn Fn(&mut S, E, &[SNode]),
        ) {
            for n in ns {
                match n {
                    SNode::Stmt(si) => on_stmt(s, env, tree.stmt(*si)),
                    SNode::If { c, then, els } => {
                        if exits(then) {
                            name_inline(s, *c, then);
                        } else if exits(els) {
                            name_inline(s, *c, els);
                        }
                        if exits(then) {
                            let (o, v) = (s.org.mark(), s.var_log.len());
                            walk(then, s, env, tree, ir, on_stmt, exits, name_inline);
                            s.org.undo(o);
                            s.vundo(v);
                            walk(els, s, env, tree, ir, on_stmt, exits, name_inline);
                        } else if exits(els) {
                            let (o, v) = (s.org.mark(), s.var_log.len());
                            walk(els, s, env, tree, ir, on_stmt, exits, name_inline);
                            s.org.undo(o);
                            s.vundo(v);
                            walk(then, s, env, tree, ir, on_stmt, exits, name_inline);
                        } else {
                            walk(then, s, env, tree, ir, on_stmt, exits, name_inline);
                            walk(els, s, env, tree, ir, on_stmt, exits, name_inline);
                        }
                    }
                    SNode::Block { body, .. } | SNode::Loop { body, .. } => {
                        walk(body, s, env, tree, ir, on_stmt, exits, name_inline)
                    }
                    SNode::Switch { cases, .. } => {
                        for c in cases {
                            walk(&c.1, s, env, tree, ir, on_stmt, exits, name_inline);
                        }
                    }
                    _ => {}
                }
            }
        }
        let name_inline = |s: &mut S, c: E, side: &[SNode]| {
            let mut obj: Option<usize> = None;
            ir.walk(c, &mut |_, x| {
                if let Node::Var(v) = x {
                    if obj.is_none() {
                        obj = s.var_org.get(&v).map(|o| o.obj);
                    }
                }
            });
            let Some(obj) = obj else { return };
            let Some(ap) = accounts_p else { return };
            if s.objs[obj].name.is_some() || mentions_var(ir, tree, side, ap) {
                return;
            }
            if let Some(nm) = inline_string(ir, tree, side) {
                s.objs[obj].name = Some(nm);
            }
        };
        walk(
            &tree.body,
            &mut s,
            &mut env,
            tree,
            ir,
            &mut on_stmt,
            &exits,
            &name_inline,
        );
        // objects in place in the returned struct
        let mut inline: IndexMap<K, AccountObj> = IndexMap::default();
        let mut bases: IndexMap<(usize, K), u32> = IndexMap::default();
        for (k, o) in &s.out_words {
            *bases.entry((o.obj, K::of(k.get() - o.off))).or_default() += 1;
        }
        let mut infos: IndexMap<K, (String, Option<String>, bool)> = IndexMap::default();
        let rust = |t: &str| {
            t.strip_prefix("spl:")
                .or_else(|| t.strip_prefix("disc:"))
                .unwrap_or(t)
                .to_string()
        };
        let acc = |ob: &Obj| AccountObj {
            name: ob.name.clone().unwrap_or_else(|| "undefined".into()),
            view: ob.view.clone().unwrap_or_else(|| "undefined".into()),
            rust: rust(ob.ty.as_deref().unwrap_or("")),
        };
        let mut boxes = IndexMap::default();
        let mut refs = IndexMap::default();
        for (v, id) in &s.box_vars {
            let ob = &s.objs[*id];
            if ob.name.is_some() && ob.ty.is_some() {
                boxes.insert(*v, acc(ob));
            }
        }
        for (k, o) in &s.out_words {
            let ob = &s.objs[o.obj];
            if o.off == -1.0 && ob.name.is_some() && ob.ty.is_some() {
                refs.insert(*k, acc(ob));
            }
        }
        for (&(obj, base), &n) in &bases {
            let ob = &s.objs[obj];
            let b = base.get();
            if ob.name.is_none()
                || b < 0.0
                || b == -1.0
                || s.out_words.get(&base).is_some_and(|o| o.off == -1.0)
            {
                continue;
            }
            if ob.view.is_none() {
                if s.out_words.get(&base).is_some_and(|o| o.off == 0.0) {
                    infos.insert(
                        base,
                        (
                            ob.name.clone().unwrap(),
                            ob.ty.as_deref().map(rust),
                            ob.embed,
                        ),
                    );
                }
                continue;
            }
            if n < 2 || ob.ty.is_none() {
                continue;
            }
            let prev = inline
                .iter()
                .find(|(_, a)| Some(&a.name) == ob.name.as_ref())
                .map(|(k, _)| *k);
            if let Some(pk) = prev {
                let pn = bases.get(&(obj, pk)).copied().unwrap_or(0);
                if pn > n || (pn == n && pk.get() < b) {
                    continue;
                }
                inline.shift_remove(&pk);
            }
            inline.insert(
                base,
                AccountObj {
                    name: ob.name.clone().unwrap(),
                    view: ob.view.clone().unwrap(),
                    rust: rust(ob.ty.as_deref().unwrap()),
                },
            );
        }
        let mut calls = IndexMap::default();
        for (at, id) in &s.call_obj {
            let o = &s.objs[*id];
            calls.insert(
                *at,
                (
                    o.name.clone(),
                    if o.view.is_some() && !o.boxed {
                        o.view.clone()
                    } else {
                        None
                    },
                ),
            );
        }
        if !boxes.is_empty()
            || !inline.is_empty()
            || !infos.is_empty()
            || !refs.is_empty()
            || !calls.is_empty()
        {
            res.insert(
                pc,
                AccountObjs {
                    boxes,
                    inline,
                    refs,
                    infos,
                    calls,
                },
            );
        }
    }
    let _ = js_hex;
    res
}

fn spl_kind(nm: &str) -> Option<&'static str> {
    // /^(Account|Mint)_unpack(_from_slice|_unchecked)?(_[0-9a-f]+)?$/
    let (kind, rest) = if let Some(r) = nm.strip_prefix("Account_unpack") {
        ("spl:TokenAccount", r)
    } else if let Some(r) = nm.strip_prefix("Mint_unpack") {
        ("spl:Mint", r)
    } else {
        return None;
    };
    let rest = rest
        .strip_prefix("_from_slice")
        .or_else(|| rest.strip_prefix("_unchecked"))
        .map_or((rest, true), |r| (r, false));
    let hex_ok = |s: &str| {
        s.is_empty()
            || s.strip_prefix('_').is_some_and(|h| {
                !h.is_empty()
                    && h.bytes()
                        .all(|c| c.is_ascii_digit() || (b'a'..=b'f').contains(&c))
            })
    };
    // (the optional group first: "_from_slice" / "_unchecked" may also be missing)
    if hex_ok(rest.0) {
        return Some(kind);
    }
    if !rest.1 {
        return None;
    }
    None
}
