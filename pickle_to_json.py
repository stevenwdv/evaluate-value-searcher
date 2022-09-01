#!/usr/bin/env python3

import pickle
import sys

_, in_pkl_file = sys.argv

with open(in_pkl_file, 'rb') as f:
	pickle.load(f).to_json('leaks.json.gz', orient='records')
