//! Decompiler unit tests: syscall hashes, printer + simplifier exactness on random expressions,
//! keyeq / memeq, the rc_* statement idioms, typed views, sBPF v3 call targets, and the sample programs'
//! differential equivalence (readable and raw output).

use sbpf_equiv::emu::{call_target_of, Exc, TestMem};
use sbpf_equiv::evaluate::{Env, Evaluator, RunResult};
use sbpf_equiv::{check_program, Opts};
use sbpf_ir::{BinOp, CallTarget, CmpOp, Ir, Node, Stmt, E};
use sbpf_opt::{eval_bin, eval_bswap, eval_cmp, eval_ext, Fx};
use sbpf_print::print::{print_body, Printer, ProgNames, Sugar};
use sbpf_struct::{statement_idioms, SNode, Tree};
use std::collections::HashMap;
use std::sync::Arc;

const M: u64 = u64::MAX;

struct Rng(u64);
impl Rng {
    fn new(seed: u64) -> Rng {
        Rng(seed.wrapping_add(0x9e37_79b9_7f4a_7c15))
    }
    fn next(&mut self) -> u64 {
        let mut x = self.0;
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        self.0 = x;
        x
    }
}

/// Run function `t` of a source text with the given arguments (calls: `on_call`).
fn run_src(
    src: &str,
    args: &[u64],
    mem: &mut TestMem,
    sys: &HashMap<String, String>,
    on_call: &mut dyn FnMut(&mut TestMem, &str, Vec<u64>) -> Result<u64, Exc>,
) -> Result<RunResult, Exc> {
    let ev = Evaluator::new(src).unwrap_or_else(|e| panic!("{e}\n{src}"));
    let d = ev.decl("t").expect("function t");
    let empty = HashMap::new();
    let empty2 = HashMap::new();
    let mut env = Env {
        mem,
        on_call,
        fp: 0,
        fn_addr: &empty,
        fn_target: &empty2,
        sys_target: sys,
        max_steps: 100,
        str_addr: None,
        arity: None,
        undef_uninit: false,
    };
    ev.run_function(d, args, &mut env)
}

fn no_calls(_: &mut TestMem, _: &str, _: Vec<u64>) -> Result<u64, Exc> {
    Ok(0)
}

#[test]
fn syscall_hashes_match_the_runtime() {
    assert_eq!(sbpf_program::murmur::hash_name("sol_log_"), 0x207559bd);
    assert_eq!(sbpf_program::murmur::hash_name("abort"), 0xb6fc1a11);
}

// ---------- printer / simplifier fuzzing ----------

const BINS: [BinOp; 17] = [
    BinOp::Add,
    BinOp::Sub,
    BinOp::Mul,
    BinOp::Udiv,
    BinOp::Urem,
    BinOp::Sdiv,
    BinOp::Srem,
    BinOp::Sdiv32,
    BinOp::Srem32,
    BinOp::And,
    BinOp::Or,
    BinOp::Xor,
    BinOp::Shl,
    BinOp::Lshr,
    BinOp::Ashr,
    BinOp::Uhmul,
    BinOp::Shmul,
];
const CMPS: [CmpOp; 11] = [
    CmpOp::Eq,
    CmpOp::Ne,
    CmpOp::Ugt,
    CmpOp::Uge,
    CmpOp::Ult,
    CmpOp::Ule,
    CmpOp::Sgt,
    CmpOp::Sge,
    CmpOp::Slt,
    CmpOp::Sle,
    CmpOp::Set,
];
/// the pure intrinsics (INTRINSICS)
const FNS: [&str; 9] = [
    "popcount", "clz", "ctz", "rotl", "min", "max", "smin", "smax", "sat_sub",
];

fn mk_fn(ir: &Ir, name: &str, args: Vec<E>) -> E {
    let n = ir.mk_name(Arc::from(name));
    let l = ir.list(args);
    ir.mk(Node::Fn(n, l))
}

