import * as dotenv from 'dotenv';
dotenv.config();

import { executeIntent } from './index';
import { getPrice } from './scripts/price-service';

const BASE_ADDRESS = '0x30FE694284a082a5D1adfF6D25C0B9B6bF61F77D';

async function runFinalTests() {
  console.log('🚀 NEAR Intents Final Test Suite');
  console.log('=' .repeat(60));
  console.log('');

  // Test with larger amount for better liquidity
  const nearPrice = await getPrice('NEAR');
  const testAmount = 0.5; // 0.5 NEAR should be ~$0.50

  console.log(`💰 Testing with ${testAmount} NEAR (~$${(testAmount * nearPrice).toFixed(2)})`);
  console.log(`📍 Base Address: ${BASE_ADDRESS}`);
  console.log('');

  const transactions: Array<{ name: string; url?: string; hash?: string }> = [];

  // Test 1: Direct swap NEAR to USDC on Base with withdrawal
  console.log('='.repeat(60));
  console.log('🔄 TEST 1: SWAP + BRIDGE NEAR → USDC → BASE');
  console.log('='.repeat(60));
  try {
    console.log(`\n⏳ Swapping ${testAmount} NEAR to USDC on Base...`);
    console.log(`📍 Will send to: ${BASE_ADDRESS}`);

    const result = await executeIntent({
      assetIn: 'NEAR',
      assetOut: 'base:USDC',
      amount: testAmount.toString(),
      recipient: BASE_ADDRESS
    });

    console.log('\n' + result);

    // Extract transaction URL
    const txMatch = result.match(/https:\/\/nearblocks\.io\/txns\/([a-zA-Z0-9_-]+)/);
    if (txMatch) {
      transactions.push({
        name: 'Swap + Bridge (NEAR → USDC → Base)',
        url: txMatch[0],
        hash: txMatch[1]
      });
      console.log(`\n✅ Transaction URL: ${txMatch[0]}`);
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }

  console.log('\n\n');

  // Test 2: Simple NEAR to USDC swap (same chain)
  console.log('='.repeat(60));
  console.log('🔄 TEST 2: SWAP NEAR → USDC (NEAR Chain)');
  console.log('='.repeat(60));
  try {
    const smallAmount = 0.3;
    console.log(`\n⏳ Swapping ${smallAmount} NEAR to USDC on NEAR...`);

    const result = await executeIntent({
      assetIn: 'NEAR',
      assetOut: 'USDC',
      amount: smallAmount.toString()
    });

    console.log('\n' + result);

    const txMatch = result.match(/https:\/\/nearblocks\.io\/txns\/([a-zA-Z0-9_-]+)/);
    if (txMatch) {
      transactions.push({
        name: 'Swap (NEAR → USDC)',
        url: txMatch[0],
        hash: txMatch[1]
      });
      console.log(`\n✅ Transaction URL: ${txMatch[0]}`);
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }

  console.log('\n\n');

  // Summary
  console.log('='.repeat(60));
  console.log('📊 TRANSACTION SUMMARY');
  console.log('='.repeat(60));
  console.log('');

  if (transactions.length > 0) {
    transactions.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.name}`);
      console.log(`   🔗 ${tx.url}`);
      console.log(`   📝 Hash: ${tx.hash}`);
      console.log('');
    });

    console.log('✅ All transactions completed!');
    console.log('');
    console.log('💡 You can track these transactions on NEAR Blocks');
  } else {
    console.log('⚠️  No successful transactions');
    console.log('💡 This might be due to:');
    console.log('   - Low liquidity on Defuse solver');
    console.log('   - Network congestion');
    console.log('   - Insufficient balance');
  }

  console.log('');
  console.log('=' .repeat(60));
}

runFinalTests().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
