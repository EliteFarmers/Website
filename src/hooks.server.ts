import type { Handle } from '@sveltejs/kit';
import { GetUserSession, RefreshUserSession } from '$lib/api/elite';
import type { components } from '$lib/api/api';

export const handle: Handle = async ({ event, resolve }) => {
	const { locals, cookies } = event;

	const access = cookies.get('access_token');
	const refresh = cookies.get('refresh_token');

	if (access && refresh) {
		locals.session = await FetchUserSession(event, access, refresh);
	}

	locals.access_token = access;
	locals.refresh_token = refresh;

	return await ResolveWithSecurityHeaders(resolve, event);
};

async function FetchUserSession(event: Parameters<Handle>[0]['event'], access: string, refresh: string) {
	// Fetch the user session
	const { data: session } = await GetUserSession(access).catch(() => ({ data: undefined }));

	if (session) {
		return session;
	}

	if (!session && refresh) {
		const { data: newTokens } = await RefreshUserSession({
			access_token: access,
			refresh_token: refresh,
		}).catch(() => ({ data: undefined }));

		if (newTokens) {
			UpdateAuthCookies(event, newTokens);

			// Omit the refresh token to not cause infinite loop
			return await FetchUserSession(event, newTokens.access_token, '');
		} else {
			DeleteAuthCookies(event);
		}
	}

	return undefined;
}

async function DeleteAuthCookies(event: Parameters<Handle>[0]['event']) {
	const { cookies } = event;

	cookies.delete('access_token', { path: '/' });
	cookies.delete('refresh_token', { path: '/' });
}

async function UpdateAuthCookies(
	event: Parameters<Handle>[0]['event'],
	tokens: components['schemas']['AuthResponseDto']
) {
	const { cookies } = event;

	cookies.set('access_token', tokens.access_token, {
		path: '/',
		maxAge: 60 * 60 * 24 * 20,
	});

	cookies.set('refresh_token', tokens.refresh_token, {
		path: '/',
		maxAge: 60 * 60 * 24 * 20,
	});
}

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
