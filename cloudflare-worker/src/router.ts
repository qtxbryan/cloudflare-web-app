import { handleHealth } from './handlers/health';
import { handleSecure } from './handlers/secure';
import { handleFlagsR2, handleFlagsD1 } from './handlers/flags';
import { handle404 } from './handlers/notFound';

export async function router(request: Request, env: Env): Promise<Response> {
	const { pathname } = new URL(request.url);

	if (pathname === '/health') return handleHealth();
	if (pathname === '/secure') return handleSecure(request);

	const r2Match = pathname.match(/^\/flags\/([A-Za-z]{2,3})$/i);
	if (r2Match) return handleFlagsR2(r2Match[1].toUpperCase(), env);

	const d1Match = pathname.match(/^\/flags-d1\/([A-Za-z]{2,3})$/i);
	if (d1Match) return handleFlagsD1(d1Match[1].toUpperCase(), env);

	return handle404();
}
