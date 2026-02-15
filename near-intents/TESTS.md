# Test & Example Files

This directory contains test scripts and example usage patterns for the NEAR Intents skill.

⚠️ **Warning**: These scripts make REAL transactions on mainnet. Use with caution and small amounts!

## Test Scripts

### Basic Tests

| File | Description | Network | Notes |
|------|-------------|---------|-------|
| `test-basic.ts` | Simple NEAR → USDC swap test | Mainnet | Uses configured account |
| `test-manual-mode.ts` | Manual mode quote generation | Mainnet | No transaction sent |
| `test-1click-swap.ts` | Direct 1Click SDK test | Mainnet | Low-level API test |

### Swap Examples

| File | Description | Amount |
|------|-------------|--------|
| `swap-test.ts` | Basic swap test | Small |
| `swap-smaller.ts` | Minimal swap | Very small |
| `swap-now.ts` | Quick swap example | Small |
| `swap-base-to-near.ts` | Base → NEAR cross-chain | Manual mode |
| `swap-base-usdc-to-eth.ts` | Base USDC → ETH | Manual mode |

### Comprehensive Tests

| File | Description | Purpose |
|------|-------------|---------|
| `test-comprehensive.ts` | Full workflow test | End-to-end validation |
| `test-final.ts` | Production readiness test | Final validation |
| `test-two-step.ts` | Manual two-step swap | User-driven flow |

## Running Tests

### Prerequisites

1. Configure `.env` with your NEAR account:
```env
NEAR_ACCOUNT_ID=your-account.near
NEAR_PRIVATE_KEY=ed25519:...
NEAR_RPC_URL=https://rpc.mainnet.fastnear.com
NEAR_NETWORK_ID=mainnet
```

2. Ensure you have enough NEAR for gas + swap amounts

### Execute a Test

```bash
# Basic test
npx ts-node test-basic.ts

# Manual mode (no transaction)
npx ts-node test-manual-mode.ts

# Specific swap example
npx ts-node swap-test.ts
```

## Safety Notes

⚠️ **IMPORTANT**:

1. **Real Money**: These tests use real NEAR and tokens
2. **Small Amounts**: Start with the smallest possible amounts
3. **Check Balances**: Verify your account has sufficient funds
4. **Monitor Transactions**: Watch https://nearblocks.io for confirmations
5. **Manual Mode First**: Test with `mode: 'manual'` before auto-sending

## Test Coverage

### Covered Scenarios
- ✅ NEAR → USDC (same chain)
- ✅ NEAR → Base USDC (cross-chain)
- ✅ Manual mode quote generation
- ✅ Exact input swaps
- ✅ Exact output swaps
- ✅ Status polling and tracking

### Not Covered
- ❌ Bitcoin/Dogecoin/Zcash swaps (requires UTXO wallet)
- ❌ Solana swaps (requires Solana wallet)
- ❌ Batch swaps
- ❌ Webhook handling

## Adding New Tests

When creating a new test file:

1. **Name it clearly**: `test-<description>.ts` or `swap-<scenario>.ts`
2. **Add to this README**: Update the tables above
3. **Use small amounts**: Never test with large amounts
4. **Add error handling**: Wrap in try/catch blocks
5. **Log results**: Print transaction hashes and explorer links

Example template:

```typescript
import { executeIntent } from './index';

async function testMyScenario() {
  try {
    console.log('🧪 Testing: My Scenario');
    
    const result = await executeIntent({
      assetIn: 'NEAR',
      assetOut: 'USDC',
      amount: '0.1',  // Small amount!
      mode: 'manual',  // Manual first for safety
    });
    
    console.log('✅ Test passed:', result);
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMyScenario();
```

## Cleanup

After testing, you can safely delete test files if desired:

```bash
# Remove all test files
rm test-*.ts swap-*.ts

# Or keep them for reference
# (they're excluded from production builds via .npmignore)
```

## Production Usage

**DO NOT** include test files when sharing/packaging the skill:

```bash
# package-production.sh automatically excludes test files
./package-production.sh
```

The production package will only include:
- Core functionality (`index.ts`, `lib-1click/`)
- Documentation (`*.md`)
- Configuration (`package.json`, `tsconfig.json`)
- Examples (minimal)

---

**Remember**: Test responsibly! Use small amounts and verify results before proceeding with larger transactions.
