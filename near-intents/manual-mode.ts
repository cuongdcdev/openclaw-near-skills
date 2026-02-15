/**
 * Manual Mode: Get quote and deposit address without auto-sending
 */

import {
  OpenAPI,
  OneClickService,
  QuoteRequest,
} from '@defuse-protocol/one-click-sdk-typescript';
import Decimal from 'decimal.js';
import dotenv from 'dotenv';

dotenv.config();

OpenAPI.BASE = 'https://1click.chaindefuser.com';
OpenAPI.TOKEN = process.env.ONE_CLICK_JWT;

interface TokenInfo {
  symbol: string;
  decimals: number;
  assetId: string;
}

const TOKEN_MAP: Record<string, TokenInfo> = {
  'NEAR': { symbol: 'NEAR', decimals: 24, assetId: 'nep141:wrap.near' },
  'USDC': { symbol: 'USDC', decimals: 6, assetId: 'nep141:17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1' },
  'USDT': { symbol: 'USDT', decimals: 6, assetId: 'nep141:usdt.tether-token.near' },
  'base:USDC': { symbol: 'USDC', decimals: 6, assetId: 'nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near' },
};

function resolveToken(symbol: string): TokenInfo {
  const upperSymbol = symbol.toUpperCase();
  if (TOKEN_MAP[upperSymbol]) return TOKEN_MAP[upperSymbol];
  for (const [key, value] of Object.entries(TOKEN_MAP)) {
    if (key.toUpperCase() === upperSymbol) return value;
  }
  throw new Error(`Token not found: ${symbol}`);
}

function toSmallestUnit(amount: string, decimals: number): string {
  return new Decimal(amount).mul(new Decimal(10).pow(decimals)).toFixed(0);
}

function fromSmallestUnit(amount: string, decimals: number): string {
  return new Decimal(amount).div(new Decimal(10).pow(decimals)).toFixed();
}

interface ManualQuoteParams {
  assetIn: string;
  assetOut: string;
  amountOut: string;  // Desired output amount
  recipient: string;
  senderAddress?: string;
}

async function getManualQuote(params: ManualQuoteParams) {
  const { assetIn, assetOut, amountOut, recipient, senderAddress } = params;
  
  const tokenIn = resolveToken(assetIn);
  const tokenOut = resolveToken(assetOut);
  const sender = senderAddress || process.env.NEAR_ACCOUNT_ID!;
  
  console.log('\n🎯 Manual Mode: Quote Request');
  console.log('================================');
  console.log(`From: ${tokenIn.symbol} (NEAR)`);
  console.log(`To: ${tokenOut.symbol} (Base)`);
  console.log(`Desired Output: ${amountOut} ${tokenOut.symbol}`);
  console.log(`Recipient: ${recipient}`);
  
  const amountOutSmallest = toSmallestUnit(amountOut, tokenOut.decimals);
  
  const quoteRequest: QuoteRequest = {
    dry: false,
    swapType: QuoteRequest.swapType.EXACT_OUTPUT,  // We want exact output!
    slippageTolerance: 300, // 3%
    originAsset: tokenIn.assetId,
    depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
    destinationAsset: tokenOut.assetId,
    amount: amountOutSmallest,  // This is OUTPUT amount for EXACT_OUTPUT
    refundTo: sender,
    refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
    recipient: recipient,
    recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
    deadline: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    referral: 'openclaw',
    quoteWaitingTimeMs: 5000,
  };
  
  console.log('\n⏳ Requesting quote from 1-Click API...');
  const quoteResponse = await OneClickService.getQuote(quoteRequest);
  
  if (!quoteResponse.quote?.depositAddress) {
    throw new Error('No deposit address in quote response');
  }
  
  const depositAddress = quoteResponse.quote.depositAddress;
  const amountIn = quoteResponse.quote.amountIn || '0';
  const amountInFormatted = fromSmallestUnit(amountIn, tokenIn.decimals);
  
  console.log('\n✅ Quote Received!');
  console.log('================================');
  console.log(`You need to send: ${amountInFormatted} ${tokenIn.symbol}`);
  console.log(`You will receive: ${amountOut} ${tokenOut.symbol}`);
  console.log(`Deposit Address: ${depositAddress}`);
  console.log(`Deadline: ${quoteResponse.quote.deadline}`);
  
  console.log('\n📋 Next Steps:');
  console.log('================================');
  console.log(`1. Send ${amountInFormatted} ${tokenIn.symbol} to:`);
  console.log(`   ${depositAddress}`);
  console.log(`   (This is a NEAR account - use NEAR wallet)`);
  console.log('');
  console.log(`2. Track your swap:`);
  console.log(`   https://explorer.near-intents.org/transactions/${depositAddress}`);
  console.log('');
  console.log(`3. Your ${tokenOut.symbol} will arrive at:`);
  console.log(`   ${recipient} (Base network)`);
  
  return {
    depositAddress,
    amountIn: amountInFormatted,
    amountOut,
    tokenIn: tokenIn.symbol,
    tokenOut: tokenOut.symbol,
    recipient,
    explorerUrl: `https://explorer.near-intents.org/transactions/${depositAddress}`,
  };
}

// Test: USDT on NEAR → 0.5 USDC on Base
getManualQuote({
  assetIn: 'USDT',
  assetOut: 'base:USDC',
  amountOut: '0.5',
  recipient: '0x30FE694284a082a5D1adfF6D25C0B9B6bF61F77D',
}).catch(console.error);
