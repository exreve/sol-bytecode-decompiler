// Small vault program on the Solana C SDK: 3 instructions (init / deposit via system CPI / withdraw via direct lamport move),
// account checks, a PDA derivation, a sha256 and logging.
#include <solana_sdk.h>

#define ERR_BAD_IX 100
#define ERR_NOT_SIGNER 101
#define ERR_BAD_OWNER 102
#define ERR_INSUFFICIENT 103

typedef struct {
	uint8_t tag;
	uint8_t bump;
	uint8_t pad[6];
	SolPubkey authority;
	uint64_t total;
	uint8_t digest[32];
} Vault;

static uint64_t do_init(SolParameters *p) {
	if (p->ka_num < 2) return ERROR_NOT_ENOUGH_ACCOUNT_KEYS;
	SolAccountInfo *vault = &p->ka[0], *auth = &p->ka[1];
	if (!auth->is_signer) return ERR_NOT_SIGNER;
	if (!SolPubkey_same(vault->owner, p->program_id)) return ERR_BAD_OWNER;
	if (vault->data_len < sizeof(Vault)) return ERROR_ACCOUNT_DATA_TOO_SMALL;
	if (p->data_len < 2) return ERROR_INVALID_INSTRUCTION_DATA;
	uint8_t bump = p->data[1];
	SolSignerSeed seeds[] = { { (const uint8_t *)"vault", 5 }, { auth->key->x, SIZE_PUBKEY }, { &bump, 1 } };
	SolPubkey expected;
	if (sol_create_program_address(seeds, 3, p->program_id, &expected) != SUCCESS) return ERROR_INVALID_ARGUMENT;
	if (!SolPubkey_same(&expected, vault->key)) return ERROR_INVALID_ARGUMENT;
	Vault *v = (Vault *)vault->data;
	if (v->tag != 0) return ERROR_ACCOUNT_ALREADY_INITIALIZED;
	v->tag = 1;
	v->bump = bump;
	sol_memcpy(&v->authority, auth->key, SIZE_PUBKEY);
	v->total = 0;
	SolBytes b[] = { { auth->key->x, SIZE_PUBKEY }, { &bump, 1 } };
	sol_sha256(b, 2, v->digest);
	sol_log("vault: init");
	return SUCCESS;
}

static uint64_t do_deposit(SolParameters *p, uint64_t amount) {
	if (p->ka_num < 3) return ERROR_NOT_ENOUGH_ACCOUNT_KEYS;
	SolAccountInfo *vault = &p->ka[0], *from = &p->ka[1], *sys = &p->ka[2];
	if (!from->is_signer) return ERR_NOT_SIGNER;
	Vault *v = (Vault *)vault->data;
	if (v->tag != 1) return ERROR_UNINITIALIZED_ACCOUNT;
	SolAccountMeta metas[] = { { from->key, true, true }, { vault->key, true, false } };
	uint8_t data[12] = { 2, 0, 0, 0 };
	sol_memcpy(data + 4, &amount, 8);
	const SolInstruction ix = { sys->key, metas, SOL_ARRAY_SIZE(metas), data, SOL_ARRAY_SIZE(data) };
	uint64_t r = sol_invoke(&ix, p->ka, p->ka_num);
	if (r != SUCCESS) return r;
	v->total += amount;
	sol_log_64(0, 0, 0, amount, v->total);
	return SUCCESS;
}

static uint64_t do_withdraw(SolParameters *p, uint64_t amount) {
	if (p->ka_num < 3) return ERROR_NOT_ENOUGH_ACCOUNT_KEYS;
	SolAccountInfo *vault = &p->ka[0], *auth = &p->ka[1], *to = &p->ka[2];
	if (!auth->is_signer) return ERR_NOT_SIGNER;
	if (!SolPubkey_same(vault->owner, p->program_id)) return ERR_BAD_OWNER;
	Vault *v = (Vault *)vault->data;
	if (v->tag != 1) return ERROR_UNINITIALIZED_ACCOUNT;
	if (!SolPubkey_same(&v->authority, auth->key)) return ERROR_MISSING_REQUIRED_SIGNATURES;
	if (*vault->lamports < amount || v->total < amount) return ERR_INSUFFICIENT;
	*vault->lamports -= amount;
	*to->lamports += amount;
	v->total -= amount;
	sol_log_pubkey(to->key);
	return SUCCESS;
}

extern uint64_t entrypoint(const uint8_t *input) {
	SolAccountInfo ka[4];
	SolParameters p = { .ka = ka };
	if (!sol_deserialize(input, &p, SOL_ARRAY_SIZE(ka))) return ERROR_INVALID_ARGUMENT;
	if (p.data_len < 1) return ERR_BAD_IX;
	uint64_t amount = 0;
	if (p.data_len >= 9) sol_memcpy(&amount, p.data + 1, 8);
	switch (p.data[0]) {
	case 0: return do_init(&p);
	case 1: return do_deposit(&p, amount);
	case 2: return do_withdraw(&p, amount);
	default: return ERR_BAD_IX;
	}
}
