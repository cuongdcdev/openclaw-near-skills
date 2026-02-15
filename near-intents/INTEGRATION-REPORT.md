# NEAR Intents 1Click SDK Integration — Report

## Summary

The NEAR Intents skill is built on the official [`@defuse-protocol/one-click-sdk-typescript`](https://github.com/defuse-protocol/one-click-sdk-typescript) SDK. This SDK wraps the [1Click API](https://docs.near-intents.org/near-intents/integration/distribution-channels/1click-api) that coordinates cross-chain swaps through market makers.

## Architecture

### 1Click API Flow

```
executeIntent()
  │
  ├─ resolveToken(assetIn)  → { symbol, decimals, assetId }
  ├─ resolveToken(assetOut) → { symbol, decimals, assetId }
  ├─ toSmallestUnit(amount, decimals)
  │
  ├─ OneClickService.getQuote({
  │     originAsset, destinationAsset, amount,
  │     refundTo, recipient, deadline, ...
  │  })
  │  → { depositAddress, amountIn, amountOut }
  │
  ├─ [manual mode] → return quote instructions
  │
  ├─ account.transfer() → send deposit to depositAddress
  ├─ OneClickService.submitDepositTx() → (optional, speeds up)
  └─ OneClickService.getExecutionStatus() → poll until SUCCESS
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `@defuse-protocol/one-click-sdk-typescript` | Official 1Click API TypeScript SDK |
| `OpenAPI.BASE` | 1Click API endpoint (`https://1click.chaindefuser.com`) |
| `OneClickService.getQuote()` | Get swap pricing + deposit address |
| `OneClickService.submitDepositTx()` | Submit tx hash for faster processing |
| `OneClickService.getExecutionStatus()` | Poll swap status |
| `OneClickService.getTokens()` | List all supported tokens |

## Test Results

### ✅ Successful Test: 0.1 NEAR → USDC

```
Input:  0.1 NEAR
Output: 0.105328 USDC
Status: SUCCESS
Time:   ~35 seconds (7 status polls)

Transaction: https://nearblocks.io/txns/46rkUnrk6NSi1UaUS5AFh5bZpddCr57BAibv22CitS48
Explorer:    https://explorer.near-intents.org/transactions/2dc254caa97fa6b73dcc11f1e7eb3e003e50df8f4d68be25f8ff2b8525dac175
```

## Dependencies

```json
{
  "@defuse-protocol/one-click-sdk-typescript": "0.1.1",
  "@near-js/accounts": "^2.2.4",
  "@near-js/crypto": "^2.2.4",
  "@near-js/providers": "^2.2.4",
  "@near-js/signers": "^2.2.4",
  "@near-js/tokens": "^2.2.4",
  "decimal.js": "^10.4.3",
  "dotenv": "^16.3.1"
}
```

## Features

✅ **Reliable Swaps**: Uses production 1Click API with active market makers
✅ **Cross-Chain**: Works for NEAR, Base, Arbitrum, Ethereum, Solana, BSC, BTC, DOGE, ZEC, LTC
✅ **Auto + Manual Modes**: Auto-send from NEAR account, or return quote for manual sending
✅ **EXACT_INPUT + EXACT_OUTPUT**: Specify input or desired output amount
✅ **Status Tracking**: Real-time monitoring with automatic polling
✅ **JWT Support**: Optional authentication to avoid 0.2% fee

## References

- **1Click SDK**: [github.com/defuse-protocol/one-click-sdk-typescript](https://github.com/defuse-protocol/one-click-sdk-typescript)
- **1Click API Docs**: [docs.near-intents.org](https://docs.near-intents.org/near-intents/integration/distribution-channels/1click-api)
- **Partners Portal**: [partners.near-intents.org](https://partners.near-intents.org/)
- **SDK Examples**: [github.com/near-examples/near-intents-examples](https://github.com/near-examples/near-intents-examples)

---

**Updated**: 2026-02-15
**Version**: 2.0.0
**Status**: ✅ Production Ready