fn rand_expr(ir: &Ir, r: &mut Rng, depth: u32) -> E {
    let k = r.next() % if depth > 3 { 3 } else { 10 };
    let sub = |r: &mut Rng, d: u32| rand_expr(ir, r, d);
    match k {
        0 => {
            let m = r.next() % 4;
            ir.c(match m {
                0 => r.next(),
                1 => r.next() % 16,
                2 => (r.next() % 100).wrapping_neg(),
                _ => r.next() % 0x10000,
            })
        }
        1 | 2 => ir.var((r.next() % 3) as u32),
        3 | 4 => {
            let op = BINS[(r.next() % BINS.len() as u64) as usize];
            let a = sub(r, depth + 1);
            let b = sub(r, depth + 1);
            ir.bin(op, a, b)
        }
        5 => {
            let signed = r.next() % 2 == 0;
            let bits = [8, 16, 32][(r.next() % 3) as usize];
            let a = sub(r, depth + 1);
            ir.ext(signed, bits, a)
        }
        6 => {
            let op = CMPS[(r.next() % CMPS.len() as u64) as usize];
            let a = sub(r, depth + 1);
            let b = sub(r, depth + 1);
            ir.cmp(op, a, b)
        }
        7 => {
            let neg = r.next() % 2 != 0;
            let a = sub(r, depth + 1);
            ir.mk(if neg { Node::Neg(a) } else { Node::Not(a) })
        }
        9 => {
            let m = r.next() % 4;
            if m == 0 {
                let c = sub(r, depth + 1);
                let a = sub(r, depth + 1);
                let b = sub(r, depth + 1);
                return ir.mk(Node::Sel(c, a, b));
            }
            if m == 1 {
                // select shapes the simplifier rewrites (min/max, flags, clz guards)
                let x = sub(r, depth + 2);
                let y = if r.next() % 2 != 0 {
                    sub(r, depth + 2)
                } else {
                    ir.c([0, 1, 64][(r.next() % 3) as usize])
                };
                let d = ir.bin(BinOp::Sub, x, y);
                let sides = [(x, y), (y, x), (d, x), (x, d)];
                let (ca, cb) = sides[(r.next() % 4) as usize];
                let c = ir.cmp(CMPS[(r.next() % CMPS.len() as u64) as usize], ca, cb);
                let arms = [
                    x,
                    y,
                    ir.c(0),
                    ir.c(1),
                    ir.c(64),
                    mk_fn(ir, "clz", vec![x]),
                    mk_fn(ir, "ctz", vec![x]),
                    d,
                ];
                if r.next() % 3 == 0 {
                    return c;
                }
                let a = arms[(r.next() % 8) as usize];
                let b = arms[(r.next() % 8) as usize];
                return ir.mk(Node::Sel(c, a, b));
            }
            let name = FNS[(r.next() % FNS.len() as u64) as usize];
            let args = if matches!(name, "popcount" | "clz" | "ctz") {
                vec![sub(r, depth + 1)]
            } else {
                let a = sub(r, depth + 1);
                vec![a, sub(r, depth + 1)]
            };
            mk_fn(ir, name, args)
        }
        _ => {
            let bits = [16, 32, 64][(r.next() % 3) as usize];
            let a = sub(r, depth + 1);
            ir.mk(Node::Bswap { bits, a })
        }
    }
}

