// ELF64 loader for Solana sBPF programs. Mirrors agave's `solana-sbpf` loader:
// relocations are applied exactly like the runtime does so that every address the
// decompiler sees equals the address the program sees at execution time.

export const MM_RODATA_START = 0x1_0000_0000n;
export const MM_STACK_START = 0x2_0000_0000n;
export const MM_HEAP_START = 0x3_0000_0000n;
export const MM_INPUT_START = 0x4_0000_0000n;

export interface Section { name: string; type: number; flags: number; addr: number; offset: number; size: number; link: number; entsize: number }
export interface Symbol { name: string; value: number; size: number; type: number; bind: number; shndx: number }
export interface Reloc { offset: number; type: number; sym: number }

/** A mapped, read-only region of the VM address space (vm address -> bytes). */
export interface Region { name: string; vaddr: bigint; bytes: Uint8Array; exec: boolean }

export const R_BPF_64_64 = 1;
export const R_BPF_64_RELATIVE = 8;
export const R_BPF_64_32 = 10;

export interface CallReloc { kind: 'syscall'; name: string }
export interface CallRelocFn { kind: 'fn'; name: string; targetPc: number }

export interface Elf {
  version: number;             // SBPF version from e_flags (0..4)
  bytes: Uint8Array;           // relocated file image
  sections: Section[];
  text: Section;
  textVaddr: bigint;           // VM address of first text instruction
  entryPc: number;
  dynsyms: Symbol[];
  symbols: Symbol[];           // .symtab (if not stripped)
  relocs: Reloc[];
  callRelocs: Map<number, CallReloc | CallRelocFn>; // pc -> resolved symbol for R_BPF_64_32
  regions: Region[];
  /** VM addresses of data relocation slots (pointers stored in .data.rel.ro etc). */
  dataPointers: Map<bigint, bigint>;
}

const td = new TextDecoder();

function cstr(b: Uint8Array, off: number): string {
  let e = off;
  while (e < b.length && b[e] !== 0) e++;
  return td.decode(b.subarray(off, e));
}

