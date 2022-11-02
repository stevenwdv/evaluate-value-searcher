#!/bin/sh

set -e
cd "$(dirname "$0")"

python3 -m venv --upgrade-deps ./venv/
if [ -e ./venv/bin/activate ]
then
  . ./venv/bin/activate
else
  . ./venv/Scripts/activate
fi

pip3 install wheel
pip3 install --requirement ./requirements.txt