/// reference semantics (independent implementations of the intrinsics); None = trap
fn ref_eval(ir: &Ir, e: E, env: &[u64]) -> Option<u64> {
    let ev = |x: E| ref_eval(ir, x, env);
    Some(match ir.get(e) {
        Node::Const(v) => v,
        Node::Var(id) => env[id as usize],
        Node::Bin(op, a, b) => eval_bin(op, ev(a)?, ev(b)?)?,
        Node::Ext { signed, bits, a } => eval_ext(signed, bits, ev(a)?),
        Node::Cmp(op, a, b) => eval_cmp(op, ev(a)?, ev(b)?) as u64,
        Node::Neg(a) => ev(a)?.wrapping_neg(),
        Node::Not(a) => !ev(a)?,
        Node::Bswap { bits, a } => eval_bswap(bits, ev(a)?),
        Node::Lnot(a) => (ev(a)? == 0) as u64,
        Node::Land(a, b) => (ev(a)? != 0 && ev(b)? != 0) as u64,
        Node::Lor(a, b) => (ev(a)? != 0 || ev(b)? != 0) as u64,
        Node::Sel(c, a, b) => {
            if ev(c)? != 0 {
                ev(a)?
            } else {
                ev(b)?
            }
        }
        Node::Fn(n, l) => {
            let args: Vec<u64> = ir.to_vec(l).into_iter().map(ev).collect::<Option<_>>()?;
            let (x, y) = (args[0], args.get(1).copied().unwrap_or(0));
            match &*ir.name(n) {
                "popcount" => x.count_ones() as u64,
                "clz" => x.leading_zeros() as u64,
                "ctz" => x.trailing_zeros() as u64,
                "rotl" => x.rotate_left((y % 64) as u32),
                "min" => x.min(y),
                "max" => x.max(y),
                "smin" => (x as i64).min(y as i64) as u64,
                "smax" => (x as i64).max(y as i64) as u64,
                "sat_sub" => x.saturating_sub(y),
                other => panic!("unexpected fn {other}"),
            }
        }
        other => panic!("unexpected {other:?}"),
    })
}

fn fn_src(pr: &mut Printer, tree: &Tree, hoisted: &[u32]) -> String {
    let decls = vec![None; tree.stmts.len()];
    let body = print_body(pr, tree, "\t", &decls, hoisted);
    format!(
        "function t(a: u64, b: u64, c: u64): u64 {{\n{}\n}}",
        body.join("\n")
    )
}

fn fuzz(seed: u64) -> usize {
    let mut r = Rng::new(seed);
    let names = ProgNames::default();
    let vars: Vec<Option<String>> = ["a", "b", "c"]
        .iter()
        .map(|s| Some(s.to_string()))
        .collect();
    let mut checked = 0;
    for _ in 0..3000 {
        let mut fx = Fx::new(Ir::new(), None);
        let e = rand_expr(&fx.ir, &mut r, 0);
        let env = [r.next(), r.next() % 64, (r.next() % 7).wrapping_neg()];
        let want = ref_eval(&fx.ir, e, &env);
        let s = fx.simplify_expr(e);
        for variant in [e, s] {
            let tree = Tree {
                body: vec![SNode::Return(Some(variant))],
                ..Default::default()
            };
            let mut pr = Printer::new(&fx.ir, &names, &vars);
            let src = fn_src(&mut pr, &tree, &[]);
            let mut mem = TestMem::new(None, 1, false);
            let res = run_src(&src, &env, &mut mem, &HashMap::new(), &mut no_calls)
                .unwrap_or_else(|x| panic!("{x:?}\n{src}"));
            let got = if res.abort.is_some() { None } else { res.ret };
            assert_eq!(got, want, "expr {:?}\nprinted {src}", fx.ir.get(variant));
            checked += 1;
        }
    }
    checked
}

#[test]
fn printer_and_simplifier_are_exact_on_random_expressions() {
    let mut checked = 0;
    for seed in 1..=2 {
        checked += fuzz(seed);
    }
    assert!(checked > 5000);
}

