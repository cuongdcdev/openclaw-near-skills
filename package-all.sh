#!/bin/bash
# Script to package all NEAR skills for sharing
set -e

# Configuration
# Get the directory where this script is located
WORKSPACE_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
RELEASES_DIR="${WORKSPACE_ROOT}/releases"

echo "🚀 Starting to package all NEAR skills..."
echo "📂 Releases will be saved in: ${RELEASES_DIR}"
echo ""

# Ensure releases directory exists
mkdir -p "${RELEASES_DIR}"

# 1. near-tools
echo "📦 Packaging near-tools..."
cd "${WORKSPACE_ROOT}/near-tools"
tar -czf "${RELEASES_DIR}/near-tools-v1.0.0.tar.gz" \
  --exclude='node_modules' --exclude='.git*' \
  .
echo "✅ near-tools packaged."
echo ""

# 2. near-getpay
echo "📦 Packaging near-getpay..."
cd "${WORKSPACE_ROOT}/near-getpay"
tar -czf "${RELEASES_DIR}/near-getpay-v1.0.0.tar.gz" \
  --exclude='node_modules' --exclude='.env' --exclude='.git*' \
  .
echo "✅ near-getpay packaged."
echo ""

# 3. near-intents
echo "📦 Packaging near-intents..."
cd "${WORKSPACE_ROOT}/near-intents"
chmod +x package-production.sh
# Set RELEASES_DIR for the script
export RELEASES_DIR="${RELEASES_DIR}"
./package-production.sh
echo "✅ near-intents packaged."
echo ""

echo "✨ All skills have been packaged successfully in ${RELEASES_DIR}"
ls -lh "${RELEASES_DIR}"
