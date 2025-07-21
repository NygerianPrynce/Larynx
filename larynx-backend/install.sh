#!/bin/bash
pip install -r requirements.txt --force-reinstall --no-deps talon
pip install talon==1.4.4 --no-deps
pip install lxml regex numpy scipy scikit-learn cssselect html5lib six
#INSTRUCTIONS TO DOWNLOAD
#chmod +x install.sh
#./install.sh