import axios from 'axios';
import { Decimal } from 'decimal.js';
import * as fs from 'fs';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import * as nacl from 'tweetnacl';
import { Environment } from './environment';
import { 
  getWithdrawMessageToSign, 
  getIntentSettledStatus, 
  generateNonce, 
  base64ToUint8array, 
  serializeIntent 
} from './utils';
import { intentSwap } from './swap';

// Constants
const defaultMainnetRpc = "https://free.rpc.fastnear.com";
const INTENTS_CONTRACT = "intents.near";
const url = "https://solver-relay-v2.chaindefuser.com/rpc";
const headers = { "Content-Type": "application/json" };
const ED_PREFIX = "ed25519:";  
const FT_DEPOSIT_GAS = BigInt("30000000000000");
const FT_TRANSFER_GAS = BigInt("50000000000000");
const FT_MINIMUM_STORAGE_BALANCE_LARGE = BigInt("1250000000000000000000");


/**
 * Withdraw tokens from the Intents contract
 * @param env The environment
 * @param token Token symbol
 * @param amount Amount to withdraw. Can be a fixed amount (e.g. "10.5") or a percentage (e.g. "50%").
 *               If percentage is used, it calculates based on the total balance of the token and its variants.
 * @param receiverId Receiver ID
 * @param data Token data
 * @param tokenData Specific token data
 * @returns True if withdrawal successful, false otherwise
 */
