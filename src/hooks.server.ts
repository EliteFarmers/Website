import type { Handle, ServerInit } from '@sveltejs/kit';
import { FetchUserSession } from '$lib/api/auth';
import { cache, initCachedItems } from '$lib/servercache';

// Access posthog environment variables while keeping them optional
import * as e from '$env/static/private';
const POSTHOG_ASSETS_HOST = (e as Record<string, string>).POSTHOG_ASSETS_HOST;
const POSTHOG_HOST = (e as Record<string, string>).POSTHOG_HOST;

export const init: ServerInit = async () => {
	if (POSTHOG_ASSETS_HOST && POSTHOG_HOST) {
		console.log('Starting up with PostHog integration!');
	}
	initCachedItems();
};

export const handle: Handle = async ({ event, resolve }) => {
	if (POSTHOG_ASSETS_HOST && POSTHOG_HOST && event.url.pathname.startsWith('/post')) {
		return await sendToPostHog(event);
	}

	const { locals, cookies } = event;

	const access = cookies.get('access_token');
	const refresh = cookies.get('refresh_token');

	locals.access_token = access;
	locals.refresh_token = refresh;
	locals.cache = cache;

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
		'accelerometer=(), autoplay=(), camera=(), encrypted-media=(), fullscreen=(), gyroscope=(), interest-cohort=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), xr-spatial-tracking=(), geolocation=()'
	);
	response.headers.set('X-Content-Type-Options', 'nosniff');

	return response;
}

async function sendToPostHog(event: Parameters<Handle>[0]['event']): Promise<ReturnType<Handle>> {
	const hostname = event.url.pathname.startsWith('/post/static/') ? POSTHOG_ASSETS_HOST : POSTHOG_HOST;

	// Build external URL
	const url = new URL(event.request.url);
	url.protocol = 'https:';
	url.hostname = hostname;
	url.port = '443';
	url.pathname = event.url.pathname.replace('/post/', '');

	// Clone and adjust headers
	const headers = new Headers(event.request.headers);
	headers.set('host', hostname);

	// Proxy the request to the external host
	const response = await fetch(url.toString(), {
		...event.request,
		method: event.request.method,
		headers,
		body: event.request.body,
		duplex: 'half',
	} as RequestInit);

	return response;
}
