# Extended Use Cases for NEAR Intents Skill

## Overview

The NEAR Intents skill, powered by the [1Click SDK](https://github.com/defuse-protocol/one-click-sdk-typescript), supports advanced cross-chain payment scenarios beyond simple swaps and bridges.

---

## 🛒 Use Case 1: Web2 Payments (Lifestyle Pay)

### Concept
Pay Web2-style invoices using **any token** you have — the skill routes through the 1Click API to deliver the exact currency the merchant expects.

### User Experience
> "Pay this 50 USDC Base invoice using my NEAR."

### Execution Flow

```typescript
// Step 1: Swap NEAR → USDC on Base (1Click auto-routes)
await executeIntent({
  assetIn: 'NEAR',
  assetOut: 'base:USDC',
  amount: '50.0',
  recipient: merchantBaseAddress,
  swapType: 'EXACT_OUTPUT',  // Want exactly 50 USDC
});
```

The 1Click API handles:
1. Calculating how much NEAR to send
2. Getting the best market maker quote
3. Executing the swap
4. Delivering USDC to the merchant on Base

---

## 🌐 Use Case 2: Cross-Chain Bridge

### Concept
Move stablecoins between chains with minimal effort.

### Example: USDC from Arbitrum to Solana

```typescript
const quote = await executeIntent({
  assetIn: 'arb:USDC',
  assetOut: 'sol:USDC',
  amount: '100.0',
  recipient: 'SolanaAddress...',
  mode: 'manual',
});
// User sends USDC to the deposit address on Arbitrum
// 1Click handles the bridge automatically
```

---

## 🔄 Use Case 3: Multi-Step Routing

### Concept
For complex routes, break into steps:

### Example: NEAR → USDC → Send to Solana

```typescript
// Step 1: Swap NEAR to USDC (same chain, high liquidity)
const swap = await executeIntent({
  assetIn: 'NEAR',
  assetOut: 'USDC',
  amount: '10.0',
});

// Step 2: Bridge USDC to Solana
const bridge = await executeIntent({
  assetIn: 'USDC',
  assetOut: 'sol:USDC',
  amount: '9.5',  // Accounting for swap fees
  recipient: 'SolanaAddress...',
});
```

Or do it in one call (1Click handles routing):
```typescript
await executeIntent({
  assetIn: 'NEAR',
  assetOut: 'sol:USDC',
  amount: '10.0',
  recipient: 'SolanaAddress...',
});
```

---

## 💱 Use Case 4: Get Best Price Quote

### Concept
AI agent checks price before committing.

```typescript
// Manual mode + EXACT_OUTPUT = "How much NEAR for 100 USDC on Base?"
const quote = await executeIntent({
  assetIn: 'NEAR',
  assetOut: 'base:USDC',
  amount: '100.0',
  recipient: '0x...',
  mode: 'manual',
  swapType: 'EXACT_OUTPUT',
});
// Parse "You need to send: X.XX NEAR" from response
// Present to user before committing
```

---

## 🪙 Use Case 5: Bitcoin to NEAR

### Concept
Accept Bitcoin and convert to NEAR tokens.

```typescript
const quote = await executeIntent({
  assetIn: 'btc:BTC',
  assetOut: 'NEAR',
  amount: '0.01',
  recipient: 'user.near',
  mode: 'manual',
});
// User sends 0.01 BTC to the Bitcoin deposit address
// 1Click bridges to NEAR automatically
```

---

## 🕵️ Use Case 6: Privacy-Aware Transfers

### Concept
The 1Click API routes funds through its solver network. The recipient sees tokens arriving from the solver/market maker, not from the sender's wallet directly.

```typescript
// Step 1: Swap sender's tokens
await executeIntent({
  assetIn: 'NEAR',
  assetOut: 'USDC',
  amount: '100.0',
});

// Step 2: Bridge to recipient via solver network
await executeIntent({
  assetIn: 'USDC',
  assetOut: 'base:USDC',
  amount: '99.0',
  recipient: recipientAddress,
});
// Recipient sees funds from solver, not from sender
```

---

## 🤖 Agent Integration Tips

### Parsing User Requests

```
"Swap 1 NEAR to USDC on Base"
  → assetIn: 'NEAR', assetOut: 'base:USDC', amount: '1.0'

"Bridge 5 USDC from Arbitrum to Solana"
  → assetIn: 'arb:USDC', assetOut: 'sol:USDC', amount: '5.0', mode: 'manual'

"How much NEAR for 10 USDC?"
  → assetIn: 'NEAR', assetOut: 'USDC', amount: '10.0', mode: 'manual', swapType: 'EXACT_OUTPUT'

"Send 0.01 BTC to my NEAR account"
  → assetIn: 'btc:BTC', assetOut: 'NEAR', amount: '0.01', mode: 'manual'
```

### Agent Decision Logic

1. **Origin on NEAR + has credentials** → Auto mode
2. **Origin on non-NEAR chain** → Manual mode
3. **User wants specific output** → Use `EXACT_OUTPUT`
4. **User wants price check** → Manual mode (dry run)

---

## References

- **1Click SDK**: [github.com/defuse-protocol/one-click-sdk-typescript](https://github.com/defuse-protocol/one-click-sdk-typescript)
- **1Click API Docs**: [docs.near-intents.org](https://docs.near-intents.org/near-intents/integration/distribution-channels/1click-api)
- **Partners Portal**: [partners.near-intents.org](https://partners.near-intents.org/)
- **NEAR Intents Explorer**: [explorer.near-intents.org](https://explorer.near-intents.org)

---

**Version**: 2.0.0
**Updated**: 2026-02-15