#[test]
fn keyeq_memeq_print_and_evaluate_as_word_wise_memory_comparisons() {
    let mut r = Rng::new(7);
    let names = ProgNames::default();
    let vars: Vec<Option<String>> = ["a", "b", "c"]
        .iter()
        .map(|s| Some(s.to_string()))
        .collect();
    for i in 0..200u64 {
        // keys with leading zero bytes exercise base58 '1' prefixes
        let words: Vec<u64> = (0..4)
            .map(|k| {
                if k == 0 && i % 4 == 0 {
                    r.next() >> (8 * (1 + (i % 7)))
                } else {
                    r.next()
                }
            })
            .collect();
        let p = 0x3_0000_0000u64 + (r.next() % 0x100) * 8;
        let q = p + 0x1000;
        let flip: i64 = if i % 5 == 4 { -1 } else { (i % 5) as i64 };
        let mut mem = TestMem::new(None, 1, false);
        for (k, &w) in words.iter().enumerate() {
            mem.store(p + 8 * k as u64, 8, w).unwrap();
            mem.store(q + 8 * k as u64, 8, w).unwrap();
        }
        if flip >= 0 {
            let a = q + 8 * flip as u64 + i % 8;
            let v = (mem.load(a, 1) + 1) & 0xff;
            mem.store(a, 1, v).unwrap();
        }
        let want = u64::from(flip < 0);
        let ir = Ir::new();
        let mut kargs = vec![ir.var(1)];
        kargs.extend(words.iter().map(|&v| ir.c(v)));
        let keyeq = mk_fn(&ir, "keyeq", kargs);
        let memeq_args = vec![ir.var(0), ir.var(1), ir.c(32)];
        let memeq = mk_fn(&ir, "memeq", memeq_args);
        for e in [keyeq, memeq] {
            let tree = Tree {
                body: vec![SNode::Return(Some(e))],
                ..Default::default()
            };
            let mut pr = Printer::new(&ir, &names, &vars);
            let src = fn_src(&mut pr, &tree, &[]);
            let res = run_src(&src, &[p, q, 0], &mut mem, &HashMap::new(), &mut no_calls).unwrap();
            assert_eq!(res.ret, Some(want), "{src}");
        }
    }
}

#[test]
fn decompiled_samples_are_equivalent_to_the_bytecode() {
    for f in ["memo", "token", "ata"] {
        let bytes = std::fs::read(format!(
            "{}/../../../samples/{f}.so",
            env!("CARGO_MANIFEST_DIR")
        ))
        .unwrap();
        for sugar in [false, true] {
            let o = Opts {
                trials: 3,
                sugar,
                ..Default::default()
            };
            let r = check_program(&bytes, &o).unwrap();
            assert!(
                r.errors.is_empty(),
                "{f} sugar={sugar}: {:?}",
                &r.errors[..r.errors.len().min(3)]
            );
            assert!(
                r.failures.is_empty(),
                "{f} sugar={sugar}: {:?}",
                &r.failures[..r.failures.len().min(3)]
            );
            assert!(r.funcs > 0);
        }
    }
}

