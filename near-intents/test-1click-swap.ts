/**
 * Test the new 1-Click SDK implementation
 */

import { executeIntent } from './index';

async function testSwap() {
  try {
    console.log('='.repeat(60));
    console.log('Testing NEAR Intents 1-Click SDK Implementation');
    console.log('='.repeat(60));
    
    // Test: Swap 0.1 NEAR to USDC
    const result = await executeIntent({
      assetIn: 'NEAR',
      assetOut: 'USDC',
      amount: '0.1'
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('RESULT:');
    console.log(result);
    console.log('='.repeat(60));
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message || error);
    process.exit(1);
  }
}

testSwap();
