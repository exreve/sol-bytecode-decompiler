# Regression programs

Mainnet programs that once crashed the decompiler, kept with their on-chain Anchor IDL. CI decompiles each in IDL
mode and runs the equivalence check on it.

| file | program | issue |
|---|---|---|
| squads_v4.so (+ .json) | Squads V4, SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf | IDL mode: `RangeError` in `Views.resolve` |
| metadao_conditional_vault.so (+ .json) | MetaDAO conditional_vault, VLTX1ishMBbcX3rdBWGssxawAo1Q2X2qxYFYqiGodVg | IDL mode: `Views.resolve` recursion |

Both: the instruction-argument view `<Ix>Args` had the name of the IDL type of the instruction's single `args`
argument, replaced that type's view and embedded itself at offset 0. The argument view is now `<Ix>IxArgs` in that case.