#[test]
fn rc_statement_idioms_keep_loads_stores_abort_and_result() {
    let mut names = ProgNames::default();
    names.sys.insert("abort".into(), "abort".into());
    let vars: Vec<Option<String>> = ["a", "b", "c", "x", "y"]
        .iter()
        .map(|s| Some(s.to_string()))
        .collect();
    // each body built in its own arena; `stmts` of the tree
    type Build = fn(&Ir, &mut Tree) -> Vec<SNode>;
    fn st(t: &mut Tree, s: Stmt) -> SNode {
        SNode::Stmt(t.push(s))
    }
    fn set(ir: &Ir, t: &mut Tree, dst: i32, e: E) -> SNode {
        let _ = ir;
        st(t, Stmt::Set { dst, e, pc: 0 })
    }
    fn store(t: &mut Tree, addr: E, v: E) -> SNode {
        st(
            t,
            Stmt::Store {
                size: 8,
                addr,
                v,
                pc: 0,
            },
        )
    }
    fn abort(ir: &Ir, t: &mut Tree) -> Vec<SNode> {
        let args = ir.list(Vec::new());
        vec![
            st(
                t,
                Stmt::Call {
                    dst: -1,
                    t: CallTarget::Sys {
                        name: Arc::from("abort"),
                        hash: 0,
                    },
                    args,
                    pc: 0,
                    extra: None,
                },
            ),
            SNode::Trap(Arc::from("")),
        ]
    }
    fn inc(ir: &Ir, t: &mut Tree, p: E) -> Vec<SNode> {
        let v = ir.bin(BinOp::Add, ir.var(3), ir.c(1));
        let s = store(t, p, v);
        let c = ir.cmp(CmpOp::Eq, ir.var(3), ir.c(M));
        let then = abort(ir, t);
        vec![
            s,
            SNode::If {
                c,
                then,
                els: vec![],
            },
        ]
    }
    fn a8(ir: &Ir) -> E {
        ir.bin(BinOp::Add, ir.var(0), ir.c(8))
    }
    fn dec(ir: &Ir, t: &mut Tree, p: E) -> Vec<SNode> {
        let v = ir.bin(BinOp::Add, ir.var(3), ir.c(M));
        let s = store(t, p, v);
        let c = ir.cmp(CmpOp::Eq, ir.var(3), ir.c(1));
        let ld = ir.load(8, a8(ir));
        let v2 = ir.bin(BinOp::Add, ld, ir.c(M));
        let inner = store(t, a8(ir), v2);
        vec![
            s,
            SNode::If {
                c,
                then: vec![inner],
                els: vec![],
            },
        ]
    }
    let bodies: Vec<Build> = vec![
        // x = ld64(a); y = b + 1; st64(a, x + 1); if (x == -1) abort(); return y   -> rc_inc(a)
        |ir, t| {
            let mut v = vec![set(ir, t, 3, ir.load(8, ir.var(0)))];
            v.push(set(ir, t, 4, ir.bin(BinOp::Add, ir.var(1), ir.c(1))));
            v.extend(inc(ir, t, ir.var(0)));
            v.push(SNode::Return(Some(ir.var(4))));
            v
        },
        // the count loaded from elsewhere: rc_inc(a, x)
        |ir, t| {
            let mut v = vec![set(ir, t, 3, ir.load(8, ir.var(1)))];
            v.extend(inc(ir, t, ir.var(0)));
            v.push(SNode::Return(Some(ir.load(8, ir.var(0)))));
            v
        },
        // x = ld64(a); st64(a, x - 1); if (x == 1) st64(a + 8, ld64(a + 8) - 1); return ld64(a + 8)  -> rc_dec(a)
        |ir, t| {
            let mut v = vec![set(ir, t, 3, ir.load(8, ir.var(0)))];
            v.extend(dec(ir, t, ir.var(0)));
            v.push(SNode::Return(Some(ir.load(8, a8(ir)))));
            v
        },
        |ir, t| {
            let mut v = vec![set(ir, t, 3, ir.load(8, ir.var(1)))];
            v.extend(dec(ir, t, ir.var(0)));
            v.push(SNode::Return(Some(ir.load(8, a8(ir)))));
            v
        },
        // inverted: st64(a, x + 1); if (x != -1) { …; return } abort()   -> rc_inc(a); …; return
        |ir, t| {
            let mut v = vec![set(ir, t, 3, ir.load(8, ir.var(0)))];
            v.push(inc(ir, t, ir.var(0)).remove(0));
            let s = set(ir, t, 4, ir.bin(BinOp::Add, ir.var(1), ir.c(1)));
            v.push(SNode::If {
                c: ir.cmp(CmpOp::Ne, ir.var(3), ir.c(M)),
                then: vec![s, SNode::Return(Some(ir.var(4)))],
                els: vec![],
            });
            v.extend(abort(ir, t));
            v
        },
        // a pure assignment between the store and the check
        |ir, t| {
            let mut v = vec![set(ir, t, 3, ir.load(8, ir.var(0)))];
            let mut d = dec(ir, t, ir.var(0));
            v.push(d.remove(0));
            v.push(set(ir, t, 4, ir.bin(BinOp::Add, ir.var(1), ir.c(1))));
            v.push(d.remove(0));
            v.push(SNode::Return(Some(ir.bin(
                BinOp::Add,
                ir.var(4),
                ir.load(8, a8(ir)),
            ))));
            v
        },
        // x = ld64(a); st64(a, x - 1); if (x == 1) { st64(b, 7) } else { st64(b, 9) }; return ld64(b)   -> if (rc_release(a)) …
        |ir, t| {
            let mut v = vec![set(ir, t, 3, ir.load(8, ir.var(0)))];
            v.push(dec(ir, t, ir.var(0)).remove(0));
            let s7 = store(t, ir.var(1), ir.c(7));
            let s9 = store(t, ir.var(1), ir.c(9));
            v.push(SNode::If {
                c: ir.cmp(CmpOp::Eq, ir.var(3), ir.c(1)),
                then: vec![s7],
                els: vec![s9],
            });
            v.push(SNode::Return(Some(ir.load(8, ir.var(1)))));
            v
        },
        // the count loaded from elsewhere, a pure assignment in between, negated: if (!rc_release(a, x)) { return y }; return 5
        |ir, t| {
            let mut v = vec![set(ir, t, 3, ir.load(8, ir.var(1)))];
            v.push(dec(ir, t, ir.var(0)).remove(0));
            v.push(set(ir, t, 4, ir.bin(BinOp::Add, ir.var(1), ir.c(1))));
            v.push(SNode::If {
                c: ir.cmp(CmpOp::Ne, ir.var(3), ir.c(1)),
                then: vec![SNode::Return(Some(ir.var(4)))],
                els: vec![],
            });
            v.push(SNode::Return(Some(ir.c(5))));
            v
        },
    ];
    let mut sys = HashMap::new();
    sys.insert("abort".to_string(), "sys:abort".to_string());
    for build in bodies {
        let mut fx = Fx::new(Ir::new(), None);
        let mut tree = Tree::default();
        tree.body = build(&fx.ir, &mut tree);
        let before = {
            let mut pr = Printer::new(&fx.ir, &names, &vars);
            fn_src(&mut pr, &tree, &[3, 4])
        };
        let mut t2 = tree.clone();
        statement_idioms(&mut fx, &mut t2, None);
        let after = {
            let mut pr = Printer::new(&fx.ir, &names, &vars);
            fn_src(&mut pr, &t2, &[3, 4])
        };
        let rc = ["rc_inc(", "rc_dec(", "rc_release("]
            .iter()
            .any(|x| after.contains(x));
        assert!(
            rc && !after.contains("abort")
                && (after.contains("if (rc_release(")
                    || after.contains("if (!rc_release(")
                    || !after.contains("if")),
            "{after}"
        );
        for v in [0, 1, 2, 5, M, M - 1] {
            let run = |text: &str| -> String {
                let mut mem = TestMem::new(None, 1, false);
                mem.store(0x3_0000_0000, 8, v).unwrap();
                mem.store(0x3_0000_0008, 8, 3).unwrap();
                mem.store(0x3_0000_0100, 8, v.wrapping_add(7)).unwrap();
                let mut calls: Vec<String> = Vec::new();
                let mut on_call = |_: &mut TestMem, t: &str, _: Vec<u64>| -> Result<u64, Exc> {
                    calls.push(t.to_string());
                    if t == "sys:abort" {
                        return Err(Exc::Abort("abort".into()));
                    }
                    Ok(0)
                };
                let r = run_src(
                    text,
                    &[0x3_0000_0000, 0x3_0000_0100, 0],
                    &mut mem,
                    &sys,
                    &mut on_call,
                )
                .unwrap();
                let m: Vec<u64> = [0, 8, 0x100]
                    .iter()
                    .map(|o| mem.load(0x3_0000_0000 + o, 8))
                    .collect();
                format!("{:?} {} {:?} {:?}", r.ret, r.abort.is_some(), calls, m)
            };
            assert_eq!(run(&after), run(&before), "{before}\n{after}");
        }
    }
}

