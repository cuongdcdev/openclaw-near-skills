import { executeIntent } from './index';

async function main() {
  console.log('Starting 0.4 NEAR → USDC swap...');
  
  const result = await executeIntent({
    assetIn: 'NEAR',
    assetOut: 'USDC',
    amount: '0.4'  // Using your existing balance on Intents
  });
  
  console.log('\n=== RESULT ===');
  console.log(result);
}

main().catch(console.error);
