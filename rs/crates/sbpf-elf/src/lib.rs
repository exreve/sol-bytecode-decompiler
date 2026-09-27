//! ELF64 loader for Solana sBPF programs: a faithful port of `src/elf.ts` (itself mirroring agave's
//! `solana-sbpf` loader). Relocations are applied exactly like the runtime does.
//!
//! Parity notes (see docs/RUST_PORT.md):
//! - TS reads u64 header fields through `Number(...)` and does its offset arithmetic in doubles. Those
//!   fields are `f64` here (`Num`) with the same arithmetic, so corrupt headers (values above 2^53)
//!   behave identically. Dumps print them with `JSON.stringify`'s number format.
//! - TS `DataView` reads throw `RangeError` out of bounds (reported as "out of bounds"); typed-array
//!   indexing yields `undefined` silently. Both are reproduced where they matter.
//! - `Uint8Array.subarray` clamps its bounds; regions reproduce that.
//! - Two corners are rejected with an explicit "unsupported" error instead: a call relocation whose
//!   target is not a whole pc, and a VM address that rounds to 2^64 or more.

use indexmap::IndexMap;
pub const MM_RODATA_START: u64 = 0x1_0000_0000;
pub const MM_STACK_START: u64 = 0x2_0000_0000;
pub const MM_HEAP_START: u64 = 0x3_0000_0000;
pub const MM_INPUT_START: u64 = 0x4_0000_0000;

pub const R_BPF_64_64: u32 = 1;
pub const R_BPF_64_RELATIVE: u32 = 8;
pub const R_BPF_64_32: u32 = 10;

pub const OOB: &str = "out of bounds";

/// A JS number holding a u64 header field (`Number(getBigUint64(..))`) or arithmetic on such fields.
pub type Num = f64;

#[derive(Clone, Debug, PartialEq)]
pub struct Section {
    pub name: String,
    pub ty: u32,
    pub flags: Num,
    pub addr: Num,
    pub offset: Num,
    pub size: Num,
    pub link: u32,
    pub entsize: Num,
}

#[derive(Clone, Debug)]
pub struct Symbol {
    pub name: String,
    pub value: Num,
    pub size: Num,
    pub ty: u8,
    pub bind: u8,
    pub shndx: u16,
}

#[derive(Clone, Debug)]
pub struct Reloc {
    pub offset: Num,
    pub ty: u32,
    pub sym: u32,
}

#[derive(Clone, Debug)]
pub enum CallReloc {
    Syscall { name: String },
    Fn { name: String, target_pc: i64 },
}

/// A mapped, read-only region of the VM address space: `bytes[start..end]` of the relocated image.
#[derive(Clone, Debug)]
pub struct Region {
    pub name: String,
    pub vaddr: u64,
    pub start: usize,
    pub end: usize,
    pub exec: bool,
}

#[derive(Clone, Debug)]
pub struct Elf {
    /// SBPF version from e_flags (0..4)
    pub version: u32,
    /// relocated file image
    pub bytes: Vec<u8>,
    pub sections: Vec<Section>,
    /// index of the text section in `sections`
    pub text: usize,
    pub text_vaddr: u64,
    pub entry_pc: i64,
    pub dynsyms: Vec<Symbol>,
    pub symbols: Vec<Symbol>,
    pub relocs: Vec<Reloc>,
    /// pc (a JS number: `f64::to_bits`, may be fractional for a misaligned relocation) -> resolved
    /// symbol for R_BPF_64_32, in insertion order. Look up with [`Elf::call_reloc`].
    pub call_relocs: IndexMap<u64, CallReloc>,
    pub regions: Vec<Region>,
    /// VM addresses of data relocation slots -> pointer stored there (insertion order)
    pub data_pointers: IndexMap<u64, u64>,
}

impl Elf {
    pub fn text(&self) -> &Section {
        &self.sections[self.text]
    }
    pub fn region_bytes(&self, r: &Region) -> &[u8] {
        &self.bytes[r.start..r.end]
    }
    pub fn call_reloc(&self, pc: i64) -> Option<&CallReloc> {
        self.call_relocs.get(&(pc as f64).to_bits())
    }
}

