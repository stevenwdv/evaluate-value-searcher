# Evaluation Results

Leaks value-searcher found that LeakDetector.py also found: **12621** / **12621**

- ... with `endWithNonReversibleLayer=true`: 12616 / **12621**

## Speed comparison

| Query  /  time (ms)                                                                            | **value-searcher**[^vs] | LeakDetector.js[^ldjs] | LeakDetector.py |
|------------------------------------------------------------------------------------------------|-------------------------|------------------------|-----------------|
| `info@example.com` in `{"email": "info@example.com"}`                                          | 0.13 / 0.12 / 0.12      | 0.88 / 0.86 / 0.49     | **0.065**       |
| HEX-encoded value                                                                              | **0.12** / 3.8 / 3.6    | ✘ 2.6 / 1.7 / 0.82     | ✘ 0.15          |
| JSON-escaped value                                                                             | 11 / 2.9 / **2.7**      | ✘ 2.7 / 1.9 / 0.91     | ✘ 0.15          |
| HTML / XML-escaped value                                                                       | **0.13** / 1.4 / 1.3    | ✘ 1.8 / 1.9 / 0.78     | ✘ 0.25          |
| Zlib-compressed value                                                                          | **0.18** / 7.1 / 6.7    | ✘ 3.2 / 1.7 / 0.69     | 0.25            |
| JSON structure containing Base64-encoded JSON structure containing value                       | 19 / 4.4 / **4.3**      | ✘ 2.6 / 1.7 / 0.73     | ✘ 0.15          |
| value in poorly-delimited Base64-encoded substring from Glassbox Digital                       | **0.15** / ✘68 / ✘67    | 40 / 23 / 9.8          | 1.8             |
| value *that is not present* in poorly-delimited Base64-encoded substring from Glassbox Digital | ✗ 475 / 105 / 103       | ✗ 73 / 38 / 14         | ✗ **3.0**       |
| unicode value in Base64-encoded Zlib-compressed JSON structure from Microsoft Clarity          | 1862 / 378 / **370**    | ✘ 142 / 56 / 22        | ✘ 9.9           |

✘ = Could not find value

[^vs]: `endWithNonReversibleLayer=false`  /  `endWithNonReversibleLayer=true`  /  `endWithNonReversibleLayer=true` & no stack trace

[^ldjs]: Node.js / Node.js with pure-JS crypto etc. / Firefox
