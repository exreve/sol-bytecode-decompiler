// Rust symbol demangling (legacy `_ZN...E` scheme and v0 `_R` prefix detection) — enough to
// recover readable paths such as `alloc::raw_vec::finish_grow` or
// `<spl_token::state::Account as solana_program::program_pack::Pack>::unpack_from_slice`.

const ESC: Record<string, string> = { SP: '@', BP: '*', RF: '&', LT: '<', GT: '>', LP: '(', RP: ')', C: ',' }

function unescape(s: string): string {
	let out = s.replace(/\$([A-Z]{1,2})\$/g, (m, k) => ESC[k] ?? m)
	out = out.replace(/\$u([0-9a-f]{2,6})\$/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
	return out.replace(/\.\./g, '::')
}

export function demangle(sym: string): string {
	if (!sym.startsWith('_ZN')) return sym
	let i = 3
	const parts: string[] = []
	while (i < sym.length && sym[i] !== 'E') {
		let n = 0
		while (i < sym.length && sym[i] >= '0' && sym[i] <= '9') n = n * 10 + (sym.charCodeAt(i++) - 48)
		if (!n) break
		parts.push(sym.slice(i, i + n))
		i += n
	}
	if (parts.length && /^h[0-9a-f]{16}$/.test(parts[parts.length - 1])) parts.pop()
	return parts.map(p => unescape(p.startsWith('_$') ? p.slice(1) : p)).join('::')
}

/** Crate a (demangled) function belongs to: for `<T as Trait>::f` the crate defining T. */
export function crateOf(name: string): string {
	const m = /^<(?:&(?:mut )?)?([A-Za-z_][A-Za-z0-9_]*)/.exec(name)
	if (m) return m[1]
	return /^([A-Za-z_][A-Za-z0-9_]*)/.exec(name)?.[1] ?? '?'
}

/** Shorten long generic paths for display: keep last path segments, drop generic args. */
export function shortName(name: string): string {
	let depth = 0, out = ''
	for (const ch of name) {
		if (ch === '<') { if (depth++ === 0 && out.length && !out.endsWith('::') && out !== '') out += '<…>'; if (out === '') out += '<'; continue }
		if (ch === '>') { depth--; continue }
		if (depth === 0) out += ch
	}
	return out || name
}