export async function withdrawFromIntents(
  env: Environment,
  token: string,
  amount: string,
  receiverId: string,
  data: any[],
  tokenData: any
): Promise<boolean> {
  const userAccountId = env.wallet.ACCOUNT_ID || '';
  const userPrivateKey = env.wallet.PRIVATE_KEY || '';
  const near = await env.set_near(userAccountId, userPrivateKey);
  
  // Handle percentage amount
  if (amount.trim().endsWith('%')) {
    try {
      const percent = new Decimal(amount.replace('%', '').trim());
      
      // Get all variants to calculate total balance
      const tokenList = data.filter((obj: any) => obj.symbol === token.toUpperCase());
      const contractList = tokenList.map((obj: any) => obj.intents_token_id);
      
      // If no variants found (shouldn't happen if tokenData exists), use just the target
      const tokensToQuery = contractList.length > 0 ? contractList : [tokenData.intents_token_id];
      
      const balanceResult = await near.viewFunction({
        contractId: "intents.near",
        methodName: "mt_batch_balance_of",
        args: {
          account_id: userAccountId,
          token_ids: tokensToQuery,
        }
      });
      
      let totalBalance = new Decimal(0);
      
      if (balanceResult) {
        balanceResult.forEach((bal: string, index: number) => {
          // If we used tokenList, use corresponding decimals. Otherwise use tokenData.
          const tData = tokenList.length > 0 ? tokenList[index] : tokenData;
          const humanBal = new Decimal(bal).div(new Decimal(10).pow(tData.decimals));
          totalBalance = totalBalance.plus(humanBal);
        });
      }
      
      // Calculate target amount
      const calculatedAmount = totalBalance.mul(percent).div(100);
      amount = calculatedAmount.toString();
      
      console.log(`[Withdraw] Resolved ${percent}% of total balance ${totalBalance} = ${amount} ${token}`);
    } catch (error) {
      console.error("Error calculating percentage amount:", error);
      return false;
    }
  }

  // Convert amount to the token's decimals
  const decimalAmount = new Decimal(amount)
    .mul(new Decimal(10).pow(tokenData.decimals))
    .toFixed(0);
  
  // Check if amount is above minimum withdrawal amount
  const minWithdrawVal = tokenData.min_withdraw_amount || '0';
  const minWithdrawAmount = new Decimal(minWithdrawVal)
    .mul(new Decimal(10).pow(tokenData.decimals))
    .toFixed(0);
    
  if (new Decimal(decimalAmount).lt(new Decimal(minWithdrawAmount))) {
    env.add_reply(
      `You need to withdraw at minimum ${minWithdrawVal} ${token} or else you may lose your money.`
    );
    return false;
  }
  
  const contractId = tokenData.intents_token_id.replace("nep141:", "");
  
  // Check if we need to swap other variants of the token
  const tokenList = data.filter((obj: any) => obj.symbol === token.toUpperCase());
  
  if (tokenList.length > 1) {
    const contractList = tokenList.map((obj: any) => obj.intents_token_id);
    
    // Get balances for all token variants
    const balanceResult = await near.viewFunction({
      contractId: "intents.near",
      methodName: "mt_batch_balance_of",
      args: {
        account_id: userAccountId,
        token_ids: contractList,
      }
    });
    
    // Find the index of our target token
    const targetIndex = contractList.indexOf(tokenData.intents_token_id);
    
    // Convert balances to human-readable format
    let result = balanceResult.map((balance: string, index: number) => {
      return new Decimal(balance).div(
        new Decimal(10).pow(tokenList[index].decimals)
      ).toString();
    });
    
    // Check if we need to swap other variants to get enough of our target
    for (let i = 0; i < tokenList.length; i++) {
      if (i === targetIndex || new Decimal(result[i]).equals(0)) {
        continue;
      }
      
      // If we already have enough of our target token, break
      if (new Decimal(result[targetIndex]).gte(new Decimal(amount))) {
        break;
      }
      
      // Swap this variant to our target token
      const swapResult = await intentSwap(
        env, 
        tokenList[i].symbol, 
        tokenData.symbol, 
        result[i], 
        data, 
        tokenList[i].intents_token_id, 
        tokenData.intents_token_id
      );
      
      if (!swapResult) {
        console.log(`Failed to swap variant ${tokenList[i].symbol} to target token`);
        continue;
      }

      // Update balances
      result[i] = '0';
      result[targetIndex] = new Decimal(result[targetIndex]).plus(swapResult.amountOut).toString();
    }
  }
  
  // Check if we have enough balance for the withdrawal
  const finalBalanceResult = await near.viewFunction({
    contractId: "intents.near",
    methodName: "mt_batch_balance_of",
    args: {
      account_id: userAccountId,
      token_ids: [tokenData.intents_token_id],
    }
  });
  
  // Handle case where balance result is null or undefined
  const availableBalance = finalBalanceResult && finalBalanceResult[0] ? finalBalanceResult[0] : '0';
  
  console.log(`Withdraw debug: Available balance: ${availableBalance}, Requested: ${decimalAmount}`);

  let finalDecimalAmount = new Decimal(amount)
    .mul(new Decimal(10).pow(tokenData.decimals))
    .toFixed(0);

  if (new Decimal(decimalAmount).gt(new Decimal(availableBalance))) {
    env.add_reply(`Amount ${decimalAmount} is more than the maximum available amount ${availableBalance} to withdraw. Withdrawing the complete amount`);
    finalDecimalAmount = availableBalance;
    // Update human readable amount for consistency if needed, assuming availableBalance is integer string
    amount = new Decimal(availableBalance).div(new Decimal(10).pow(tokenData.decimals)).toString();
  }

  if (new Decimal(finalDecimalAmount).lte(0)) {
    env.add_reply(`Error: Withdrawal amount is 0. Available balance: ${availableBalance}`);
    return false;
  }

  // Generate nonce first so it can be used in both the message and the payload
  const nonce = generateNonce();
  const nonceUint8array = base64ToUint8array(nonce);

  const messageStr = await getWithdrawMessageToSign(
    env,
    userAccountId,
    contractId,
    receiverId,
    finalDecimalAmount,
    tokenData.blockchain
  );
  
  const quoteHashSolver = serializeIntent(messageStr, INTENTS_CONTRACT, nonceUint8array);
  
  // Sign the message
  // Remove the ED_PREFIX if present
  const privateKeyBase58 = userPrivateKey.startsWith(ED_PREFIX) 
    ? userPrivateKey.substring(ED_PREFIX.length) 
    : userPrivateKey;
    
  // Handle potential underscores in the private key (sometimes present in env vars or config)
  const cleanPrivateKey = privateKeyBase58.replace(/_/g, '');
    
  const privateKeyBytes = bs58.decode(cleanPrivateKey);
  
  // If the key is 32 bytes (seed), we can use it directly to generate the keypair
  // If it's 64 bytes (full key), we take the first 32 bytes as seed
  let privateKeySeed;
  if (privateKeyBytes.length === 32) {
    privateKeySeed = privateKeyBytes;
  } else if (privateKeyBytes.length === 64) {
    privateKeySeed = privateKeyBytes.slice(0, 32);
  } else {
    throw new Error(`Invalid private key length: ${privateKeyBytes.length}. Expected 32 or 64 bytes.`);
  }

  const signingKeyPair = nacl.sign.keyPair.fromSeed(privateKeySeed);
  
  // Sign the hash
  const signature = nacl.sign.detached(Buffer.from(quoteHashSolver), signingKeyPair.secretKey);
  const finalSignature = bs58.encode(signature);
  
  // Get public key
  const publicKeyBase58 = bs58.encode(signingKeyPair.publicKey);
  
  // Create the intent publish request
  const publishRequest = {
    id: 1,
    jsonrpc: "2.0",
    method: "publish_intent",
    params: [
      {
        quote_hashes: [],
        signed_data: {
          payload: {
            message: messageStr,
            nonce: nonce,
            recipient: INTENTS_CONTRACT,
          },
          standard: "nep413",
          signature: `ed25519:${finalSignature}`,
          public_key: `ed25519:${publicKeyBase58}`,
        }
      }
    ]
  };
  
  try {
    // Publish the intent
    const response = await axios.post(url, publishRequest, { headers });
    
    if (response.data.result.status === "OK") {
      const intentHash = response.data.result.intent_hash;
      
      // Check if intent was settled
      const [settled, result] = await getIntentSettledStatus(intentHash);
      
      if (settled) {
        const transactionHash = result.result.data.hash;
        env.add_reply(`Transaction Hash: ${transactionHash}`);
        return true;
      } else {
        console.error("Intent Settlement Failed:", JSON.stringify(result));
        return false;
      }
    } else {
      console.error("Publish Intent Failed:", JSON.stringify(response.data));
      return false;
    }
  } catch (error) {
    console.error('Error withdrawing from Intents:', error);
    return false;
  }
}
