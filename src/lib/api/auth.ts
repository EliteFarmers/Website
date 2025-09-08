import {
	getAuthAccount,
	getSession,
	refreshAuth,
	type AuthorizedAccountDto,
	type AuthResponseDto,
	type AuthSessionDto,
} from '$lib/api';
import type { Cookies } from '@sveltejs/kit';

export type AuthSession = AuthSessionDto & { flags: AuthFlags };

export interface AuthFlags {
	admin: boolean;
	moderator: boolean;
	support: boolean;
	wiki: boolean;
}

export async function FetchUserSession(
	cookies: Cookies,
	access: string,
	refreshToken = '',
	forceRefresh = false
): Promise<AuthSession | undefined> {
	forceRefresh = Math.random() < 0.2 || forceRefresh; // 1% chance to force refresh
	// Fetch the user session
	const { data: session, response } = await getSession({
		headers: {
			Authorization: `Bearer ${access}`,
		},
	}).catch(() => ({ data: undefined, response: undefined }));

	if (session && !forceRefresh) {
		return setAuthFlags(session);
	}

	if (refreshToken && (!session || forceRefresh)) {
		if (response?.status !== 401 && !forceRefresh) {
			// If the response is not 401 Unauthorized, do not attempt to refresh
			console.log('Session fetch failed with status:', response?.status);
			return undefined;
		}

		const { data: newTokens } = await refreshAuth({
			user_id: access,
			refresh_token: refreshToken,
		}).catch(() => ({ data: undefined }));

		if (newTokens) {
			console.log('Tokens refreshed:', newTokens);
			UpdateAuthCookies(cookies, newTokens);

			// Omit the refresh token to not cause infinite loop
			return await FetchUserSession(cookies, newTokens.access_token);
		} else {
			console.log('Failed to refresh tokens, deleting auth cookies.');
			DeleteAuthCookies(cookies);
		}
	}

	return session ? setAuthFlags(session) : undefined;
}

function setAuthFlags(session?: AuthSessionDto): AuthSession | undefined {
	if (!session) return undefined;

	const newSession = session as AuthSession;

	const includesAdmin = session.roles.includes('Admin');
	const includesModerator = session.roles.includes('Moderator');
	const includesSupport = session.roles.includes('Support');
	const includesWiki = session.roles.includes('Wiki');

	newSession.flags = {
		admin: includesAdmin,
		moderator: includesModerator || includesAdmin,
		support: includesSupport || includesModerator || includesAdmin,
		wiki: includesWiki || includesSupport || includesModerator || includesAdmin,
	};

	return newSession;
}

export function DeleteAuthCookies(cookies: Cookies) {
	cookies.delete('access_token', { path: '/' });
	cookies.delete('refresh_token', { path: '/' });
	cookies.delete('auth_state', { path: '/' });
}

export function UpdateAuthCookies(cookies: Cookies, tokens: AuthResponseDto) {
	cookies.set('access_token', tokens.access_token, {
		path: '/',
		maxAge: 60 * 60 * 24 * 20,
	});

	cookies.set('refresh_token', tokens.refresh_token, {
		path: '/',
		maxAge: 60 * 60 * 24 * 20,
	});
}

export async function FetchDiscordUserData(): Promise<AuthorizedAccountDto | null> {
	const { data } = await getAuthAccount();

	if (!data) return null;

	try {
		return data;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (_) {
		return null;
	}
}