type R<T> = Result<T, String>;

/// `ToInt32(x)` of a non-negative integer-valued double (for `flags & bit`).
pub fn to_int32_bits(x: Num) -> u32 {
    x as u128 as u32
}

/// `BigInt(x)` of a non-negative integer-valued double, as a VM address (u64).
fn big(x: Num) -> R<u128> {
    Ok(x as u128)
}

fn vm(a: u128) -> R<u64> {
    u64::try_from(a).map_err(|_| "unsupported: VM address of 2^64 or more".to_string())
}

/// DataView reads at JS-number offsets (RangeError out of bounds).
struct Rd<'a>(&'a [u8]);
impl Rd<'_> {
    fn get<const N: usize>(&self, o: Num) -> R<[u8; N]> {
        if o + N as f64 > self.0.len() as f64 {
            return Err(OOB.into());
        }
        let o = o as usize;
        Ok(self.0[o..o + N].try_into().unwrap())
    }
    fn u16(&self, o: Num) -> R<u16> {
        self.get::<2>(o).map(u16::from_le_bytes)
    }
    fn u32(&self, o: Num) -> R<u32> {
        self.get::<4>(o).map(u32::from_le_bytes)
    }
    fn u64(&self, o: Num) -> R<u64> {
        self.get::<8>(o).map(u64::from_le_bytes)
    }
    /// `Number(getBigUint64(o))` (round to nearest, ties to even, like `u64 as f64`)
    fn u64n(&self, o: Num) -> R<Num> {
        Ok(self.u64(o)? as f64)
    }
    /// typed-array index: `undefined` (0 once masked) out of bounds
    fn byte(&self, o: Num) -> u8 {
        if o < self.0.len() as f64 {
            self.0[o as usize]
        } else {
            0
        }
    }
}

fn set_u32(b: &mut [u8], o: Num, v: u32) -> R<()> {
    if o + 4.0 > b.len() as f64 {
        return Err(OOB.into());
    }
    let o = o as usize;
    b[o..o + 4].copy_from_slice(&v.to_le_bytes());
    Ok(())
}

/// NUL-terminated string at `off`, decoded like `TextDecoder` (lossy UTF-8, leading BOM dropped).
pub fn cstr(b: &[u8], off: Num) -> String {
    let off = if off < b.len() as f64 {
        off as usize
    } else {
        b.len()
    };
    let e = b[off..]
        .iter()
        .position(|&c| c == 0)
        .map_or(b.len(), |p| off + p);
    let mut s = &b[off..e];
    if s.starts_with(&[0xef, 0xbb, 0xbf]) {
        s = &s[3..];
    }
    String::from_utf8_lossy(s).into_owned()
}

/// `Uint8Array.subarray(begin, end)` bounds (clamped).
fn clamp(len: usize, begin: Num, end: Num) -> (usize, usize) {
    let c = |x: Num| {
        if x <= 0.0 {
            0
        } else if x >= len as f64 {
            len
        } else {
            x as usize
        }
    };
    let (b, e) = (c(begin), c(end));
    (b, e.max(b))
}

fn to_vm(a: u128) -> u128 {
    if a < MM_RODATA_START as u128 {
        a + MM_RODATA_START as u128
    } else {
        a
    }
}

