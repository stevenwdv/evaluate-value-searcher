**See [`./RESULTS.md`](./RESULTS.md) for evaluation results.**

Clone repository including submodules:

```shell
git clone --recurse-submodules https://github.com/stevenwdv/evaluate-value-searcher.git
```

Install dependencies:

```shell
npm install
```

## Check how many known leaks value-searcher finds

Convert leaks.pkl to JSON:

```shell
# Optional venv
python3 -m venv --upgrade-deps ./venv/
. ./venv/bin/activate  # . ./venv/Scripts/activate for Windows

pip3 install --requirement ./requirements.txt
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

## Run comparison

Requires PowerShell Core

```shell
./benchmark_leak_detector_py/setup_venv.sh
./RunBenchmark.ps1
```

Now open `./benchmark_leak_detector/browser_tests.html` to run LeakDetector.js browser speed benchmark.
