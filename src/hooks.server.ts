import type { Handle } from '@sveltejs/kit';
import { FetchUserSession } from '$lib/api/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const { locals, cookies } = event;

	const access = cookies.get('access_token');
	const refresh = cookies.get('refresh_token');

	locals.access_token = access;
	locals.refresh_token = refresh;

	// Skip getting the user session if the request is /api/
	if (event.url.pathname.startsWith('/api/')) {
		return await ResolveWithSecurityHeaders(resolve, event);
	}

	// Fetch the user session
	if (access && refresh) {
		locals.session = await FetchUserSession(event.cookies, access, refresh);
	}

	return await ResolveWithSecurityHeaders(resolve, event);
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
		'accelerometer=(), autoplay=(), camera=(), document-domain=(), encrypted-media=(), fullscreen=(), gyroscope=(), interest-cohort=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), xr-spatial-tracking=(), geolocation=()'
	);
	response.headers.set('X-Content-Type-Options', 'nosniff');

	return response;
}
