/// <reference path="../lib.d.ts" />
// instruction close_protocol_position
import { anchor_error_from, fn_13e190, fn_4130, fn_88360, memcpy } from '../shared.ts'

// instruction handler: close_protocol_position (discriminator sha256("global:close_protocol_position")[..8] = 0xb26c5555909875c9)
// accounts [idl]: 0 admin [signer, mut, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], 1 protocol_position [mut]
// args [idl]: (none)
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: accounts, accounts_len
export function ix_close_protocol_position(a: u64, b: u64, accounts: u64, accounts_len: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let h: u64
	const f = sol_log("Instruction: CloseProtocolPosition", 0x22)
	st64(s38, accounts, accounts_len)
	let i = accounts_close_protocol_position(s18, undef, s38, undef, fp, f)
	const g = ld64(s18 + 0x10)
	if (ld64(s18) != 0) {
		h = ld64(s18 + 8)
		st64(a + 8, g)
		st64(a, h)
		return i
	}
	st64(s28 + 8, g)
	st64(s28, ld64(s18 + 8))
	i = fn_d36e0(s48, s28)
	h = ld64(s48)
	st64(a + 8, ld64(s48 + 8))
	st64(a, h)
	return i
}

// Anchor Accounts::try_accounts of instruction close_protocol_position (called by ix_close_protocol_position; name [str]: from the handler's "Instruction: …" log; was fn_d29f0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: protocol_position (ConstraintClose, ConstraintMut)
export function accounts_close_protocol_position(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const sc8 = fp - 0xc8, se8 = fp - 0xe8, s108 = fp - 0x108, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188
	let j, k, s, v, ae: u64
	let q = try_accounts_17a30(se8, c, c, d, e, r0)
	let m: AccountInfo = ld64(se8 + 8)
	let f = ld64(se8)
	if (f != 2) {
		const i = ld64(0x300000000 /* heap bump-allocator cursor */)
		j = 5 > i
		k = j != 0 ? 0 : i - 5
		const l = i != 0 ? k : 0x300007ffb
		if ((f & 1) != 0) {
			if (0x300000008 > l) {
				raw_vec_handle_error(1, 5, 0x10015f8f8, k, j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, l)
			st8(l + 4, 0x6e)
			st32(l, 0x696d6461)
			void m.key
		} else {
			if (0x300000008 > l) {
				raw_vec_handle_error(1, 5, 0x10015f8f8, k, j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, l)
			st8(l + 4, 0x6e)
			st32(l, 0x696d6461)
			void m.key
		}
		st64(m + 0x10, l, 5)
		st64(m + 8 /* lamports */, 5)
		st64(m /* key */, 1)
		st64(a + 8, f)
		st64(a, 1)
		st64(a + 0x10, m)
		return q
	}
	q = try_accounts_18648(se8, c)
	if (ld64(se8) == 0) {
		const r = ld64(0x300000000 /* heap bump-allocator cursor */)
		s = sat_sub(r, 0x11)
		f = ld64(se8 + 8)
		const t = r != 0 ? s : 0x300007fef
		m = ld64(se8 + 0x10)
		if (f != 0) {
			if (0x300000008 > t) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, s, ae)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, t)
			st64(t + 8, 0x6f697469736f705f)
			st64(t, 0x6c6f636f746f7270)
			st8(t + 0x10, 0x6e)
			void m.key
		} else {
			if (0x300000008 > t) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, s, ae)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, t)
			st64(t + 8, 0x6f697469736f705f)
			st64(t, 0x6c6f636f746f7270)
			st8(t + 0x10, 0x6e)
			void m.key
		}
		st64(m + 0x10, t, 0x11)
		st64(m + 8 /* lamports */, 0x11)
		st64(m /* key */, 1)
		st64(a + 8, f)
		st64(a, 1)
		st64(a + 0x10, m)
		return q
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xe8) : 0x300007f18
	if (0x300000008 > h) {
		alloc_handle_alloc_error(8, 0xe8)
	}
	st64(0x300000000 /* heap bump-allocator cursor */, h & -8)
	if ((h & -8) != 0) {
		memcpy(h & -8, se8, 0xe8)
		if (m.is_writable != 0) {
			const n = m.key
			copyr(s128, n, 0x20)
			if ((memcmp(s128, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) != 0) {
				const ab = fn_88360(s148, 0)
				j = undef
				const x = ld64(0x300000000 /* heap bump-allocator cursor */)
				const z = x != 0 ? sat_sub(x, 5) : 0x300007ffb
				const aa = ld64(s148 + 8)
				const y = ld64(s148)
				if ((y & 1) != 0) {
					if (0x300000008 > z) {
						raw_vec_handle_error(1, 5, 0x10015f8f8, 0x300000008, j)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, z)
					st8(z + 4, 0x6e)
					st32(z, 0x696d6461)
					void ld64(aa)
				} else {
					if (0x300000008 > z) {
						raw_vec_handle_error(1, 5, 0x10015f8f8, 0x300000008, j)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, z)
					st8(z + 4, 0x6e)
					st32(z, 0x696d6461)
					void ld64(aa)
				}
				st64(aa + 0x10, z, 5)
				st64(aa + 8, 5)
				st64(aa, 1)
				copyr(se8, s128, 0x20)
				st64(sc8, 0xa6bd3bcb652bb6e5, 0x648eee6fe68868f5, 0xb1880f9c196055dc, 0xa18a9e05bd73e21f) // key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ
				q = Error_with_pubkeys(s158, y, aa, se8, ab)
				m = ld64(s158 + 8)
				st64(a + 8, ld64(s158))
				st64(a, 1)
				st64(a + 0x10, m)
				return q
			}
			const o: AccountInfo = ld64(h & -8)
			if (o.is_writable != 0) {
				const p = o.key
				copyr(s108, p, 0x20)
				copyr(se8, n, 0x20)
				q = memcmp(s108, se8, 0x20) as u32
				if (q == 0) {
					anchor_error_from(s178, 0x7db /* anchor::ConstraintClose */)
					q = fn_4130(s188, ld64(s178), ld64(s178 + 8), 0x10015aff1 /* "protocol_position" */, 0x11)
					m = ld64(s188 + 8)
					st64(a + 8, ld64(s188))
					st64(a, 1)
					st64(a + 0x10, m)
					return q
				}
				st64(a + 8, m)
				st64(a, 0)
				st64(a + 0x10, h & -8)
				return q
			}
			q = anchor_error_from(s168, 0x7d0 /* anchor::ConstraintMut */)
			const ac = ld64(0x300000000 /* heap bump-allocator cursor */)
			s = 0x11 > ac
			const ad = ac != 0 ? s != 0 ? 0 : ac - 0x11 : 0x300007fef
			m = ld64(s168 + 8)
			v = ld64(s168)
			if ((v & 1) != 0) {
				if (0x300000008 > ad) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, s, ae)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ad)
				st64(ad + 8, 0x6f697469736f705f)
				st64(ad, 0x6c6f636f746f7270)
				st8(ad + 0x10, 0x6e)
				void m.key
			} else {
				if (0x300000008 > ad) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, s, ae)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ad)
				st64(ad + 8, 0x6f697469736f705f)
				st64(ad, 0x6c6f636f746f7270)
				st8(ad + 0x10, 0x6e)
				void m.key
			}
			st64(m + 0x10, ad, 0x11)
			st64(m + 8 /* lamports */, 0x11)
			st64(m /* key */, 1)
			st64(a + 8, v)
			st64(a, 1)
			st64(a + 0x10, m)
			return q
		}
		q = anchor_error_from(s138, 0x7d0 /* anchor::ConstraintMut */)
		j = undef
		const u = ld64(0x300000000 /* heap bump-allocator cursor */)
		k = 5 > u
		const w = u != 0 ? k != 0 ? 0 : u - 5 : 0x300007ffb
		m = ld64(s138 + 8)
		v = ld64(s138)
		if ((v & 1) != 0) {
			if (0x300000008 > w) {
				raw_vec_handle_error(1, 5, 0x10015f8f8, k, j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, w)
			st8(w + 4, 0x6e)
			st32(w, 0x696d6461)
			void m.key
		} else {
			if (0x300000008 > w) {
				raw_vec_handle_error(1, 5, 0x10015f8f8, k, j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, w)
			st8(w + 4, 0x6e)
			st32(w, 0x696d6461)
			void m.key
		}
		st64(m + 0x10, w, 5)
		st64(m + 8 /* lamports */, 5)
		st64(m /* key */, 1)
		st64(a + 8, v)
		st64(a, 1)
		st64(a + 0x10, m)
		return q
	}
	alloc_handle_alloc_error(8, 0xe8)
}