export function parseElf(input: Uint8Array): Elf {
  const bytes = new Uint8Array(input); // copy: relocations mutate
  const dv = new DataView(bytes.buffer);
  if (bytes[0] !== 0x7f || bytes[1] !== 0x45 || bytes[2] !== 0x4c || bytes[3] !== 0x46) throw new Error('not an ELF file');
  if (bytes[4] !== 2 || bytes[5] !== 1) throw new Error('only ELF64 little-endian is supported');
  const u16 = (o: number) => dv.getUint16(o, true);
  const u32 = (o: number) => dv.getUint32(o, true);
  const u64n = (o: number) => Number(dv.getBigUint64(o, true));

  const eflags = u32(48);
  const version = eflags <= 4 ? eflags : eflags === 0x20 ? 2 : 0;
  const entry = u64n(24);
  const phoff = u64n(32), shoff = u64n(40);
  const phentsize = u16(54), phnum = u16(56);
  const shentsize = u16(58), shnum = u16(60), shstrndx = u16(62);

  const sections: Section[] = [];
  for (let i = 0; i < shnum; i++) {
    const o = shoff + i * shentsize;
    if (o + 64 > bytes.length) break;
    sections.push({ name: '', type: u32(o + 4), flags: u64n(o + 8), addr: u64n(o + 16), offset: u64n(o + 24), size: u64n(o + 32), link: u32(o + 40), entsize: u64n(o + 56) });
  }
  const shstr = sections[shstrndx];
  if (shstr) for (const s of sections) s.name = cstr(bytes, shstr.offset + u32(shoff + sections.indexOf(s) * shentsize));

  const readSyms = (sec: Section | undefined): Symbol[] => {
    if (!sec) return [];
    const str = sections[sec.link];
    const out: Symbol[] = [];
    for (let o = sec.offset; o + 24 <= sec.offset + sec.size; o += 24) {
      const info = bytes[o + 4];
      out.push({ name: str ? cstr(bytes, str.offset + u32(o)) : '', value: u64n(o + 8), size: u64n(o + 16), type: info & 0xf, bind: info >> 4, shndx: u16(o + 6) });
    }
    return out;
  };
  const dynsyms = readSyms(sections.find(s => s.type === 11));
  const symbols = readSyms(sections.find(s => s.type === 2));

  const relocs: Reloc[] = [];
  for (const s of sections.filter(s => s.type === 9)) {
    for (let o = s.offset; o + 16 <= s.offset + s.size; o += 16) {
      const info = dv.getBigUint64(o + 8, true);
      relocs.push({ offset: u64n(o), type: Number(info & 0xffffffffn), sym: Number(info >> 32n) });
    }
  }
  // Fallback: PT_DYNAMIC DT_REL when no section headers describe relocations
  if (!relocs.length) {
    for (let i = 0; i < phnum; i++) {
      const o = phoff + i * phentsize;
      if (u32(o) !== 2) continue; // PT_DYNAMIC
      let rel = 0, relsz = 0;
      for (let d = u64n(o + 8); d + 16 <= bytes.length; d += 16) {
        const tag = u64n(d), val = u64n(d + 8);
        if (tag === 0) break;
        if (tag === 17) rel = val; else if (tag === 18) relsz = val;
      }
      const relOff = vaddrToOffset(rel);
      for (let r = relOff; relOff && r + 16 <= relOff + relsz; r += 16) {
        const info = dv.getBigUint64(r + 8, true);
        relocs.push({ offset: u64n(r), type: Number(info & 0xffffffffn), sym: Number(info >> 32n) });
      }
    }
  }

  function vaddrToOffset(va: number): number {
    for (const s of sections) if (s.type !== 8 && s.addr && va >= s.addr && va < s.addr + s.size) return s.offset + (va - s.addr);
    return va;
  }

  let text = sections.find(s => s.name === '.text');
  if (!text) {
    // stripped section headers: synthesize from the executable program header
    for (let i = 0; i < phnum; i++) {
      const o = phoff + i * phentsize;
      if (u32(o) === 1 && (u32(o + 4) & 1)) {
        text = { name: '.text', type: 1, flags: 6, addr: u64n(o + 16), offset: u64n(o + 8), size: u64n(o + 32), link: 0, entsize: 0 };
        sections.push(text);
      }
    }
  }
  if (!text) throw new Error('no .text section');
  const inText = (off: number) => off >= text!.offset && off < text!.offset + text!.size;

  // ---- relocations (exactly as agave `Executable::relocate`) ----
  const callRelocs = new Map<number, CallReloc | CallRelocFn>();
  const dataPointers = new Map<bigint, bigint>();
  const strict = version >= 3;
  const toVm = (a: bigint) => (a < MM_RODATA_START ? a + MM_RODATA_START : a);
  if (!strict) {
    for (const r of relocs) {
      const off = r.offset;
      if (off + 8 > bytes.length) continue;
      if (r.type === R_BPF_64_64) {
        const sym = dynsyms[r.sym];
        const refd = BigInt(u32(off + 4));
        const addr = toVm(BigInt(sym?.value ?? 0) + refd);
        dv.setUint32(off + 4, Number(addr & 0xffffffffn), true);
        dv.setUint32(off + 12, Number(addr >> 32n), true);
      } else if (r.type === R_BPF_64_RELATIVE) {
        if (inText(off)) {
          let a = (BigInt(u32(off + 12)) << 32n) | BigInt(u32(off + 4));
          if (a === 0n) continue;
          a = toVm(a);
          dv.setUint32(off + 4, Number(a & 0xffffffffn), true);
          dv.setUint32(off + 12, Number(a >> 32n), true);
        } else {
          const a = MM_RODATA_START + BigInt(u32(off + 4));
          dv.setBigUint64(off, a, true);
        }
      } else if (r.type === R_BPF_64_32) {
        const sym = dynsyms[r.sym];
        if (!sym || !inText(off)) continue;
        const pc = (off - text.offset) / 8;
        if (sym.type === 2 /* STT_FUNC */ && sym.value !== 0) {
          callRelocs.set(pc, { kind: 'fn', name: sym.name, targetPc: (sym.value - text.addr) / 8 });
        } else {
          callRelocs.set(pc, { kind: 'syscall', name: sym.name });
        }
      }
    }
  }

  // ---- memory regions ----
  const regions: Region[] = [];
  let textVaddr: bigint;
  if (strict) {
    // v3+: program headers give exact vm addresses (bytecode at 0, rodata at 1<<32)
    textVaddr = BigInt(text.addr);
    for (let i = 0; i < phnum; i++) {
      const o = phoff + i * phentsize;
      if (u32(o) !== 1) continue;
      const flags = u32(o + 4), off = u64n(o + 8), va = dv.getBigUint64(o + 16, true), filesz = u64n(o + 32);
      if (flags & 2) continue; // writable: stack/heap
      regions.push({ name: flags & 1 ? '.text' : '.rodata', vaddr: va, bytes: bytes.subarray(off, off + filesz), exec: !!(flags & 1) });
      if (flags & 1) textVaddr = va;
    }
  } else {
    textVaddr = toVm(BigInt(text.addr));
    for (const s of sections) {
      if (!(s.flags & 2) || s.type === 8 /* NOBITS */ || !s.size) continue; // SHF_ALLOC
      regions.push({ name: s.name, vaddr: toVm(BigInt(s.addr)), bytes: bytes.subarray(s.offset, s.offset + s.size), exec: s === text });
    }
    for (const r of relocs) {
      if (r.type !== R_BPF_64_RELATIVE || inText(r.offset)) continue;
      const sec = sections.find(s => s.type !== 8 && s.flags & 2 && r.offset >= s.offset && r.offset < s.offset + s.size);
      if (!sec) continue;
      const va = toVm(BigInt(sec.addr + (r.offset - sec.offset)));
      dataPointers.set(va, dv.getBigUint64(r.offset, true));
    }
  }

  const entryPc = Math.floor((entry - text.addr) / 8);
  return { version, bytes, sections, text, textVaddr, entryPc, dynsyms, symbols, relocs, callRelocs, regions, dataPointers };
}

/** Read-only view of the program image in VM address space. */
export class Image {
  regions: Region[];
  constructor(regions: Region[]) { this.regions = [...regions].sort((a, b) => (a.vaddr < b.vaddr ? -1 : 1)); }
  region(addr: bigint, len = 1): Region | undefined {
    for (const r of this.regions) if (addr >= r.vaddr && addr + BigInt(len) <= r.vaddr + BigInt(r.bytes.length)) return r;
    return undefined;
  }
  bytesAt(addr: bigint, len: number): Uint8Array | undefined {
    const r = this.region(addr, len);
    if (!r) return undefined;
    const o = Number(addr - r.vaddr);
    return r.bytes.subarray(o, o + len);
  }
  read(addr: bigint, size: number): bigint | undefined {
    const b = this.bytesAt(addr, size);
    if (!b) return undefined;
    let v = 0n;
    for (let i = size - 1; i >= 0; i--) v = (v << 8n) | BigInt(b[i]);
    return v;
  }
}