/// The view printing of a typed parameter (as the readable printer does for a variable of a view type):
/// `a.path` / `a[k].path` for a load or store of exactly a scalar (or pointer) field.
struct ViewSugar<'v> {
    views: &'v sbpf_read::views::Views,
    ty: String,
}

/// the field an address denotes: its text, the bytes left inside it, what it is
type Fld = (String, f64, sbpf_read::views::FT);

impl ViewSugar<'_> {
    fn field(&self, pr: &Printer, size: u8, addr: E) -> Option<String> {
        use sbpf_read::views::FT;
        let (t, rest, last) = self.resolve(pr, addr)?;
        let fits = match last {
            FT::Scalar(s) => s == size,
            FT::Ref(_) => size == 8,
            _ => false,
        };
        (rest == 0.0 && fits).then_some(t)
    }
    fn resolve(&self, pr: &Printer, addr: E) -> Option<Fld> {
        let (b, off) = match pr.ir.get(addr) {
            Node::Bin(BinOp::Add, a, c) => match pr.ir.get(c) {
                Node::Const(c) => (a, c as f64),
                _ => return None,
            },
            _ => (addr, 0.0),
        };
        if !matches!(pr.ir.get(b), Node::Var(0)) {
            return None;
        }
        let mut t = "a".to_string();
        let mut rel = off;
        if let Some(s) = self
            .views
            .map
            .get(&self.ty)
            .and_then(|v| v.size)
            .filter(|s| *s != 0.0)
        {
            if rel >= s {
                t = format!("a[{}]", (rel / s).floor());
                rel %= s;
            }
        }
        let r = self.views.resolve(&self.ty, rel)?;
        Some((format!("{t}.{}", r.path.join(".")), r.rest, r.last))
    }
}

