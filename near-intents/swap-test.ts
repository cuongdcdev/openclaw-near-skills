import { executeIntent } from './index';

async function main() {
  console.log('Starting NEAR → USDC swap...');
  
  const result = await executeIntent({
    assetIn: 'NEAR',
    assetOut: 'USDC',
    amount: '1.0'
  });
  
  console.log('\n=== RESULT ===');
  console.log(result);
}

main().catch(console.error);
