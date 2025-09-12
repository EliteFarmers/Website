import { PUBLIC_HOST_URL } from '$env/static/public';
import { FetchUserSession } from '$lib/api/auth';
import { cache, initCachedItems } from '$lib/servercache';
import type { Handle, ServerInit } from '@sveltejs/kit';

export const init: ServerInit = async () => {
	initCachedItems();
};

export const handle: Handle = async ({ event, resolve }) => {
	const { locals, cookies } = event;

	const access = cookies.get('access_token');
	const refresh = cookies.get('refresh_token');

	locals.access_token = access;
	locals.refresh_token = refresh;
	locals.cache = cache;

	if (locals.access_token) {
		locals.persistSession = true;
	}

	console.log('Handling request for', event.url.pathname);

	// Skip getting the user session if the request is /api/
	if (event.url.pathname.startsWith('/api/')) {
		console.log('Skipping session fetch for', event.url.pathname);
		return await ResolveWithSecurityHeaders(resolve, event);
	}

	// Fetch the user session
	if (access && refresh) {
		console.log('Fetching user session for', event.url.pathname);
		locals.session = await FetchUserSession(event.cookies, access, refresh);
	}

	const response = await ResolveWithSecurityHeaders(resolve, event);

	// Check if the response is a bot redirect to the login page
	if (response.headers.get('location')?.startsWith('/login') && event.request.headers.get('X-Known-Bot') === 'true') {
		return getLoginHeadResponse(response.headers.get('location') || '/login');
	}

	return response;
};

async function ResolveWithSecurityHeaders(
	resolve: Parameters<Handle>[0]['resolve'],
	event: Parameters<Handle>[0]['event']
): Promise<ReturnType<Handle>> {
	const response = await resolve(event);

	// Security headers
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('Referrer-Policy', 'no-referrer');
	response.headers.set(
		'Permissions-Policy',
		'accelerometer=(), autoplay=(), camera=(), encrypted-media=(), fullscreen=(), gyroscope=(), interest-cohort=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), xr-spatial-tracking=(), geolocation=()'
	);
	response.headers.set('X-Content-Type-Options', 'nosniff');

	return response;
}

// Returns a simple HTML page that has a nice open graph preview for bots
// and redirects normal users to the login page
function getLoginHeadResponse(redirectTo: string) {
	return new Response(
		`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Required</title>
    <meta property="og:title" content="Login Required">
    <meta property="og:description" content="Please log in to access this content.">
    <meta property="og:image" content="${PUBLIC_HOST_URL}/favicon.webp">
    <meta http-equiv="refresh" content="0; url='${redirectTo}'" />
</head>
<body>
    <p>If you are not redirected automatically, follow this <a href="${redirectTo}">link to login</a>.</p>
</body>
</html>`,
		{
			status: 200,
			headers: {
				'Content-Type': 'text/html',
			},
		}
	);
}
