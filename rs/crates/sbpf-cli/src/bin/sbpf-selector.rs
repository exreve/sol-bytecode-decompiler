//! Anchor discriminator lookup.
//!   sbpf-selector 0xf8c69e91e17587c8     -> name (dataset, then verb x noun vocabulary)
//!   sbpf-selector swap                   -> sha256("global:swap")[..8], account/event forms

fn h8(s: &str) -> String {
    sbpf_print::names::sha256(s.as_bytes())[..8]
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
}

fn pascal(s: &str) -> String {
    s.split(|c: char| c == '_' || c == '-' || c.is_whitespace())
        .filter(|w| !w.is_empty())
        .map(|w| {
            let mut c = w.chars();
            let first = c.next().unwrap();
            first.to_uppercase().collect::<String>() + c.as_str()
        })
        .collect()
}

fn is_hex_selector(a: &str) -> bool {
    let h = a
        .strip_prefix("0x")
        .or_else(|| a.strip_prefix("0X"))
        .unwrap_or(a);
    h.len() == 16 && h.bytes().all(|c| c.is_ascii_hexdigit())
}

fn main() {
    for a in std::env::args().skip(1) {
        if is_hex_selector(&a) {
            // (a `0X` prefix is not stripped: unknown)
            let name = sbpf_read::sem::selector_lookup(&a);
            println!("{a} -> {}", name.as_deref().unwrap_or("unknown"));
        } else {
            println!(
                "{a}: instruction {}  account {}  event {}  (bytes, hex)",
                h8(&format!("global:{a}")),
                h8(&format!("account:{}", pascal(&a))),
                h8(&format!("event:{}", pascal(&a)))
            );
        }
    }
}
