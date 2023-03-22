import { error, redirect } from '@sveltejs/kit';
import { authStateVal } from '$stores/auth';
import type { AuthProviderInfo } from 'pocketbase';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ url, locals, cookies }) => {

	let provider; 
	try {
		provider = JSON.parse(authStateVal) as AuthProviderInfo & { redirectUrl: string };
	} catch (err) {
		throw error(400, 'Invalid state');
	}

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const errorMsg = url.searchParams.get('error');

	if (errorMsg) {
		throw error(400, errorMsg);
	}

	if (!code || !state || state !== provider.state) {
		throw error(400, 'Missing code or state');
	}

	const authData = await locals.pb.collection('users').authWithOAuth2(
		provider.name,
		code,
		provider.codeVerifier,
		decodeURIComponent(provider.redirectUrl),
		{
			emailVisibility: false,
		}
	);

	if (!authData.token) {
		throw error(400, 'Invalid code');
	}

	await locals.pb.collection('users').update(authData.record.id, {
		avatar: (authData.meta?.avatarUrl ?? '') as string,
	});

	cookies.set('pocketbase_auth', authData.token, {
		path: '/',
	});

	if (!authData.meta?.accessToken || !authData.meta.refreshToken) {
		throw redirect(303, '/');
	}

	const tenMinutes = 10 * 60;
	const thirtyDays = 30 * 24 * 60 * 60;
	const accessTokenExpires = new Date(Date.now() + tenMinutes); // 10 minutes
	const refreshTokenExpires = new Date(Date.now() + thirtyDays); // 30 days

	cookies.set('discord_access_token', authData.meta.accessToken as string, {
		expires: accessTokenExpires,
		maxAge: tenMinutes,
		path: '/',
	});
	cookies.set('discord_refresh_token', authData.meta.refreshToken as string, {
		expires: refreshTokenExpires,
		maxAge: thirtyDays,
		path: '/',
	});

	throw redirect(303, '/');
};
