#!/bin/bash

# NEAR Intents Skill Packaging Script
# Creates a production-ready tarball for distribution

set -e  # Exit on error

SKILL_NAME="near-intents"
VERSION="1.0.0"
OUTPUT_DIR="$(pwd)"
PACKAGE_NAME="${SKILL_NAME}-v${VERSION}.tar.gz"

echo "📦 Packaging ${SKILL_NAME} v${VERSION}..."

# 1. Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -f "${OUTPUT_DIR}/${PACKAGE_NAME}"
rm -rf dist/ build/
# Remove compiled JS/TS output but keep config files
find . -maxdepth 1 -name "*.js" ! -name "jest.config.js" ! -name "package.sh" -delete
find . -maxdepth 1 -name "*.js.map" -delete
find . -maxdepth 1 -name "*.d.ts" -delete

# 2. Run tests to ensure everything works
echo "🧪 Running tests..."
npm test

# 3. Create a temporary staging directory
TEMP_DIR=$(mktemp -d)
STAGING_DIR="${TEMP_DIR}/${SKILL_NAME}"
mkdir -p "${STAGING_DIR}"

echo "📁 Staging files in ${STAGING_DIR}..."

# 4. Copy essential files
cp -r scripts "${STAGING_DIR}/"
cp -r tests "${STAGING_DIR}/"
cp index.ts "${STAGING_DIR}/"
cp package.json "${STAGING_DIR}/"
cp manifest.json "${STAGING_DIR}/"
cp tsconfig.json "${STAGING_DIR}/"
cp jest.config.js "${STAGING_DIR}/"
cp .env.example "${STAGING_DIR}/"
cp .gitignore "${STAGING_DIR}/"

# 5. Copy documentation
cp README.md "${STAGING_DIR}/"
cp SKILL.md "${STAGING_DIR}/"
cp INSTALL.md "${STAGING_DIR}/"
cp USAGE_GUIDE.md "${STAGING_DIR}/"
cp USE_CASES.md "${STAGING_DIR}/"
cp TOKENS.md "${STAGING_DIR}/"
cp LICENSE "${STAGING_DIR}/"

# 6. Create package info file
cat > "${STAGING_DIR}/PACKAGE_INFO.txt" << EOF
NEAR Intents Skill for OpenClaw
================================

Version: ${VERSION}
Package Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
Package Name: ${PACKAGE_NAME}

Quick Start:
1. Extract: tar -xzf ${PACKAGE_NAME}
2. Install: cd ${SKILL_NAME} && npm install
3. Configure: cp .env.example .env (edit with your NEAR credentials)
4. Test: npm test
5. Deploy: Copy to ~/.openclaw/skills/ and restart OpenClaw

Documentation:
- INSTALL.md - Installation guide
- SKILL.md - Quick reference
- USAGE_GUIDE.md - Detailed usage examples
- USE_CASES.md - Real-world scenarios
- TOKENS.md - Supported tokens reference
- README.md - Full documentation

Support:
- OpenClaw: https://docs.openclaw.ai
- Community: https://discord.com/invite/clawd
- Skills Hub: https://clawhub.com

License: MIT
EOF

# 7. Create tarball
echo "📦 Creating tarball..."
cd "${TEMP_DIR}"
tar -czf "${OUTPUT_DIR}/${PACKAGE_NAME}" "${SKILL_NAME}"

# 8. Calculate checksum
cd "${OUTPUT_DIR}"
CHECKSUM=$(sha256sum "${PACKAGE_NAME}" | awk '{print $1}')

# 9. Create release notes
cat > "${OUTPUT_DIR}/RELEASE_NOTES_${VERSION}.md" << EOF
# NEAR Intents Skill v${VERSION} - Release Notes

**Release Date**: $(date -u +"%Y-%m-%d")

## 📦 Package Information

