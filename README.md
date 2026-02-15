# NEAR Skills Collection for OpenClaw

A useful suite of NEAR Protocol skills for OpenClaw.

[![OpenClaw](https://img.shields.io/badge/OpenClaw-Skills-blue)](https://openclaw.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![NEAR Protocol](https://img.shields.io/badge/NEAR-Protocol-000000?logo=near)](https://near.org)

## 📦 Skills Included

### 1. [near-tools](./near-tools) — NEAR CLI Setup & Management

> **Install and use the NEAR Protocol CLI with AI agents**

**Use when**: Installing NEAR CLI, managing accounts, checking balances, staking, or interacting with smart contracts.

**Features**:
- ✅ Multi-platform installation guides (Linux, macOS, Windows, WSL)
- ✅ Account management (create, import, export, view)
- ✅ Token operations (NEAR, FT, NFT)
- ✅ Staking management
- ✅ Smart contract deployment and interaction
- ✅ Transaction operations

**Quick start**:
```bash
# Install NEAR CLI
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/near/near-cli-rs/releases/latest/download/near-cli-rs-installer.sh | sh

# View account
near account view-account-summary cuongdcdev.near network-config mainnet now
```

---

### 2. [near-getpay](./near-getpay) — Crypto Payment Pages

> **Accept NEAR, USDC, USDT payments via beautiful hosted payment pages leveraging Ping pay and HOT Pay**

**Use when**: Setting up payment pages, accepting donations, selling digital products, or receiving crypto payments.

**Features**:
- ✨ Beautiful mobile-responsive UI
- 💰 Multi-token support (NEAR, USDC, USDT)
- 🔄 Dual provider (PingPay or HOT PAY)
- 🌐 Public URLs via localhost.run
- 🧙 Setup wizard for first-time users
- 🔒 Secure (no private keys needed)
- 🎯 Smart token selection

**Quick start**:
```bash
cd near-getpay
npm install
cp .env.example .env
# Edit .env with your PingPay API key
./start.sh
# Share the generated URL!
```

---

### 3. [near-intents](./near-intents) — Universal Cross-Chain Swap & Bridge

> **Swap and bridge tokens across 14+ blockchains using NEAR Intents**

**Use when**: Swapping tokens, bridging assets between chains, or executing cross-chain transfers.

**Features**:
- 🌐 14+ blockchain support (NEAR, Base, Ethereum, Arbitrum, Solana, Bitcoin, etc.)
- 🔄 Auto & Manual modes
- 🛡️ Refund address protection for safety
- 💱 Exact input/output support
- 📊 Real-time status tracking
- ⚡ Fee optimization with JWT

**Supported chains**: NEAR, Base, Ethereum, Arbitrum, Solana, BSC, Gnosis, Starknet, Bitcoin, Dogecoin, Zcash, Litecoin

**Quick start**:
```bash
cd near-intents
npm install
cp .env.example .env
# Edit .env with your NEAR credentials (for auto mode)

# Example: Swap NEAR to Base USDC
npx ts-node -e "
import { executeIntent } from './index';
await executeIntent({
  assetIn: 'NEAR',
  assetOut: 'base:USDC',
  amount: '1.0',
  recipient: '0xYourBaseAddress',
});
"
```

---

## 🚀 Installation

### Install All Skills

```bash
# Clone the repository
cd /root/.openclaw/skills/
git clone https://github.com/cuongdcdev/openclaw-near-skills.git
cd openclaw-near-skills/near-skills

# Install each skill
cd near-tools && npm install && cd ..
cd near-getpay && npm install && cd ..
cd near-intents && npm install && cd ..
```

### Install Individual Skills

Each skill is self-contained and can be used independently:

```bash
cd /root/.openclaw/skills/
git clone https://github.com/cuongdcdev/openclaw-near-skills.git
cd openclaw-near-skills/near-skills/near-intents  # or near-getpay
npm install
```

---

## 📚 Documentation

Each skill has comprehensive documentation:

| Skill | Main Docs | Additional |
|-------|-----------|------------|
| **near-tools** | [README.md](./near-tools/README.md) | [SKILL.md](./near-tools/SKILL.md) |
| **near-getpay** | [README.md](./near-getpay/README.md) | [SKILL.md](./near-getpay/SKILL.md) |
| **near-intents** | [README.md](./near-intents/README.md) | [SKILL.md](./near-intents/SKILL.md), [AI-AGENT-GUIDE.md](./near-intents/AI-AGENT-GUIDE.md), [TOKENS.md](./near-intents/TOKENS.md), [USAGE_GUIDE.md](./near-intents/USAGE_GUIDE.md), [INSTALL.md](./near-intents/INSTALL.md) |

---

## 🎯 Use Cases

### For Developers
- **Accept payments** on your website (near-getpay)
- **Swap tokens** programmatically (near-intents)
- **Manage NEAR accounts** from the command line (near-tools)
- **Bridge assets** between blockchains (near-intents)

### For AI Agents
- **Help users install NEAR CLI** and verify installations (near-tools)
- **Create payment pages** for donations or sales (near-getpay)
- **Execute cross-chain swaps** with safety checks (near-intents)
- **Check account balances** and staking status (near-tools)

### For End Users
- **Pay in crypto** via beautiful UI (near-getpay)
- **Swap tokens** across chains (near-intents)
- **Manage NEAR assets** easily (near-tools)

---

## 🛠️ Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **OS**: Linux, macOS, Windows (WSL recommended)
- **NEAR Account**: Required for near-getpay and near-intents auto mode
- **API Keys**: PingPay or HOT PAY for near-getpay

---

## 🔐 Security

All skills follow security best practices:

- ✅ **Never commit** `.env` files
- ✅ **Use environment variables** for secrets
- ✅ **Validate inputs** before execution
- ✅ **Require user confirmation** for sensitive operations
- ✅ **Provide refund addresses** for cross-chain swaps

**near-intents safety**: Always asks for refund addresses on cross-chain swaps to prevent permanent fund loss.


---

## 🐛 Troubleshooting

### near-tools
- **"near: command not found"** → Add to PATH or use absolute path
- **Permission denied** → Check file permissions

### near-getpay
- **No provider configured** → Visit `/setup` page
- **Tunnel closed** → Restart server

### near-intents
- **Token not found** → Check symbol and chain prefix
- **Swap failed** → Check refund address validity
- **Authentication error** → Verify JWT token

See individual skill READMEs for detailed troubleshooting.

---

## 📝 License

All skills are licensed under the MIT License. See individual LICENSE files for details.

---

## 🙏 Credits

- **NEAR Protocol** — Blockchain infrastructure
- **OpenClaw** — AI agent framework
- **PingPay & HOT PAY** — Payment gateways
- **NEAR Intents** — Cross-chain swaps
- **Defuse Protocol** — 1Click SDK

---

**Made with 🤖 for OpenClaw**

**Version**: 1.0.0  
**Last Updated**: 2026-02-15  
**Author**: cuongdcdev
# openclaw-near-skills
