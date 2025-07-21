#!/bin/bash

# 1. Install Talon and force it to use chardet instead of cchardet
pip install chardet
pip install talon==1.4.4 --no-deps
pip install lxml regex numpy scipy scikit-learn cssselect html5lib six

# 2. Patch Talon’s import to avoid cchardet
python patch_talon.py

# 3. Install all other project dependencies
pip install -r requirements.txt