- **Package**: \`${PACKAGE_NAME}\`
- **Size**: $(du -h "${PACKAGE_NAME}" | awk '{print $1}')
- **SHA256**: \`${CHECKSUM}\`

## ✨ Features

### Universal Cross-Chain Support
- ✅ **Multiple Blockchains**: NEAR, Ethereum, Base, Arbitrum, Solana, BSC, Gnosis, Starknet
- ✅ **Native Chains**: Bitcoin, Dogecoin, Zcash, Litecoin
- ✅ **140+ Tokens**: Comprehensive token support across all chains
- ✅ **Atomic Swaps**: Powered by NEAR Intents and Defuse Protocol

### Smart Features
- 🔄 **Intelligent Routing**: Automatic optimal path selection
- 💰 **Price Checking**: Automatic USD value validation (min $0.20)
- 🎯 **Decimal Handling**: Auto-conversion based on token decimals
- 📊 **Transaction Tracking**: NEAR Blocks integration
- 🛡️ **Error Handling**: Comprehensive error messages and recovery suggestions

### Flexible Usage
- **With NEAR account**: Full NEAR-based operations (swaps, deposits, withdrawals)
- **Without NEAR account**: Cross-chain operations between non-NEAR chains
- **Two-step method**: Reliable cross-chain swaps (swap → withdraw)
- **Direct method**: Fast same-chain swaps

## 📋 What's Included

- ✅ Core IntentsOptimizer implementation
- ✅ Price service (Coingecko integration)
- ✅ Comprehensive test suite (14 tests, all passing)
- ✅ Complete documentation (7 files)
- ✅ Environment templates
- ✅ TypeScript configuration
- ✅ Jest testing setup

## 🚀 Quick Install

\`\`\`bash
# Extract package
tar -xzf ${PACKAGE_NAME}
cd ${SKILL_NAME}

# Install dependencies
npm install

# Configure (optional - only for NEAR-based operations)
cp .env.example .env
# Edit .env with your NEAR credentials

# Test
npm test

# Deploy to OpenClaw
cp -r . ~/.openclaw/skills/${SKILL_NAME}
openclaw gateway restart
\`\`\`

## 📚 Documentation

1. **INSTALL.md** - Step-by-step installation guide
2. **SKILL.md** - Quick reference for agents
3. **USAGE_GUIDE.md** - Detailed usage examples
4. **USE_CASES.md** - Real-world scenarios
5. **TOKENS.md** - Complete token reference
6. **README.md** - Full documentation
7. **PACKAGE_INFO.txt** - Package metadata

## 🔧 Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **OpenClaw**: Latest version recommended
- **NEAR Account**: Optional (only for NEAR-based operations)

## 💡 Use Cases

### Cross-Chain (No NEAR Account)
- Bridge USDC from Base to Solana
- Swap ETH to USDC on Arbitrum
- Send BTC to Ethereum address

### NEAR-Based (Requires NEAR Account)
- Swap NEAR to USDC on Base
- Bridge NEAR to Ethereum
- Deposit NEAR to intents contract

## 🧪 Testing

\`\`\`bash
npm test              # Run all tests
npm run test:coverage # With coverage report
npm run test:watch    # Watch mode
\`\`\`

All 14 unit tests pass ✅

## 🛠️ Technical Details

### Dependencies
- \`near-api-js@^3.0.0\` - NEAR SDK
- \`axios@^1.6.0\` - HTTP client
- \`decimal.js@^10.4.3\` - Precision math
- \`dotenv@^16.3.1\` - Environment config

### Dev Dependencies
- \`jest@^30.2.0\` - Testing framework
- \`ts-jest@^29.4.6\` - TypeScript support for Jest
- \`typescript@^5.0.0\` - TypeScript compiler

### Architecture
- **index.ts** - Main entry point
- **scripts/logic.ts** - Core IntentsOptimizer class
- **scripts/price-service.ts** - Price checking via Coingecko
- **scripts/near-intents-lib/** - Low-level NEAR interactions
- **tests/** - Comprehensive test suite

## 🔒 Security

- ⚠️ Never commit \`.env\` files
- 🔐 Keep private keys secure
- 🌐 Mainnet only (testnet not supported)
- ✅ All transactions verified on NEAR Blocks

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with [near-api-js](https://github.com/near/near-api-js)
- Powered by [Defuse Protocol](https://defuse.xyz)
- Intent system by [Chain Defuser](https://chaindefuser.com)

## 🆘 Support

- **OpenClaw Docs**: https://docs.openclaw.ai
- **NEAR Docs**: https://docs.near.org
- **Community**: https://discord.com/invite/clawd
- **Skills Hub**: https://clawhub.com

## 🎯 Next Steps

After installation:
1. Read INSTALL.md for setup guide
2. Check USAGE_GUIDE.md for examples
3. Review TOKENS.md for supported tokens
4. Try test examples in USE_CASES.md
5. Ask your OpenClaw agent to use the skill!

---

**Packaged by**: OpenClaw Build System  
**Build Date**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")  
**Checksum**: \`${CHECKSUM}\`
EOF

# 10. Cleanup
rm -rf "${TEMP_DIR}"

# 11. Summary
echo ""
echo "✅ Package created successfully!"
echo ""
echo "📦 Package: ${PACKAGE_NAME}"
echo "📏 Size: $(du -h "${PACKAGE_NAME}" | awk '{print $1}')"
echo "🔐 SHA256: ${CHECKSUM}"
echo "📄 Release Notes: RELEASE_NOTES_${VERSION}.md"
echo ""
echo "🚀 To install:"
echo "   tar -xzf ${PACKAGE_NAME}"
echo "   cd ${SKILL_NAME}"
echo "   npm install"
echo ""
echo "📖 Read INSTALL.md for detailed setup instructions"
echo ""
