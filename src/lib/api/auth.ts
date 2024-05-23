import type { Handle } from '@sveltejs/kit';
import type { components } from './api';
import { GetUserSession, RefreshUserSession } from './elite';

export type AuthSession = components['schemas']['AuthSessionDto'] & { flags: AuthFlags };

export interface AuthFlags {
	admin: boolean;
	moderator: boolean;
	support: boolean;
	wiki: boolean;
}

export async function FetchUserSession(
	event: Parameters<Handle>[0]['event'],
	access: string,
	refresh: string
): Promise<AuthSession | undefined> {
	// Fetch the user session
	const { data: session } = await GetUserSession(access).catch(() => ({ data: undefined }));

	if (session) {
		return setAuthFlags(session);
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

function setAuthFlags(session?: components['schemas']['AuthSessionDto']): AuthSession | undefined {
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

export async function DeleteAuthCookies(event: Parameters<Handle>[0]['event']) {
	const { cookies } = event;

	cookies.delete('access_token', { path: '/' });
	cookies.delete('refresh_token', { path: '/' });
}

export async function UpdateAuthCookies(
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
