#!/bin/bash

# Exit if anything fails
set -e

# Step 1: Install base dependencies
pip install -r requirements.txt

# Step 2: Install Talon with no dependencies
pip install talon==1.4.4 --no-deps

# Step 3: Install the packages Talon expects
pip install lxml regex numpy scipy scikit-learn cssselect html5lib six

# Step 4: Patch Talon utils.py to use chardet instead of cchardet
TALON_UTILS=$(python -c "import talon.utils; print(talon.utils.__file__)")
echo "🔧 Patching Talon at $TALON_UTILS"

# Replace both variations
sed -i 's/^import cchardet$/import chardet/g' "$TALON_UTILS"
sed -i 's/^import cchardet as chardet$/import chardet/g' "$TALON_UTILS"

# Verify patch applied
echo "🔍 Verifying patch..."
grep chardet "$TALON_UTILS"

echo "✅ Talon patched successfully."
