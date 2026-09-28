//! Maintenance tools of the decompiler's data: `data/libsigs.json` (sbpf-build-libdb), `data/libnames.json`
//! (sbpf-build-libnames, from sbpf-refbuild's symbolized builds), `data/selectors.json.gz` (sbpf-build-selectors,
//! with sbpf-gh-anchor-names' harvest), and the program fetchers (sbpf-fetch: samples, corpus, compat set).

/// `.so` files of a directory, sorted by name (as `readdirSync`)
pub fn so_files(dir: &str) -> Vec<String> {
    let mut v: Vec<String> = std::fs::read_dir(dir)
        .map(|r| {
            r.filter_map(|e| e.ok()?.file_name().into_string().ok())
                .collect()
        })
        .unwrap_or_default();
    v.retain(|f| f.ends_with(".so"));
    v.sort();
    v
}

/// Rust symbol demangling (legacy `_ZN...E` scheme; other symbols as they are) — enough to recover readable paths
/// such as `alloc::raw_vec::finish_grow` or
/// `<spl_token::state::Account as solana_program::program_pack::Pack>::unpack_from_slice`.
pub fn demangle(sym: &str) -> String {
    let Some(rest) = sym.strip_prefix("_ZN") else {
        return sym.to_string();
    };
    let b = rest.as_bytes();
    let mut i = 0;
    let mut parts: Vec<&str> = vec![];
    while i < b.len() && b[i] != b'E' {
        let mut n = 0usize;
        while i < b.len() && b[i].is_ascii_digit() {
            n = n * 10 + (b[i] - b'0') as usize;
            i += 1;
        }
        if n == 0 {
            break;
        }
        let end = (i + n).min(b.len());
        parts.push(rest.get(i..end).unwrap_or(""));
        i += n;
    }
    if parts.last().is_some_and(|p| {
        p.len() == 17
            && p.starts_with('h')
            && p[1..]
                .bytes()
                .all(|c| c.is_ascii_digit() || (b'a'..=b'f').contains(&c))
    }) {
        parts.pop();
    }
    parts
        .iter()
        .map(|p| unescape(p.strip_prefix("_$").map_or(p, |_| &p[1..])))
        .collect::<Vec<_>>()
        .join("::")
}

fn unescape(s: &str) -> String {
    // `$SP$`-style escapes, then `$u7e$` code points, then `..` → `::`
    let esc = |k: &str| match k {
        "SP" => Some("@"),
        "BP" => Some("*"),
        "RF" => Some("&"),
        "LT" => Some("<"),
        "GT" => Some(">"),
        "LP" => Some("("),
        "RP" => Some(")"),
        "C" => Some(","),
        _ => None,
    };
    let mut out = String::new();
    let mut rest = s;
    while let Some(i) = rest.find('$') {
        out.push_str(&rest[..i]);
        let tail = &rest[i + 1..];
        let k: String = tail
            .chars()
            .take_while(|c| c.is_ascii_uppercase())
            .collect();
        if (1..=2).contains(&k.len()) && tail[k.len()..].starts_with('$') {
            if let Some(r) = esc(&k) {
                out.push_str(r);
            } else {
                out.push_str(&rest[i..i + k.len() + 2]);
            }
            rest = &tail[k.len() + 1..];
        } else {
            out.push('$');
            rest = tail;
        }
    }
    out.push_str(rest);
    let mut o2 = String::new();
    let mut rest = out.as_str();
    while let Some(i) = rest.find("$u") {
        o2.push_str(&rest[..i]);
        let tail = &rest[i + 2..];
        let h: String = tail
            .chars()
            .take_while(|c| c.is_ascii_digit() || ('a'..='f').contains(c))
            .take(6)
            .collect();
        let cp = if (2..=6).contains(&h.len()) && tail[h.len()..].starts_with('$') {
            u32::from_str_radix(&h, 16).ok().and_then(char::from_u32)
        } else {
            None
        };
        match cp {
            Some(c) => {
                o2.push(c);
                rest = &tail[h.len() + 1..];
            }
            None => {
                o2.push_str("$u");
                rest = tail;
            }
        }
    }
    o2.push_str(rest);
    o2.replace("..", "::")
}

/// Anchor names in Rust source: `Context<>` handlers, `#[account]` and `#[event]` structs.
pub struct AnchorNames {
    handler: regex::Regex,
    account: regex::Regex,
    event: regex::Regex,
}

impl Default for AnchorNames {
    fn default() -> Self {
        // JS `\s` and `\w`
        const S: &str = r"[\t\n\x0B\x0C\r \u{a0}\u{1680}\u{2000}-\u{200a}\u{2028}\u{2029}\u{202f}\u{205f}\u{3000}\u{feff}]";
        const W: &str = r"[A-Za-z0-9_]";
        let re = |s: String| regex::Regex::new(&s).unwrap();
        AnchorNames {
            handler: re(format!(
                r"pub fn ({W}+){S}*(?:<[^>]*>)?{S}*\({S}*(?:mut{S}+)?{W}+{S}*:{S}*Context<"
            )),
            account: re(format!(
                r"#\[account(?:\([^)]*\))?\]{S}*(?:#\[[^\]]*\]{S}*)*pub struct ({W}+)"
            )),
            event: re(format!(
                r"#\[event\]{S}*(?:#\[[^\]]*\]{S}*)*pub struct ({W}+)"
            )),
        }
    }
}

impl AnchorNames {
    /// (instruction handlers, account structs, event structs) in source order
    pub fn extract(&self, src: &str) -> [Vec<String>; 3] {
        let all = |r: &regex::Regex| r.captures_iter(src).map(|m| m[1].to_string()).collect();
        [all(&self.handler), all(&self.account), all(&self.event)]
    }
}