impl Sugar for ViewSugar<'_> {
    fn expr(&self, pr: &mut Printer, e: E, o: &mut String) -> Option<u8> {
        use sbpf_read::views::FT;
        let with_rest = |t: String, rest: f64| {
            if rest != 0.0 {
                format!("{t} + 0x{:x}", rest as u64)
            } else {
                t
            }
        };
        match pr.ir.get(e) {
            Node::Load { size, addr } => {
                if let Some(t) = self.field(pr, size, addr) {
                    o.push_str(&t);
                    return Some(21);
                }
                // a load inside an embedded field: ldN(address of the field + k)
                let (t, rest, last) = self.resolve(pr, addr)?;
                if !matches!(last, FT::Embed(_)) {
                    return None;
                }
                o.push_str(&format!("ld{}({})", size as u32 * 8, with_rest(t, rest)));
                Some(20)
            }
            Node::Bin(BinOp::Add, _, c) if matches!(pr.ir.get(c), Node::Const(_)) => {
                // an address inside an embedded field
                let (t, rest, last) = self.resolve(pr, e)?;
                if !matches!(last, FT::Embed(_)) {
                    return None;
                }
                let p = if rest != 0.0 { 12 } else { 21 };
                o.push_str(&with_rest(t, rest));
                Some(p)
            }
            _ => None,
        }
    }
    fn has_views(&self) -> bool {
        true
    }
    fn view_lvalue(&self, pr: &mut Printer, size: u8, addr: E) -> Option<String> {
        self.field(pr, size, addr)
    }
}

