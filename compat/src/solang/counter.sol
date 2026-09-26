import 'solana';

// Solang (Solidity for Solana): storage (counter, owner, mapping), signer checks, events, a system-program CPI.
@program_id("Cntr1hFhCxz6NtwJUwBNHPfM3Ch8JxLTjLmSGvHk1v9e")
contract counter {
	uint64 public count;
	address public owner;
	mapping(address => uint64) public credits;

	event Incremented(address who, uint64 by, uint64 total);

	@payer(payer)
	constructor(address initialOwner) {
		owner = initialOwner;
		count = 0;
	}

	@signer(caller)
	function increment(uint64 by) external {
		require(by > 0 && by <= 1000, "bad amount");
		count += by;
		address who = tx.accounts.caller.key;
		credits[who] += by;
		emit Incremented(tx.accounts.caller.key, by, count);
	}

	@signer(auth)
	function setOwner(address newOwner) external {
		require(tx.accounts.auth.key == owner, "not owner");
		owner = newOwner;
	}

	@mutableSigner(from)
	@mutableAccount(to)
	function pay(uint64 lamports) external {
		AccountMeta[2] metas = [
			AccountMeta({pubkey: tx.accounts.from.key, is_writable: true, is_signer: true}),
			AccountMeta({pubkey: tx.accounts.to.key, is_writable: true, is_signer: false})
		];
		bytes bincode = abi.encode(uint32(2), lamports);
		address(address"11111111111111111111111111111111").call{accounts: metas}(bincode);
	}
}
