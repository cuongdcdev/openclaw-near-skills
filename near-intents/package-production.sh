#!/bin/bash
# Production packaging script for NEAR Intents Skill v2.0.0

set -e

VERSION="2.0.0"
PACKAGE_NAME="near-intents-v${VERSION}"
BUILD_DIR="/tmp/${PACKAGE_NAME}"

echo "📦 Packaging NEAR Intents Skill v${VERSION}"
echo "============================================"

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Copy production files
echo "📋 Copying production files..."

# Core files
cp index.ts "$BUILD_DIR/"
cp package.json "$BUILD_DIR/"
cp package-lock.json "$BUILD_DIR/"
cp manifest.json "$BUILD_DIR/"
cp tsconfig.json "$BUILD_DIR/"
cp .env.example "$BUILD_DIR/"
cp .gitignore "$BUILD_DIR/"
cp LICENSE "$BUILD_DIR/"

# Documentation
cp README.md "$BUILD_DIR/"
cp SKILL.md "$BUILD_DIR/"
cp AI-AGENT-GUIDE.md "$BUILD_DIR/"
cp TOKENS.md "$BUILD_DIR/"
cp USAGE_GUIDE.md "$BUILD_DIR/"
cp INSTALL.md "$BUILD_DIR/"
cp RELEASE_NOTES.md "$BUILD_DIR/"

# Examples directory
echo "📚 Copying examples..."
cp -r lib-1click "$BUILD_DIR/"

# Scripts directory (if needed)
if [ -d "scripts" ]; then
  mkdir -p "$BUILD_DIR/scripts"
  cp scripts/*.ts "$BUILD_DIR/scripts/" 2>/dev/null || true
fi

# Create CHANGELOG
echo "📝 Creating CHANGELOG..."
cat > "$BUILD_DIR/CHANGELOG.md" << 'EOF'
# Changelog

All notable changes to the NEAR Intents Skill will be documented in this file.

## [2.0.0] - 2026-02-15

### Added
- 🛡️ Mandatory `refundAddress` parameter for cross-chain swaps
- ⚠️ Validation and error messages for refund address safety
- 📚 Comprehensive safety documentation in all guides
- ✅ ETH token support for NEAR, Base, and Arbitrum
- 🎯 Production-ready status

### Changed
- 📖 Complete documentation overhaul
- 🔧 Enhanced error messages with context
- 🌐 Updated token map with ETH entries

### Security
- **CRITICAL**: Prevents fund loss from missing refund addresses
- Automatic origin chain detection
- Educational error messages for users

## [1.0.0] - 2026-02-14

### Added
- Initial release with 1Click SDK integration
- Support for 14+ blockchains
- Auto and manual swap modes
- Basic documentation

---

For detailed release notes, see RELEASE_NOTES.md
EOF

# Create quick start guide
echo "🚀 Creating QUICKSTART..."
cat > "$BUILD_DIR/QUICKSTART.md" << 'EOF'
# Quick Start Guide

## Install
```bash
cd /root/.openclaw/skills/
tar -xzf near-intents-v2.0.0.tar.gz
cd near-intents
npm install
```

## Use
```typescript
import { executeIntent } from './index';

// NEAR → Base (no config needed for NEAR origin)
await executeIntent({
  assetIn: 'NEAR',
  assetOut: 'base:USDC',
  amount: '1.0',
  recipient: '0x...',
});

// Base → NEAR (REQUIRES refundAddress!)
await executeIntent({
  assetIn: 'base:USDC',
  assetOut: 'NEAR',
  amount: '0.5',
  recipient: 'user.near',
  refundAddress: '0x...',  // Your Base wallet
  mode: 'manual',
});
```

## ⚠️ Important
Always provide `refundAddress` when swapping FROM non-NEAR chains!

See SKILL.md for full documentation.
EOF

# Exclude files
echo "🚫 Creating exclusion list..."
cat > "$BUILD_DIR/.npmignore" << 'EOF'
# Development files
test-*.ts
swap-*.ts
.env

# Build artifacts
*.log
.DS_Store

# Development dependencies
node_modules/
EOF

echo "✨ Package contents:"
cd "$BUILD_DIR"
ls -lh

# Create tarball
echo ""
echo "📦 Creating tarball..."
cd /tmp
tar -czf "${PACKAGE_NAME}.tar.gz" "$PACKAGE_NAME"

# Move to releases directory
RELEASES_DIR="${RELEASES_DIR:-/root/.openclaw/workspace}"
mkdir -p "$RELEASES_DIR"
mv "${PACKAGE_NAME}.tar.gz" "$RELEASES_DIR/"

# Calculate size
SIZE=$(du -h "$RELEASES_DIR/${PACKAGE_NAME}.tar.gz" | cut -f1)

echo ""
echo "✅ Package created successfully!"
echo "================================================"
echo "📦 File: $RELEASES_DIR/${PACKAGE_NAME}.tar.gz"
echo "📊 Size: $SIZE"
echo ""
echo "📋 Installation:"
echo "   cd /root/.openclaw/skills/"
echo "   tar -xzf $RELEASES_DIR/${PACKAGE_NAME}.tar.gz"
echo "   cd near-intents"
echo "   npm install"
echo ""
echo "🎉 Ready to share!"
