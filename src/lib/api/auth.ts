import {
	getAuthAccount,
	getGetSessionUrl,
	getRefreshAuthUrl,
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

const refreshLock = new Map<string, Promise<AuthSession | undefined>>();

export async function FetchUserSession(
	cookies: Cookies,
	access: string,
	refreshToken = '',
	forceRefresh = false
): Promise<AuthSession | undefined> {
	// Fetch the user session
	const response = await fetch(getGetSessionUrl(), {
		headers: {
			Authorization: `Bearer ${access}`,
		},
	});

	const session = (await response?.json().catch(() => undefined)) as AuthSessionDto | undefined;
	if (session && !forceRefresh) {
		return setAuthFlags(session);
	}

	if (refreshToken && (!session || forceRefresh)) {
		if (response?.status !== 401 && !forceRefresh) {
			// If the response is not 401 Unauthorized, do not attempt to refresh
			return undefined;
		}

		const current = refreshLock.get(refreshToken);
		if (current) {
			const session = await current;
			setTimeout(() => refreshLock.delete(refreshToken), 100);
			return session;
		}

		const refreshPromise = refreshUserSession(cookies, access, refreshToken);
		refreshLock.set(refreshToken, refreshPromise);
		const session = await refreshPromise;

		setTimeout(() => refreshLock.delete(refreshToken), 100);
		return session;
	}

	return session ? setAuthFlags(session) : undefined;
}

async function refreshUserSession(
	cookies: Cookies,
	access: string,
	refreshToken: string
): Promise<AuthSession | undefined> {
	const newTokensResponse = await fetch(getRefreshAuthUrl(), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ user_id: access, refresh_token: refreshToken }),
	}).catch(() => undefined);

	const newTokens = (await newTokensResponse?.json().catch(() => undefined)) as AuthResponseDto | undefined;

	if (newTokens) {
		UpdateAuthCookies(cookies, newTokens);

		// Omit the refresh token to not cause infinite loop
		return await FetchUserSession(cookies, newTokens.access_token);
	} else {
		DeleteAuthCookies(cookies);
	}

	return undefined;
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
