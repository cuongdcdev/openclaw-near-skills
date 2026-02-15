import { executeIntent } from './index';

async function main() {
  const result = await executeIntent({
    assetIn: 'base:USDC',
    assetOut: 'NEAR',  // NEAR token on NEAR
    amount: '0.5',
    recipient: 'cuongdcdev.near',
    refundAddress: '0x30FE694284a082a5D1adfF6D25C0B9B6bF61F77D',  // Base address for refunds
    mode: 'manual',
    swapType: 'EXACT_INPUT'
  });
  
  console.log(result);
}

main().catch(console.error);
