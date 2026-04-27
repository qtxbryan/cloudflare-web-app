import { handle404 } from './notFound';

export async function handleFlagsR2(country: string, env: Env): Promise<Response> {
	const obj = await env.flags_bucket.get(`${country.toLowerCase()}.png`);
	if (!obj) {
		return handle404(`Flag not found for country code: ${country}`);
	}
	return new Response(obj.body, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=86400',
		},
	});
}

export async function handleFlagsD1(country: string, env: Env): Promise<Response> {
	const row = await env.flags_db
		.prepare('SELECT r2_key FROM flags WHERE country_code = ?')
		.bind(country)
		.first<{ r2_key: string }>();

	if (!row) {
		return handle404(`No D1 record for country code: ${country}`);
	}

	const obj = await env.flags_bucket.get(row.r2_key.toLowerCase());
	if (!obj) {
		return handle404(`Flag image missing in R2 for country code: ${country}`);
	}

	return new Response(obj.body, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=86400',
		},
	});
}
