import { executeIntent } from './index';

async function main() {
  const result = await executeIntent({
    assetIn: 'NEAR',
    assetOut: 'base:USDC',
    amount: '0.5',
    recipient: '0x30FE694284a082a5D1adfF6D25C0B9B6bF61F77D',
    swapType: 'EXACT_OUTPUT',  // Get exactly 0.5 USDC
    mode: 'auto'
  });
  
  console.log(result);
}

main().catch(console.error);