pub fn parse_elf(input: &[u8]) -> R<Elf> {
    let mut bytes = input.to_vec();
    if bytes.len() < 4 || bytes[0..4] != [0x7f, 0x45, 0x4c, 0x46] {
        return Err("not an ELF file".into());
    }
    if bytes.get(4) != Some(&2) || bytes.get(5) != Some(&1) {
        return Err("only ELF64 little-endian is supported".into());
    }
    let len = bytes.len() as f64;
    let rd = Rd(&bytes);
    let eflags = rd.u32(48.0)?;
    let version = if eflags <= 4 {
        eflags
    } else if eflags == 0x20 {
        2
    } else {
        0
    };
    let entry = rd.u64n(24.0)?;
    let phoff = rd.u64n(32.0)?;
    let shoff = rd.u64n(40.0)?;
    let phentsize = rd.u16(54.0)? as f64;
    let phnum = rd.u16(56.0)?;
    let shentsize = rd.u16(58.0)? as f64;
    let shnum = rd.u16(60.0)?;
    let shstrndx = rd.u16(62.0)? as usize;

    let mut sections: Vec<Section> = Vec::new();
    for i in 0..shnum {
        let o = shoff + i as f64 * shentsize;
        if o + 64.0 > len {
            break;
        }
        sections.push(Section {
            name: String::new(),
            ty: rd.u32(o + 4.0)?,
            flags: rd.u64n(o + 8.0)?,
            addr: rd.u64n(o + 16.0)?,
            offset: rd.u64n(o + 24.0)?,
            size: rd.u64n(o + 32.0)?,
            link: rd.u32(o + 40.0)?,
            entsize: rd.u64n(o + 56.0)?,
        });
    }
    if let Some(shstr_off) = sections.get(shstrndx).map(|s| s.offset) {
        for i in 0..sections.len() {
            let n = rd.u32(shoff + i as f64 * shentsize)? as f64;
            sections[i].name = cstr(&bytes, shstr_off + n);
        }
    }

    let read_syms = |sec: Option<&Section>| -> R<Vec<Symbol>> {
        let Some(sec) = sec else { return Ok(vec![]) };
        let str_off = sections.get(sec.link as usize).map(|s| s.offset);
        let mut out = Vec::new();
        let mut o = sec.offset;
        while o + 24.0 <= sec.offset + sec.size {
            let info = rd.byte(o + 4.0);
            let name = match str_off {
                Some(so) => cstr(&bytes, so + rd.u32(o)? as f64),
                None => String::new(),
            };
            out.push(Symbol {
                name,
                value: rd.u64n(o + 8.0)?,
                size: rd.u64n(o + 16.0)?,
                ty: info & 0xf,
                bind: info >> 4,
                shndx: rd.u16(o + 6.0)?,
            });
            o += 24.0;
        }
        Ok(out)
    };
    let dynsyms = read_syms(sections.iter().find(|s| s.ty == 11))?;
    let symbols = read_syms(sections.iter().find(|s| s.ty == 2))?;

    let mut relocs: Vec<Reloc> = Vec::new();
    let push_rel = |relocs: &mut Vec<Reloc>, o: Num| -> R<()> {
        let offset = rd.u64n(o)?;
        let info = rd.u64(o + 8.0)?;
        relocs.push(Reloc {
            offset,
            ty: (info & 0xffff_ffff) as u32,
            sym: (info >> 32) as u32,
        });
        Ok(())
    };
    for s in sections.iter().filter(|s| s.ty == 9) {
        let mut o = s.offset;
        while o + 16.0 <= s.offset + s.size {
            push_rel(&mut relocs, o)?;
            o += 16.0;
        }
    }
    let vaddr_to_offset = |va: Num| -> Num {
        for s in &sections {
            if s.ty != 8 && s.addr != 0.0 && va >= s.addr && va < s.addr + s.size {
                return s.offset + (va - s.addr);
            }
        }
        va
    };
    // Fallback: PT_DYNAMIC DT_REL when no section headers describe relocations
    if relocs.is_empty() {
        for i in 0..phnum {
            let o = phoff + i as f64 * phentsize;
            if rd.u32(o)? != 2 {
                continue;
            }
            let (mut rel, mut relsz) = (0.0, 0.0);
            let mut d = rd.u64n(o + 8.0)?;
            while d + 16.0 <= len {
                let tag = rd.u64n(d)?;
                let val = rd.u64n(d + 8.0)?;
                if tag == 0.0 {
                    break;
                }
                if tag == 17.0 {
                    rel = val;
                } else if tag == 18.0 {
                    relsz = val;
                }
                d += 16.0;
            }
            let rel_off = vaddr_to_offset(rel);
            let mut r = rel_off;
            while rel_off != 0.0 && r + 16.0 <= rel_off + relsz {
                push_rel(&mut relocs, r)?;
                r += 16.0;
            }
        }
    }

    let mut text = sections
        .iter()
        .position(|s| s.name == ".text")
        .or_else(|| {
            sections
                .iter()
                .position(|s| to_int32_bits(s.flags) & 4 != 0 && s.size != 0.0)
        })
        .or_else(|| {
            sections.iter().position(|s| {
                s.ty == 1 && s.size != 0.0 && entry >= s.addr && entry < s.addr + s.size
            })
        });
    if text.is_none() {
        // stripped section headers: synthesize from the executable program header
        for i in 0..phnum {
            let o = phoff + i as f64 * phentsize;
            if rd.u32(o)? == 1 && rd.u32(o + 4.0)? & 1 != 0 {
                let (addr, offset, size) =
                    (rd.u64n(o + 16.0)?, rd.u64n(o + 8.0)?, rd.u64n(o + 32.0)?);
                sections.push(Section {
                    name: ".text".into(),
                    ty: 1,
                    flags: 6.0,
                    addr,
                    offset,
                    size,
                    link: 0,
                    entsize: 0.0,
                });
                text = Some(sections.len() - 1);
            }
        }
    }
    let Some(text) = text else {
        return Err("no .text section".into());
    };
    let (t_off, t_size, t_addr) = (
        sections[text].offset,
        sections[text].size,
        sections[text].addr,
    );
    let in_text = |off: Num| off >= t_off && off < t_off + t_size;

    // ---- relocations (exactly as agave `Executable::relocate`) ----
    let mut call_relocs: IndexMap<u64, CallReloc> = IndexMap::new();
    let mut data_pointers: IndexMap<u64, u64> = IndexMap::new();
    let strict = version >= 3;
    if !strict {
        for r in &relocs {
            let off = r.offset;
            if off + 8.0 > len {
                continue;
            }
            let rd = Rd(&bytes);
            if r.ty == R_BPF_64_64 {
                let value = dynsyms.get(r.sym as usize).map_or(0.0, |s| s.value);
                let refd = rd.u32(off + 4.0)? as u128;
                let addr = to_vm(big(value)? + refd);
                set_u32(&mut bytes, off + 4.0, addr as u32)?;
                set_u32(&mut bytes, off + 12.0, (addr >> 32) as u32)?;
            } else if r.ty == R_BPF_64_RELATIVE {
                if in_text(off) {
                    let mut a = ((rd.u32(off + 12.0)? as u128) << 32) | rd.u32(off + 4.0)? as u128;
                    if a == 0 {
                        continue;
                    }
                    a = to_vm(a);
                    set_u32(&mut bytes, off + 4.0, a as u32)?;
                    set_u32(&mut bytes, off + 12.0, (a >> 32) as u32)?;
                } else {
                    let a = MM_RODATA_START + rd.u32(off + 4.0)? as u64;
                    let o = off as usize;
                    bytes[o..o + 8].copy_from_slice(&a.to_le_bytes());
                }
            } else if r.ty == R_BPF_64_32 {
                let Some(sym) = dynsyms.get(r.sym as usize) else {
                    continue;
                };
                if !in_text(off) {
                    continue;
                }
                let pc = (off - t_off) / 8.0;
                if sym.ty == 2 && sym.value != 0.0 {
                    let t = (sym.value - t_addr) / 8.0;
                    if t.fract() != 0.0 {
                        return Err("unsupported: call relocation target is not a whole pc".into());
                    }
                    call_relocs.insert(
                        pc.to_bits(),
                        CallReloc::Fn {
                            name: sym.name.clone(),
                            target_pc: t as i64,
                        },
                    );
                } else {
                    call_relocs.insert(
                        pc.to_bits(),
                        CallReloc::Syscall {
                            name: sym.name.clone(),
                        },
                    );
                }
            }
        }
    }

    // ---- memory regions ----
    let rd = Rd(&bytes);
    let mut regions: Vec<Region> = Vec::new();
    let text_vaddr;
    if strict {
        // v3+: program headers give exact vm addresses
        let mut tv = vm(big(t_addr)?)?;
        for i in 0..phnum {
            let o = phoff + i as f64 * phentsize;
            if rd.u32(o)? != 1 {
                continue;
            }
            let flags = rd.u32(o + 4.0)?;
            let off = rd.u64n(o + 8.0)?;
            let va = rd.u64(o + 16.0)?;
            let filesz = rd.u64n(o + 32.0)?;
            if flags & 2 != 0 {
                continue; // writable: stack/heap
            }
            let (start, end) = clamp(bytes.len(), off, off + filesz);
            let exec = flags & 1 != 0;
            regions.push(Region {
                name: if exec { ".text" } else { ".rodata" }.into(),
                vaddr: va,
                start,
                end,
                exec,
            });
            if exec {
                tv = va;
            }
        }
        text_vaddr = tv;
    } else {
        text_vaddr = vm(to_vm(big(t_addr)?))?;
        for (i, s) in sections.iter().enumerate() {
            if to_int32_bits(s.flags) & 2 == 0 || s.ty == 8 || s.size == 0.0 {
                continue; // SHF_ALLOC
            }
            let (start, end) = clamp(bytes.len(), s.offset, s.offset + s.size);
            regions.push(Region {
                name: s.name.clone(),
                vaddr: vm(to_vm(big(s.addr)?))?,
                start,
                end,
                exec: i == text,
            });
        }
        for r in &relocs {
            if r.ty != R_BPF_64_RELATIVE || in_text(r.offset) {
                continue;
            }
            let Some(sec) = sections.iter().find(|s| {
                s.ty != 8
                    && to_int32_bits(s.flags) & 2 != 0
                    && r.offset >= s.offset
                    && r.offset < s.offset + s.size
            }) else {
                continue;
            };
            let va = vm(to_vm(big(sec.addr + (r.offset - sec.offset))?))?;
            data_pointers.insert(va, rd.u64(r.offset)?);
        }
    }

    let entry_pc = ((entry - t_addr) / 8.0).floor() as i64;
    Ok(Elf {
        version,
        bytes,
        sections,
        text,
        text_vaddr,
        entry_pc,
        dynsyms,
        symbols,
        relocs,
        call_relocs,
        regions,
        data_pointers,
    })
}

