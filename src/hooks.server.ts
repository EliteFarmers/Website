import { env } from '$env/dynamic/public';
import { FetchUserSession } from '$lib/api/auth';
import { cache, initCachedItems } from '$lib/servercache';
import * as Sentry from '@sentry/sveltekit';
import { redirect, type Handle, type ServerInit } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
const { PUBLIC_HOST_URL } = env;

export const init: ServerInit = async () => {
	initCachedItems();
};

export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
	const { locals, cookies } = event;
	locals.bot = event.request.headers.get('X-Known-Bot') === 'true';

	locals.access_token = cookies.get('access_token');
	locals.refresh_token = cookies.get('refresh_token');
	locals.cache = cache;
	locals.ads = !event.route.id?.includes('/(auth)');

	if (locals.access_token) {
		locals.persistSession = true;
	}

	// Skip getting the user session if the request is /api/
	if (event.url.pathname.startsWith('/api/')) {
		return await ResolveWithSecurityHeaders(resolve, event);
	}

	// Fetch the user session
	if (locals.access_token && locals.refresh_token) {
		try {
			locals.session = await FetchUserSession(event.cookies);
		} catch {
			// Ignore errors fetching session
		}
		locals.access_token = cookies.get('access_token');
		locals.refresh_token = cookies.get('refresh_token');
	}

	if (locals.session?.pending_confirmation && event.url.pathname !== '/login/confirm') {
		redirect(
			307,
			`/login/confirm?id=${locals.session.pending_confirmation.id}&redirect=${encodeURIComponent(event.url.pathname)}`
		);
	}

	const response = await ResolveWithSecurityHeaders(resolve, event);

	// Check if the response is a bot redirect to the login page
	if (locals.bot && response.headers.get('location')?.startsWith('/login')) {
		return getLoginHeadResponse(response.headers.get('location') || '/login');
	}

	return response;
});

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
export const handleError = Sentry.handleErrorWithSentry();
