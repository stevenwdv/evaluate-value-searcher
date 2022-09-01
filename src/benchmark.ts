#!npx ts-node

import ValueSearcher from 'value-searcher';

void (async () => {
	const searcher = new ValueSearcher();
	await searcher.addValue(Buffer.from('cosicadam0+marriott.fr@gmail.c'));
	const start = Date.now();
	for (let i = 0; i < 1000; ++i)
		await searcher.findValueIn(Buffer.from('v=2&r=https%3A%2F%2Fwww.marriott.fr%2Fdefault.mi&sn=7&p=e8e0c7c2-95f2-413d-aed0-7eefac19b6a9&seg=%2Fdefault.mi&sp=&pssn=0&e=kpg5xprn~0~2%23user-id~EY29zaWNhZGFtMCttYXJyaW90dC5mckBnbWFpbC5jb20%3D~ft.0_gpe*vn.2_dXNlcklE*ei.2_dXNlci1pZA%3D%3D*selectorActionCount.0_2*eventId.0_2o~-~r32044122084~~kpg5xq7n~29~-~Nb7_ch~ft.0_0*ei.2_cGFzc3dvcmQ%3D*selectorActionCount.0_4*eventId.0_2t~-~~kpg5xq8k~3~2%23password~-~vn.2_cGFzc3dvcmQ%3D*co.3_YjhfY2g%3D*ei.2_cGFzc3dvcmQ%3D*sy.3_NThfYnE%3D*selectorActionCount.0_1*eventId.0_2v~-~r451606737&dom=11H4sIAAAAAAAAA62SS2%2FbMAzHv0rAXlYsLizZTRwXKPY8FNi6AOt2aXtQLTohoNckua1X5LtPTpohzR7A0Pkgk6L0J38ULx%2FAYws1FDwvS8Z5XpUwhs5JERHqB4ikMUShHdR8DM5bhz4Sho9WpjhoK6kllJ%2BM6tO9W%2FSBrEkBnjxp9dulMAsMgxJjFRv%2BIkZPN13c7IbYq3WiW6G6QVFScEr09ahVeH8ysk40FJPLTpKi9ZKMUFAX5XS1GkNAhU20Pt07aMnITGRLG1GlVeNcLDBrrden786%2B1vjtBTvcWvmedfp5%2Fvp846YszZKU9GiGsn5m5DP%2BGPlAIUJ9CRHvY%2F0%2BBNHj99EVvEGvyFwBXA%2BVMZ7%2FT9rZc2iTteVjf%2BGr%2FoWvKGa%2F4SO5A2c6pXYhJsU%2BhBZkshsr%2B%2BzOC5cma1sxP4ThLBnXxbVwUVbVbt8aG6gRUuj8pRbek43xqPWvFklRHTVWw5NEZ%2BfzLxcHXUCfpQpX6Rtv5748ZpN8Mi2mf5r64nlTXxyX%2FNc%2Bxd49GYOh1bsPnu91agPgRAh36cya4PoHPxXICbsDAAA%3D'));
	const end = Date.now();
	console.log((end - start) / 1e3);
})();
