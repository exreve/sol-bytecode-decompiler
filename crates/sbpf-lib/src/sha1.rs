//! SHA-1 (`createHash('sha1')`, the fingerprints' hash).

pub fn sha1(data: &[u8]) -> [u8; 20] {
    let mut h: [u32; 5] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
    let bits = (data.len() as u64).wrapping_mul(8);
    let mut w = [0u32; 80];
    let mut block = |chunk: &[u8], h: &mut [u32; 5]| {
        for i in 0..16 {
            w[i] = u32::from_be_bytes([
                chunk[4 * i],
                chunk[4 * i + 1],
                chunk[4 * i + 2],
                chunk[4 * i + 3],
            ]);
        }
        for i in 16..80 {
            w[i] = (w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16]).rotate_left(1);
        }
        let [mut a, mut b, mut c, mut d, mut e] = *h;
        for (i, &wi) in w.iter().enumerate() {
            let (f, k) = match i / 20 {
                0 => ((b & c) | (!b & d), 0x5a827999),
                1 => (b ^ c ^ d, 0x6ed9eba1),
                2 => ((b & c) | (b & d) | (c & d), 0x8f1bbcdc),
                _ => (b ^ c ^ d, 0xca62c1d6),
            };
            let t = a
                .rotate_left(5)
                .wrapping_add(f)
                .wrapping_add(e)
                .wrapping_add(k)
                .wrapping_add(wi);
            e = d;
            d = c;
            c = b.rotate_left(30);
            b = a;
            a = t;
        }
        for (x, y) in h.iter_mut().zip([a, b, c, d, e]) {
            *x = x.wrapping_add(y);
        }
    };
    let full = data.len() / 64 * 64;
    for chunk in data[..full].chunks_exact(64) {
        block(chunk, &mut h);
    }
    let mut tail = Vec::with_capacity(128);
    tail.extend_from_slice(&data[full..]);
    tail.push(0x80);
    while tail.len() % 64 != 56 {
        tail.push(0);
    }
    tail.extend_from_slice(&bits.to_be_bytes());
    for chunk in tail.chunks_exact(64) {
        block(chunk, &mut h);
    }
    let mut out = [0u8; 20];
    for (i, x) in h.iter().enumerate() {
        out[4 * i..4 * i + 4].copy_from_slice(&x.to_be_bytes());
    }
    out
}

/// `createHash('sha1').update(data).digest('hex').slice(0, 16)`
pub fn sha1_16(data: &[u8]) -> String {
    const HEX: &[u8; 16] = b"0123456789abcdef";
    let d = sha1(data);
    let mut s = String::with_capacity(16);
    for b in &d[..8] {
        s.push(HEX[(b >> 4) as usize] as char);
        s.push(HEX[(b & 15) as usize] as char);
    }
    s
}

#[cfg(test)]
mod tests {
    #[test]
    fn vectors() {
        assert_eq!(super::sha1_16(b"abc"), "a9993e364706816a");
        assert_eq!(super::sha1_16(b""), "da39a3ee5e6b4b0d");
        assert_eq!(super::sha1_16(&[b'a'; 1000]), "291e9a6c66994949");
        assert_eq!(super::sha1_16(&[b'a'; 56]), {
            // (two padding blocks)
            "c2db330f6083854c"
        });
    }
}
