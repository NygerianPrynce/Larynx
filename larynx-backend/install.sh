
#!/bin/bash

# Exit on failure
set -e

# 1. Install all dependencies except Talon
pip install -r requirements.txt

# 2. Install Talon WITHOUT dependencies
pip install talon==1.4.4 --no-deps
pip install lxml regex numpy scipy scikit-learn cssselect html5lib six

# 3. Patch Talon to use chardet instead of cchardet
TALON_UTILS=$(python -c "import talon.utils; print(talon.utils.__file__)")
echo "Patching Talon utils.py at: $TALON_UTILS"
sed -i 's/import cchardet as chardet/import chardet/g' "$TALON_UTILS"

# 4. Confirm it's patched
grep chardet "$TALON_UTILS"

echo "✅ Finished installing and patching Talon."
