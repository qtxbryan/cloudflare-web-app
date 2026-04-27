interface JwtPayload {
	email?: string;
	country?: string;
	iat?: number;
}

function decodeJwtPayload(jwt: string | null): JwtPayload {
	try {
		if (!jwt) return {};
		const base64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
		return JSON.parse(atob(base64)) as JwtPayload;
	} catch {
		return {};
	}
}

export function handleSecure(request: Request): Response {
	const email = request.headers.get('Cf-Access-Authenticated-User-Email') ?? 'unknown';

	const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
	const payload = decodeJwtPayload(jwt);

	const cf = (request as Request & { cf?: { country?: string; timezone?: string } }).cf;
	const country = payload.country ?? cf?.country ?? 'Unknown';
	const timestamp = payload.iat
		? new Date(payload.iat * 1000).toISOString()
		: new Date().toISOString();

	const countryName = (() => {
		try {
			return new Intl.DisplayNames(['en'], { type: 'region' }).of(country) ?? country;
		} catch {
			return country;
		}
	})();

	// Workers default to UTC for Intl; cf.timezone is the visitor's IANA zone from their IP.
	const localeOptions: Intl.DateTimeFormatOptions = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		timeZoneName: 'short',
		...(cf?.timezone ? { timeZone: cf.timezone } : {}),
	};
	const formattedTime = new Date(timestamp).toLocaleString('en-US', localeOptions);

	const initials = email !== 'unknown' ? email[0].toUpperCase() : '?';

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cloudflare Demo — Authenticated</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #111111; }
    .cf-card {
      background-color: #1a1a1a;
      border: 1px solid #2a2a2a;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
    }
    .cf-avatar {
      background: linear-gradient(135deg, #f48120, #faad3f);
    }
    .cf-link {
      color: #f48120;
      transition: opacity 0.15s;
    }
    .cf-link:hover { opacity: 0.75; }
    .cf-divider { background-color: #2a2a2a; }
  </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-center p-6 text-slate-100">

  <div class="cf-card rounded-3xl p-10 max-w-lg w-full">

    <div class="inline-flex items-center gap-1.5 bg-green-500/15 border border-green-500/40 text-green-300 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-8">
      <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
      Verified by Cloudflare Access
    </div>

    <div class="flex items-center gap-4 mb-8">
      <div class="cf-avatar w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0">${initials}</div>
      <div>
        <div class="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-0.5">Authenticated user</div>
        <div class="text-base font-semibold text-slate-100 break-all">${email}</div>
      </div>
    </div>

    <div class="h-px cf-divider my-6"></div>

    <div class="grid gap-5">
      <div class="flex flex-col gap-1">
        <div class="text-xs font-semibold tracking-widest uppercase text-slate-500">Session timestamp</div>
        <div class="text-sm text-slate-300">${formattedTime}</div>
      </div>

      <div class="flex flex-col gap-1">
        <div class="text-xs font-semibold tracking-widest uppercase text-slate-500">Connecting from</div>
        <div class="flex items-center gap-3">
          <img
            src="/flags/${country}"
            alt="${countryName} flag"
            class="w-10 h-[30px] object-cover rounded border border-white/15"
            onerror="this.style.display='none'"
          />
          <a href="/flags/${country}" class="cf-link font-medium text-sm">${countryName} (${country})</a>
        </div>
      </div>
    </div>

    <a href="/" class="block text-center mt-8 text-sm text-slate-500 hover:text-slate-400 transition-colors">← Back to Cloudflare Demo</a>
  </div>

  <div class="mt-6 text-center text-xs text-slate-700">Secured by Cloudflare Zero Trust · Edge Worker · R2 Storage</div>

</body>
</html>`;

	return new Response(html, {
		headers: { 'Content-Type': 'text/html;charset=UTF-8' },
	});
}
