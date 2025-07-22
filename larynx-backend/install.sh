#!/bin/bash

# Exit immediately on error
set -e

echo "📦 Installing base dependencies..."
pip install -r requirements.txt

echo "📦 Installing Talon (no deps)..."
pip install talon==1.4.4 --no-deps

echo "📦 Installing Talon dependencies..."
pip install lxml regex numpy scipy scikit-learn cssselect html5lib six

echo "🔍 Locating Talon utils.py..."

# Use find to locate the Talon utils.py path WITHOUT importing
TALON_UTILS=$(find $(pip show talon | grep Location | awk '{print $2}') -type f -path "*/talon/utils.py")

if [ -z "$TALON_UTILS" ]; then
  echo "❌ Failed to locate talon/utils.py"
  exit 1
fi

echo "🔧 Patching Talon at: $TALON_UTILS"

# Replace any cchardet import with chardet
sed -i 's/^import cchardet$/import chardet/g' "$TALON_UTILS"
sed -i 's/^import cchardet as chardet$/import chardet/g' "$TALON_UTILS"

echo "✅ Patch applied. Verifying:"
grep chardet "$TALON_UTILS"

echo "🎉 Talon is patched and ready!"
