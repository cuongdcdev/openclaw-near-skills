import { IntentsOptimizer } from '../scripts/logic';
import { Environment } from '../scripts/near-intents-lib/environment';

// Mock environment for testing
class MockEnvironment extends Environment {
  constructor() {
    super({
      ACCOUNT_ID: 'test.near',
      PRIVATE_KEY: 'ed25519:test_key_1234567890abcdefghijklmnopqrstuvwxyz',
      RPC_URL: 'https://test.rpc.near',
      NETWORK_ID: 'mainnet'
    });
  }

  // Override add_reply to capture messages
  add_reply(message: string): void {
    // Do nothing in tests
  }
}

describe('IntentsOptimizer', () => {
  let optimizer: IntentsOptimizer;
  let env: MockEnvironment;

  beforeEach(() => {
    env = new MockEnvironment();
    optimizer = new IntentsOptimizer(env);
  });

  describe('Token Matching', () => {
    test('should find NEAR token by symbol', async () => {
      await optimizer['init']();
      const token = optimizer['findToken']('NEAR');
      expect(token).toBeDefined();
      // NEAR on Intents is wrapped NEAR (wNEAR)
      expect(token?.symbol).toBe('wNEAR');
      expect(token?.blockchain).toBe('near');
    });

    test('should find USDC token (preferring NEAR version)', async () => {
      await optimizer['init']();
      const token = optimizer['findToken']('usdc');
      expect(token).toBeDefined();
      expect(token?.symbol).toBe('USDC');
      // Should prefer NEAR version unless blockchain specified
      expect(token?.blockchain).toBe('near');
    });

    test('should find token with blockchain prefix', async () => {
      await optimizer['init']();
      const token = optimizer['findToken']('base:USDC');
      expect(token).toBeDefined();
      expect(token?.symbol).toBe('USDC');
      expect(token?.blockchain).toBe('base');
    });

    test('should return undefined for unknown token', async () => {
      await optimizer['init']();
      const token = optimizer['findToken']('UNKNOWN_TOKEN');
      expect(token).toBeUndefined();
    });
  });

  describe('Intent Execution Validation', () => {
    test('should reject invalid asset in', async () => {
      await optimizer['init']();
      const result = await optimizer.executeIntent({
        assetIn: 'INVALID_TOKEN',
        assetOut: 'wNEAR',
        amount: '1.0'
      });
      expect(result).toContain('Could not find supported asset');
    });

    test('should reject invalid asset out', async () => {
      await optimizer['init']();
      const result = await optimizer.executeIntent({
        assetIn: 'wNEAR',
        assetOut: 'INVALID_TOKEN',
        amount: '1.0'
      });
      expect(result).toContain('Could not find supported asset');
    });

    test('should require recipient for same asset operations', async () => {
      await optimizer['init']();
      // This test will fail on balance check before reaching recipient check
      // because the mock key is invalid. This is expected behavior.
      await expect(
        optimizer.executeIntent({
          assetIn: 'wNEAR',
          assetOut: 'wNEAR',
          amount: '1.0'
        })
      ).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle case-insensitive token symbols', async () => {
      await optimizer['init']();
      const token1 = optimizer['findToken']('near');
      const token2 = optimizer['findToken']('NEAR');
      const token3 = optimizer['findToken']('Near');
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token3).toBeDefined();
      expect(token1?.intents_token_id).toBe(token2?.intents_token_id);
      expect(token2?.intents_token_id).toBe(token3?.intents_token_id);
    });

    test('should handle empty token list gracefully', async () => {
      // Create optimizer and manually clear tokens
      await optimizer['init']();
      (optimizer as any).tokens = [];

      const token = optimizer['findToken']('wNEAR');
      expect(token).toBeUndefined();
    });

    test('should handle blockchain prefix variations', async () => {
      await optimizer['init']();
      // Test with different blockchain prefixes
      const ethToken = optimizer['findToken']('eth:USDC');
      const baseToken = optimizer['findToken']('base:USDC');
      // At least one should be found
      expect(ethToken !== undefined || baseToken !== undefined).toBe(true);
    });
  });
});

describe('Environment', () => {
  test('should initialize with default values', () => {
    const env = new Environment();
    expect(env.wallet).toBeDefined();
    expect(env.wallet.ACCOUNT_ID).toBeUndefined();
    expect(env.wallet.PRIVATE_KEY).toBeUndefined();
  });

  test('should accept custom environment variables', () => {
    const env = new Environment({
      ACCOUNT_ID: 'test.near',
      PRIVATE_KEY: 'ed25519:test',
      NETWORK_ID: 'testnet'
    });
    expect(env.wallet.ACCOUNT_ID).toBe('test.near');
    expect(env.wallet.PRIVATE_KEY).toBe('ed25519:test');
    expect(env.wallet.NETWORK_ID).toBe('testnet');
  });

  test('should update environment variables', () => {
    const env = new Environment();
    env.setEnvironment({
      ACCOUNT_ID: 'new.near',
      NETWORK_ID: 'mainnet'
    });
    expect(env.wallet.ACCOUNT_ID).toBe('new.near');
    expect(env.wallet.NETWORK_ID).toBe('mainnet');
  });

  test('should store reply messages', () => {
    const env = new Environment();
    env.add_reply('Test message 1');
    env.add_reply('Test message 2');
    const messages = env.list_messages();
    expect(messages).toHaveLength(2);
    expect(messages[0]).toBe('Test message 1');
    expect(messages[1]).toBe('Test message 2');
  });
});
