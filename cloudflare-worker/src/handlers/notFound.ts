export function handle404(message = 'The page you are looking for does not exist.'): Response {
	const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cloudflare Demo — Not Found</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-slate-950 text-slate-400 flex flex-col items-center justify-center gap-4 text-center p-8">
  <h1 class="text-8xl font-extrabold text-slate-800">404</h1>
  <p class="text-base max-w-sm leading-relaxed">${message}</p>
  <a href="/" class="mt-2 text-indigo-500 hover:underline font-medium">← Back to Cloudflare Demo</a>
</body>
</html>`;

	return new Response(html, {
		status: 404,
		headers: { 'Content-Type': 'text/html;charset=UTF-8' },
	});
}