#[test]
fn typed_views_evaluate_as_the_loads_and_stores_they_replace() {
    let views = sbpf_read::views::Views::new();
    let types = ["AccountInfo", "AccountRecord", "Input"];
    let mut decls: Vec<String> = sbpf_read::views::VIEW_NOTATION
        .iter()
        .map(|s| s.to_string())
        .collect();
    decls.extend(views.render(&types.iter().map(|s| s.to_string()).collect::<Vec<_>>()));
    let decls = decls.join("\n");
    let names = ProgNames::default();
    let vars: Vec<Option<String>> = ["a", "b", "c"]
        .iter()
        .map(|s| Some(s.to_string()))
        .collect();
    let mut r = Rng::new(11);
    let mut viewed = 0;
    for i in 0..400u64 {
        let ty = types[(i % 3) as usize];
        let size = [1u8, 2, 4, 8][(r.next() % 4) as usize];
        let off = r.next() % 0xa0;
        let ir = Ir::new();
        let addr = ir.bin(BinOp::Add, ir.var(0), ir.c(off));
        let load = ir.load(size, addr);
        let mut tree = Tree::default();
        let s = tree.push(Stmt::Store {
            size,
            addr,
            v: ir.var(1),
            pc: 0,
        });
        let sum = ir.bin(BinOp::Add, load, addr);
        tree.body = vec![SNode::Stmt(s), SNode::Return(Some(sum))];
        let sg = ViewSugar {
            views: &views,
            ty: ty.to_string(),
        };
        let mut pr = Printer::new(&ir, &names, &vars).with_sugar(&sg);
        let body = print_body(&mut pr, &tree, "\t", &vec![None; 1], &[]);
        let text = body.join("\n");
        if text
            .lines()
            .last()
            .is_some_and(|l| l.contains("a.") || l.contains("a["))
        {
            viewed += 1;
        }
        let src = format!("{decls}\nfunction t(a: {ty}, b: u64, c: u64): u64 {{\n{text}\n}}");
        let mut mem = TestMem::new(None, i, false);
        let base = 0x3_0000_0000u64 + (r.next() % 0x100) * 8;
        let val = r.next();
        let res = run_src(
            &src,
            &[base, val, 0],
            &mut mem,
            &HashMap::new(),
            &mut no_calls,
        )
        .unwrap_or_else(|e| panic!("{e:?}\n{src}"));
        let mask = if size == 8 {
            M
        } else {
            (1u64 << (size * 8)) - 1
        };
        let want = (val & mask).wrapping_add(base).wrapping_add(off);
        assert_eq!(res.ret, Some(want), "{src}");
    }
    assert!(viewed > 100, "only {viewed} loads printed as views");
}

#[test]
fn sbpf_v3_call_targets() {
    // src 0 is a syscall by hash, src 1 a pc-relative call (regression: svault_v3.so)
    let hash = sbpf_program::murmur::hash_name("sol_log_");
    let ins = |src: u8, imm: i32, opc: u8| sbpf_program::Insn {
        pc: 0,
        opc,
        dst: 0,
        src,
        off: 0,
        imm,
    };
    let insns = vec![
        ins(0, hash as i32, 0x85),
        ins(1, 1, 0x85),
        ins(0, 0, 0x95),
        ins(0, 0, 0x95),
    ];
    assert_eq!(
        call_target_of(3, &insns, None, 0, hash as i32),
        "sys:sol_log_"
    );
    assert_eq!(call_target_of(3, &insns, None, 1, 1), "fn:3");
    assert_eq!(call_target_of(3, &insns, None, 1, 1000), "hash:1000"); // out of range: never a function
}

#[test]
fn the_harness_catches_a_wrong_output() {
    let bytes = std::fs::read(format!(
        "{}/../../../samples/token.so",
        env!("CARGO_MANIFEST_DIR")
    ))
    .unwrap();
    let o = Opts {
        trials: 3,
        ..Default::default()
    };
    let mut d = sbpf_equiv::decompile(&bytes, true, None, o.threads).unwrap();
    d.text = d.text.replace("ld64(", "ld32(");
    let r = sbpf_equiv::check_decompiled(&d, &o);
    assert!(r.errors.is_empty());
    assert!(r.failures.len() > 3, "{} failures", r.failures.len());
}
