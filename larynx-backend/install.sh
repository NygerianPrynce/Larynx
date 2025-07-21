#!/bin/bash
pip install -r requirements.txt 
pip install talon==1.4.4 --no-deps
pip install lxml regex numpy scipy scikit-learn cssselect html5lib six
python patch_talon.py

#INSTRUCTIONS TO DOWNLOAD
#chmod +x install.sh
#./install.sh