/// Read-only view of the program image in VM address space (regions stably sorted by address).
pub struct Image<'a> {
    pub elf: &'a Elf,
    /// indices into `elf.regions`, sorted by vaddr
    pub order: Vec<usize>,
}

impl<'a> Image<'a> {
    pub fn new(elf: &'a Elf) -> Self {
        // TS: [...regions].sort((a, b) => (a.vaddr < b.vaddr ? -1 : 1)); V8's TimSort keeps equal keys in order
        let mut order: Vec<usize> = (0..elf.regions.len()).collect();
        order.sort_by_key(|&i| elf.regions[i].vaddr);
        Image { elf, order }
    }
    pub fn region(&self, addr: u64, len: u64) -> Option<&'a Region> {
        let end = addr as u128 + len as u128;
        for &i in &self.order {
            let r = &self.elf.regions[i];
            if addr < r.vaddr {
                return None;
            }
            if end <= r.vaddr as u128 + (r.end - r.start) as u128 {
                return Some(r);
            }
        }
        None
    }
    pub fn bytes_at(&self, addr: u64, len: usize) -> Option<&'a [u8]> {
        let r = self.region(addr, len as u64)?;
        let o = r.start + (addr - r.vaddr) as usize;
        Some(&self.elf.bytes[o..o + len])
    }
    /// Value of read-only program memory mapped by the runtime (.text/.rodata/.data.rel.ro/.eh_frame).
    pub fn read_const(&self, addr: u64, size: usize) -> Option<u64> {
        let r = self.region(addr, size as u64)?;
        if !matches!(
            r.name.as_str(),
            ".text" | ".rodata" | ".data.rel.ro" | ".eh_frame"
        ) {
            return None;
        }
        self.read(addr, size)
    }
    pub fn read(&self, addr: u64, size: usize) -> Option<u64> {
        let b = self.bytes_at(addr, size)?;
        Some(b.iter().rev().fold(0u64, |v, &x| (v << 8) | x as u64))
    }
}
