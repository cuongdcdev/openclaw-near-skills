import * as dotenv from 'dotenv';
dotenv.config();

import { executeIntent } from './index';
import { getPrice } from './scripts/price-service';

const BASE_ADDRESS = '0x30FE694284a082a5D1adfF6D25C0B9B6bF61F77D';

async function runTwoStepTest() {
  console.log('🚀 Two-Step NEAR Intents Test');
  console.log('='.repeat(60));
  console.log('');

  const nearPrice = await getPrice('NEAR');
  const swapAmount = 0.5; // 0.5 NEAR

  console.log(`💰 Strategy: Two-Step Process`);
  console.log(`   Step 1: Swap NEAR → USDC (NEAR chain)`);
  console.log(`   Step 2: Withdraw USDC → Base address`);
  console.log('');
  console.log(`💰 Testing with ${swapAmount} NEAR (~$${(swapAmount * nearPrice).toFixed(2)})`);
  console.log('');

  const transactions: Array<{ step: string; url?: string; hash?: string }> = [];

  // Step 1: Swap NEAR to USDC on NEAR chain
  console.log('='.repeat(60));
  console.log('🔄 STEP 1: SWAP NEAR → USDC (NEAR CHAIN)');
  console.log('='.repeat(60));
  try {
    console.log(`\n⏳ Swapping ${swapAmount} NEAR to USDC on NEAR...`);

    const swapResult = await executeIntent({
      assetIn: 'NEAR',
      assetOut: 'USDC', // No chain prefix = NEAR chain
      amount: swapAmount.toString()
    });

    console.log('\n' + swapResult);

    const txMatch = swapResult.match(/https:\/\/nearblocks\.io\/txns\/([a-zA-Z0-9_-]+)/);
    const amountMatch = swapResult.match(/Received: ([\d.]+) USDC/);

    if (txMatch) {
      const usdcAmount = amountMatch ? amountMatch[1] : 'unknown';
      transactions.push({
        step: 'Swap NEAR → USDC',
        url: txMatch[0],
        hash: txMatch[1]
      });
      console.log(`\n✅ Swap completed! Received ${usdcAmount} USDC`);
      console.log(`🔗 Transaction: ${txMatch[0]}`);

      // Step 2: Withdraw USDC to Base
      console.log('\n\n');
      console.log('='.repeat(60));
      console.log('🌉 STEP 2: WITHDRAW USDC → BASE ADDRESS');
      console.log('='.repeat(60));
      console.log(`\n📍 Withdrawing USDC to Base address...`);
      console.log(`   Address: ${BASE_ADDRESS}`);

      try {
        const withdrawResult = await executeIntent({
          assetIn: 'USDC',
          assetOut: 'base:USDC', // Bridge to Base
          amount: usdcAmount,
          recipient: BASE_ADDRESS
        });

        console.log('\n' + withdrawResult);

        const withdrawTxMatch = withdrawResult.match(/https:\/\/nearblocks\.io\/txns\/([a-zA-Z0-9_-]+)/);
        if (withdrawTxMatch) {
          transactions.push({
            step: 'Withdraw USDC → Base',
            url: withdrawTxMatch[0],
            hash: withdrawTxMatch[1]
          });
          console.log(`\n✅ Withdrawal initiated! Check Base chain for USDC arrival`);
          console.log(`🔗 Transaction: ${withdrawTxMatch[0]}`);
        }
      } catch (withdrawError: any) {
        console.error('\n❌ Withdrawal error:', withdrawError.message);
        console.log('💡 You have USDC on NEAR. Withdrawal can be tried again.');
      }
    }

  } catch (error: any) {
    console.error('\n❌ Swap error:', error.message);
  }

  console.log('\n\n');

  // Summary
  console.log('='.repeat(60));
  console.log('📊 TRANSACTION SUMMARY');
  console.log('='.repeat(60));
  console.log('');

  if (transactions.length > 0) {
    transactions.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.step}`);
      console.log(`   🔗 ${tx.url}`);
      console.log(`   📝 Hash: ${tx.hash}`);
      console.log('');
    });

    console.log('✅ All steps completed!');
    console.log('');
    console.log('💡 Track on NEAR Blocks and Base chain explorer');
  } else {
    console.log('⚠️  No transactions completed');
  }

  console.log('');
  console.log('='.repeat(60));
}

runTwoStepTest().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
