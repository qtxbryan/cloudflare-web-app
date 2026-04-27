export function handleSecure(request: Request): Response {
	const email = request.headers.get('Cf-Access-Authenticated-User-Email') ?? 'unknown';
	const country = (request as any).cf?.country ?? 'Unknown';
	const timestamp = new Date().toISOString();

	const countryName = (() => {
		try {
			return new Intl.DisplayNames(['en'], { type: 'region' }).of(country) ?? country;
		} catch {
			return country;
		}
	})();

	const formattedTime = new Date(timestamp).toLocaleString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		timeZoneName: 'short',
	});

	const initials = email !== 'unknown' ? email[0].toUpperCase() : '?';

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cloudflare Demo — Authenticated</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6 text-slate-100">

  <div class="bg-white/5 border border-white/10 rounded-3xl p-10 max-w-lg w-full backdrop-blur-xl shadow-2xl">

    <div class="inline-flex items-center gap-1.5 bg-green-500/15 border border-green-500/40 text-green-300 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-8">
      <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
      Verified by Cloudflare Access
    </div>

    <div class="flex items-center gap-4 mb-8">
      <div class="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white shrink-0">${initials}</div>
      <div>
        <div class="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-0.5">Authenticated user</div>
        <div class="text-base font-semibold text-slate-100 break-all">${email}</div>
      </div>
    </div>

    <div class="h-px bg-white/[0.08] my-6"></div>

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
          <a href="/flags/${country}" class="text-indigo-400 hover:underline font-medium text-sm">${countryName} (${country})</a>
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
