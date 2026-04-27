export function handleHealth(): Response {
	return new Response(
		JSON.stringify({
			status: 'ok',
			worker: 'cf-worker',
			timestamp: new Date().toISOString(),
		}),
		{ headers: { 'Content-Type': 'application/json' } },
	);
}
