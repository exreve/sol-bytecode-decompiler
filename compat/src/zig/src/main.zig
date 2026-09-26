// Counter on solana-program-sdk-zig: instruction tag dispatch, owner / signer checks, account data writes,
// a system-program transfer CPI and logging.
const std = @import("std");
const sol = @import("solana_program_sdk");

const system_program_id = sol.public_key.PublicKey.comptimeFromBase58("11111111111111111111111111111111");

const State = extern struct {
    initialized: u8,
    _pad: [7]u8,
    authority: sol.public_key.PublicKey,
    count: u64,
};

fn process(ctx: *const sol.context.Context) !void {
    if (ctx.data.len < 1) return error.InvalidInstructionData;
    if (ctx.num_accounts < 2) return error.NotEnoughAccountKeys;
    const state_acc = ctx.accounts[0];
    const auth = ctx.accounts[1];
    if (!auth.isSigner()) return error.MissingRequiredSignature;
    if (!state_acc.ownerId().equals(ctx.program_id.*)) return error.IncorrectProgramId;
    if (state_acc.dataLen() < @sizeOf(State)) return error.AccountDataTooSmall;
    const st: *align(1) State = @ptrCast(state_acc.data().ptr);
    switch (ctx.data[0]) {
        0 => {
            if (st.initialized != 0) return error.AccountAlreadyInitialized;
            st.initialized = 1;
            st.authority = auth.id();
            st.count = 0;
            sol.log.log("zig counter: init");
        },
        1 => {
            if (st.initialized == 0) return error.UninitializedAccount;
            if (!st.authority.equals(auth.id())) return error.InvalidAuthority;
            var by: u64 = 1;
            if (ctx.data.len >= 9) by = std.mem.readInt(u64, ctx.data[1..9], .little);
            st.count = std.math.add(u64, st.count, by) catch return error.Overflow;
            sol.log.print("count {d}", .{st.count});
        },
        2 => {
            if (ctx.num_accounts < 4) return error.NotEnoughAccountKeys;
            const to = ctx.accounts[2];
            if (ctx.data.len < 9) return error.InvalidInstructionData;
            const lamports = std.mem.readInt(u64, ctx.data[1..9], .little);
            var data: [12]u8 = undefined;
            std.mem.writeInt(u32, data[0..4], 2, .little);
            std.mem.writeInt(u64, data[4..12], lamports, .little);
            const metas = [_]sol.account.Account.Param{
                .{ .id = &auth.id(), .is_writable = true, .is_signer = true },
                .{ .id = &to.id(), .is_writable = true, .is_signer = false },
            };
            const ix = sol.instruction.Instruction.from(.{ .program_id = &system_program_id, .accounts = &metas, .data = &data });
            try ix.invoke(&.{ auth.info(), to.info(), ctx.accounts[3].info() });
        },
        else => return error.InvalidInstructionData,
    }
}

export fn entrypoint(input: [*]u8) u64 {
    const ctx = sol.context.Context.load(input) catch return 1;
    process(&ctx) catch |err| {
        sol.log.print("error: {s}", .{@errorName(err)});
        return 2;
    };
    return 0;
}
