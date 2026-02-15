/**
 * Test Manual Mode - How an AI Agent Would Use It
 */

import { executeIntent } from './index';

async function testManualMode() {
  console.log('='.repeat(70));
  console.log('AI Agent Example: User wants 0.5 USDC on Base');
  console.log('='.repeat(70));
  
  // Step 1: Get quote in manual mode
  const result = await executeIntent({
    assetIn: 'USDT',              // What user has (on NEAR)
    assetOut: 'base:USDC',        // What user wants (on Base)
    amount: '0.5',                // Desired output amount
    recipient: '0x30FE694284a082a5D1adfF6D25C0B9B6bF61F77D',
    mode: 'manual',               // Just get quote, don't send
    swapType: 'EXACT_OUTPUT',     // We want exact 0.5 USDC output
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('Agent can now:');
  console.log('='.repeat(70));
  console.log('1. Parse the deposit address from the result');
  console.log('2. Use NEAR wallet tools to send USDT');
  console.log('3. Track status using the explorer link');
  console.log('4. Notify user when complete');
  
  return result;
}

testManualMode().catch(console.error);
