#!/usr/bin/env pwsh

(cat ./benchmark_leak_detector/src/configureModules.js) -replace 'noNodeJs = false', 'noNodeJs = true' | Set-Content ./benchmark_leak_detector/src/configureModules.js
npx tsc --project ./benchmark_leak_detector/tsconfig.json --outFile ./benchmark_leak_detector/out/bundle_no_nodejs.js
npx tsc --project ./benchmark_leak_detector/tsconfig.browser.json --outFile ./benchmark_leak_detector/out/bundle_browser.js
(cat ./benchmark_leak_detector/src/configureModules.js) -replace 'noNodeJs = true', 'noNodeJs = false' | Set-Content ./benchmark_leak_detector/src/configureModules.js
npx tsc --project ./benchmark_leak_detector/tsconfig.json --outFile ./benchmark_leak_detector/out/bundle_nodejs.js

$python = 'python3'
if (Test-Path ./benchmark_leak_detector_py/venv/)
{
    if (Test-Path ./benchmark_leak_detector_py/venv/bin/)
    {
        $python = './benchmark_leak_detector_py/venv/bin/python'
    }
    else
    {
        $python = './benchmark_leak_detector_py/venv/Scripts/python'
    }
}

$cases = @(
@{ needle = 'info@example.com'; haystack = '{"email": "info@example.com"}' }
@{ needle = 'hello'; haystack = '68656c6c6f' }
@{ needle = '"some value!" 😎'; haystack = '{"val":"\"some value!\" \ud83d\ude0e"}' }
@{ needle = 'hi & hello'; haystack = 'hi &amp; hello' }
@{ needle = 'hello'; haystack = 'eJzLSM3JyQcABiwCFQ==' }
@{ needle = 'hello'; haystack = '{"val":"eyJ2YWwiOiJoZWxsbyJ9"}' }
@{ needle = 'cosicadam0+marriott.fr@gmail.c'; haystack = 'v=2&r=https%3A%2F%2Fwww.marriott.fr%2Fdefault.mi&sn=7&p=e8e0c7c2-95f2-413d-aed0-7eefac19b6a9&seg=%2Fdefault.mi&sp=&pssn=0&e=kpg5xprn~0~2%23user-id~EY29zaWNhZGFtMCttYXJyaW90dC5mckBnbWFpbC5jb20%3D~ft.0_gpe*vn.2_dXNlcklE*ei.2_dXNlci1pZA%3D%3D*selectorActionCount.0_2*eventId.0_2o~-~r32044122084~~kpg5xq7n~29~-~Nb7_ch~ft.0_0*ei.2_cGFzc3dvcmQ%3D*selectorActionCount.0_4*eventId.0_2t~-~~kpg5xq8k~3~2%23password~-~vn.2_cGFzc3dvcmQ%3D*co.3_YjhfY2g%3D*ei.2_cGFzc3dvcmQ%3D*sy.3_NThfYnE%3D*selectorActionCount.0_1*eventId.0_2v~-~r451606737&dom=11H4sIAAAAAAAAA62SS2%2FbMAzHv0rAXlYsLizZTRwXKPY8FNi6AOt2aXtQLTohoNckua1X5LtPTpohzR7A0Pkgk6L0J38ULx%2FAYws1FDwvS8Z5XpUwhs5JERHqB4ikMUShHdR8DM5bhz4Sho9WpjhoK6kllJ%2BM6tO9W%2FSBrEkBnjxp9dulMAsMgxJjFRv%2BIkZPN13c7IbYq3WiW6G6QVFScEr09ahVeH8ysk40FJPLTpKi9ZKMUFAX5XS1GkNAhU20Pt07aMnITGRLG1GlVeNcLDBrrden786%2B1vjtBTvcWvmedfp5%2Fvp846YszZKU9GiGsn5m5DP%2BGPlAIUJ9CRHvY%2F0%2BBNHj99EVvEGvyFwBXA%2BVMZ7%2FT9rZc2iTteVjf%2BGr%2FoWvKGa%2F4SO5A2c6pXYhJsU%2BhBZkshsr%2B%2BzOC5cma1sxP4ThLBnXxbVwUVbVbt8aG6gRUuj8pRbek43xqPWvFklRHTVWw5NEZ%2BfzLxcHXUCfpQpX6Rtv5748ZpN8Mi2mf5r64nlTXxyX%2FNc%2Bxd49GYOh1bsPnu91agPgRAh36cya4PoHPxXICbsDAAA%3D' }
@{ needle = 'not there'; haystack = 'v=2&r=https%3A%2F%2Fwww.marriott.fr%2Fdefault.mi&sn=7&p=e8e0c7c2-95f2-413d-aed0-7eefac19b6a9&seg=%2Fdefault.mi&sp=&pssn=0&e=kpg5xprn~0~2%23user-id~EY29zaWNhZGFtMCttYXJyaW90dC5mckBnbWFpbC5jb20%3D~ft.0_gpe*vn.2_dXNlcklE*ei.2_dXNlci1pZA%3D%3D*selectorActionCount.0_2*eventId.0_2o~-~r32044122084~~kpg5xq7n~29~-~Nb7_ch~ft.0_0*ei.2_cGFzc3dvcmQ%3D*selectorActionCount.0_4*eventId.0_2t~-~~kpg5xq8k~3~2%23password~-~vn.2_cGFzc3dvcmQ%3D*co.3_YjhfY2g%3D*ei.2_cGFzc3dvcmQ%3D*sy.3_NThfYnE%3D*selectorActionCount.0_1*eventId.0_2v~-~r451606737&dom=11H4sIAAAAAAAAA62SS2%2FbMAzHv0rAXlYsLizZTRwXKPY8FNi6AOt2aXtQLTohoNckua1X5LtPTpohzR7A0Pkgk6L0J38ULx%2FAYws1FDwvS8Z5XpUwhs5JERHqB4ikMUShHdR8DM5bhz4Sho9WpjhoK6kllJ%2BM6tO9W%2FSBrEkBnjxp9dulMAsMgxJjFRv%2BIkZPN13c7IbYq3WiW6G6QVFScEr09ahVeH8ysk40FJPLTpKi9ZKMUFAX5XS1GkNAhU20Pt07aMnITGRLG1GlVeNcLDBrrden786%2B1vjtBTvcWvmedfp5%2Fvp846YszZKU9GiGsn5m5DP%2BGPlAIUJ9CRHvY%2F0%2BBNHj99EVvEGvyFwBXA%2BVMZ7%2FT9rZc2iTteVjf%2BGr%2FoWvKGa%2F4SO5A2c6pXYhJsU%2BhBZkshsr%2B%2BzOC5cma1sxP4ThLBnXxbVwUVbVbt8aG6gRUuj8pRbek43xqPWvFklRHTVWw5NEZ%2BfzLxcHXUCfpQpX6Rtv5748ZpN8Mi2mf5r64nlTXxyX%2FNc%2Bxd49GYOh1bsPnu91agPgRAh36cya4PoHPxXICbsDAAA%3D' }
@{ needle = '"some value!" 😎'; haystack = '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' }
)

foreach ($i in 0..($cases.Length - 1))
{
    $case = $cases[$i]
    echo "`n==== Case $i ===="
    echo $case.needle
    echo $case.haystack.Substring(0,[System.Math]::Min(60, $case.haystack.length))
    echo ''

    echo '> value-searcher F F'
    node --require ts-node/register ./src/benchmark.ts false false $case.needle $case.haystack
    echo ''

    echo '> value-searcher T F'
    node --require ts-node/register ./src/benchmark.ts true false $case.needle $case.haystack
    echo ''

    echo '> value-searcher T T'
    node --require ts-node/register ./src/benchmark.ts true true $case.needle $case.haystack
    echo ''

    echo '> leak-detector nodejs'
    node --no-deprecation --openssl-legacy-provider ./benchmark_leak_detector/out/bundle_nodejs.js $case.needle $case.haystack
    echo ''

    echo '> leak-detector no nodejs'
    node ./benchmark_leak_detector/out/bundle_no_nodejs.js $case.needle $case.haystack
    echo ''

    echo '> leak-detector-py'
    &$python ./benchmark_leak_detector_py/benchmark_leak_detector.py $case.needle $case.haystack
    echo ''
}
