import { getRequestEvent } from '$app/server';
import {
	getAuthAccount,
	getSession,
	refreshAuth,
	type AuthorizedAccountDto,
	type AuthResponseDto,
	type AuthSessionDto,
	type ConfirmationDto,
} from '$lib/api';
import type { Cookies } from '@sveltejs/kit';
import type { EliteResponse } from './custom-fetch';

export type AuthSession = AuthSessionDto & { perms: AuthFlags };

export interface AuthFlags {
	admin: boolean;
	moderator: boolean;
	support: boolean;
	artist: boolean;
	wiki: boolean;
	packowner: boolean;
	viewAdminPages: boolean;
}

const refreshLock = new Map<string, Promise<AuthResponseDto | undefined>>();
const cookieLifetime = 30 * 24 * 60 * 60;
const attemptTimeout = 5_000;
const retryBackoff = 250;
const maxRetryAfter = 2_000;

export async function FetchUserSession(
	cookies: Cookies,
	skipRefresh = false,
	forceRefresh = false,
	pendingConfirmation?: ConfirmationDto
): Promise<AuthSession | undefined> {
	const { locals } = getRequestEvent();
	const access = cookies.get('access_token');
	const refreshToken = cookies.get('refresh_token');
	if (!access) return undefined;

	let session = forceRefresh ? undefined : await fetchSession(access);
	if ((!session || forceRefresh) && refreshToken && !skipRefresh) {
		let refresh = refreshLock.get(refreshToken);
		if (!refresh) {
			refresh = requestAuth(
				(signal) => refreshAuth({ user_id: access, refresh_token: refreshToken }, { signal }),
				IsAuthTokenResponse
			);
			refreshLock.set(refreshToken, refresh);
		}

		let tokens: AuthResponseDto | undefined;
		try {
			tokens = await refresh;
		} finally {
			if (refreshLock.get(refreshToken) === refresh) refreshLock.delete(refreshToken);
		}

		if (!tokens) {
			DeleteAuthCookies(cookies);
			return undefined;
		}

		UpdateAuthCookies(cookies, tokens);
		session = await fetchSession(tokens.access_token);

		if (!session) {
			throw new Error('Failed to retrieve the refreshed session');
		}

		pendingConfirmation = tokens.pending_confirmation ?? pendingConfirmation;
	}

	if (session && pendingConfirmation) {
		session.pending_confirmation = pendingConfirmation;
	}
	locals.session = session ? setAuthFlags(session) : undefined;
	return locals.session;
}

function fetchSession(access: string) {
	return requestAuth((signal) => getSession({ headers: { Authorization: `Bearer ${access}` }, signal }));
}

function setAuthFlags(session?: AuthSessionDto): AuthSession | undefined {
	if (!session) return undefined;

	const newSession = session as AuthSession;

	const includesAdmin = session.roles.includes('Admin');
	const includesModerator = session.roles.includes('Moderator');
	const includesSupport = session.roles.includes('Support');
	const includesWiki = session.roles.includes('Wiki');
	const includesArtist = session.roles.includes('Artist');
	const includesPackOwner = session.roles.includes('PackOwner');

	newSession.perms = {
		admin: includesAdmin,
		moderator: includesModerator || includesAdmin,
		support: includesSupport || includesModerator || includesAdmin,
		wiki: includesWiki || includesSupport || includesModerator || includesAdmin,
		artist: includesArtist || includesAdmin,
		packowner: includesPackOwner || includesAdmin,
		viewAdminPages: includesAdmin || includesModerator || includesArtist || includesSupport || includesPackOwner,
	};

	return newSession;
}

export function DeleteAuthCookies(cookies: Cookies) {
	cookies.delete('access_token', { path: '/' });
	cookies.delete('refresh_token', { path: '/' });
	cookies.delete('auth_state', { path: '/' });
	const { locals } = getRequestEvent();
	locals.access_token = undefined;
	locals.refresh_token = undefined;
	locals.session = undefined;
	locals.user = undefined;
	locals.persistSession = false;
}

export function UpdateAuthCookies(cookies: Cookies, tokens: AuthResponseDto) {
	if (!IsAuthTokenResponse(tokens)) throw new Error('Invalid authentication response');
	cookies.set('access_token', tokens.access_token, {
		path: '/',
		maxAge: cookieLifetime,
	});

	cookies.set('refresh_token', tokens.refresh_token, {
		path: '/',
		maxAge: cookieLifetime,
	});
	const { locals } = getRequestEvent();
	locals.access_token = tokens.access_token;
	locals.refresh_token = tokens.refresh_token;
}

export async function FetchDiscordUserData(): Promise<AuthorizedAccountDto | null> {
	const { locals } = getRequestEvent();
	if (!locals.access_token) return null;
	try {
		return (await requestAuth((signal) => getAuthAccount({ signal }))) ?? null;
	} catch {
		// A failed account lookup does not prove the refresh credential is invalid.
		return null;
	}
}

async function requestAuth<T>(
	request: (signal: AbortSignal) => Promise<EliteResponse<T, unknown>>,
	isValid?: (data: T) => boolean
): Promise<T | undefined> {
	for (let attempt = 0; attempt < 2; attempt++) {
		const controller = new AbortController();
		let timeout: ReturnType<typeof setTimeout> | undefined;
		let result: EliteResponse<T, unknown> | undefined;
		try {
			result = await Promise.race([
				request(controller.signal),
				new Promise<never>((_, reject) => {
					timeout = setTimeout(() => {
						controller.abort();
						reject(new Error('Auth request timed out'));
					}, attemptTimeout);
				}),
			]);
		} catch {
			// Don't invalidate the session on network, timeout, or JSON parsing failures.
		} finally {
			clearTimeout(timeout);
		}

		if (result?.response.status === 401) return undefined;
		if (result?.ok && result.response.status === 200 && result.data != null && (!isValid || isValid(result.data))) {
			return result.data;
		}

		const status = result?.response.status;
		if (attempt === 1 || (status && !result?.ok && status !== 408 && status !== 429 && status < 500)) {
			break;
		}

		const retryAfter = result?.response.headers.get('Retry-After');
		const delay = retryAfter ? retryAfterDelay(retryAfter) : retryBackoff;

		if (delay > maxRetryAfter) {
			break;
		}

		await new Promise((resolve) => setTimeout(resolve, Math.max(retryBackoff, delay)));
	}
	throw new Error('Failed to retrieve authentication data');
}

function retryAfterDelay(value: string) {
	const seconds = Number(value);
	const delay = Number.isFinite(seconds) ? seconds * 1_000 : Date.parse(value) - Date.now();
	return Number.isFinite(delay) ? Math.max(0, delay) : retryBackoff;
}

export function IsAuthTokenResponse(value: AuthResponseDto | null | undefined) {
	return (
		typeof value?.access_token === 'string' &&
		value.access_token.trim().length > 0 &&
		typeof value.refresh_token === 'string' &&
		value.refresh_token.trim().length > 0
	);
}