export function fn_d36e0(a: u64, b: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s70 = fp - 0x70
	const f: AccountInfo = ld64(b)
	const g: LamportsCell = f.lamports
	const m = f.key
	rc_inc(g)
	const h: DataCell = f.data
	rc_inc(h)
	const l = f.owner
	const k = f.rent_epoch
	const j = f.is_signer
	const i = f.is_writable
	st8(s38 + 2, f.executable)
	st8(s38, j, i)
	st64(s60, m, g, h, l, k)
	const n: AccountInfo = ld64(ld64(b + 8))
	const o: LamportsCell = n.lamports
	const u = n.key
	rc_inc(o)
	const p: DataCell = n.data
	rc_inc(p)
	const t = n.owner
	const s = n.rent_epoch
	const r = n.is_signer
	const q = n.is_writable
	st8(s8 + 2, n.executable)
	st8(s8, r, q)
	st64(s30, u, o, p, t, s)
	const z = fn_13e190(s70, s30, s60, p, t)
	let y = undef
	const v = ld64(s70)
	if (v == 2) {
		st64(a + 8, y)
		st64(a, v)
		return z
	}
	const w = ld64(0x300000000 /* heap bump-allocator cursor */)
	const x = w != 0 ? sat_sub(w, 0x11) : 0x300007fef
	y = ld64(s70 + 8)
	if ((v & 1) != 0) {
		if (0x300000008 > x) {
			raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, 0x11 > w)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, x)
		st64(x + 8, 0x6f697469736f705f)
		st64(x, 0x6c6f636f746f7270)
		st8(x + 0x10, 0x6e)
		void ld64(y)
	} else {
		if (0x300000008 > x) {
			raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, 0x11 > w)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, x)
		st64(x + 8, 0x6f697469736f705f)
		st64(x, 0x6c6f636f746f7270)
		st8(x + 0x10, 0x6e)
		void ld64(y)
	}
	st64(y + 0x10, x, 0x11)
	st64(y + 8, 0x11)
	st64(y, 1)
	st64(a + 8, y)
	st64(a, v)
	return z
}
