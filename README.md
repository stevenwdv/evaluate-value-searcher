Prepare:

```shell
# Optional venv
python3 -m venv --upgrade-deps ./venv/
. ./venv/bin/activate  # . ./venv/Scripts/activate for Windows

pip3 install --requirement requirements.txt
npm run pickle-to-json path/to/leaks.pkl
```

Check if value-searcher can find all leaks in the Pickle:

```shell
npm run check-known-leaks
```

Check also if value-searcher can find extra leaks in the requests from `./jsons.tar.lz4` (requires `tar` and `lz4` packages):

```shell
npm run check-all-requests
```
