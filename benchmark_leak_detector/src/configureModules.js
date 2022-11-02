const noNodeJs = false;  // Will be modified by RunBenchmark.ps1
for (const mod of ['MD2', 'MD4', 'MD5', 'SHA1', 'SHA256', 'SHA512']) {
	globalThis[`JS_${mod}_NO_COMMON_JS`] = true;
	if (noNodeJs) globalThis[`JS_${mod}_NO_NODE_JS`] = true;
}
globalThis['HI_BASE64_NO_COMMON_JS'] = true;
if (noNodeJs) globalThis['HI_BASE64_NO_NODE_JS'] = true;
globalThis.window ??= globalThis;
