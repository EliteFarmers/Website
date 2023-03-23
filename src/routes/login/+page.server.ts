import { PUBLIC_DISCORD_REDIRECT_ROUTE } from '$env/static/public';
import { authState } from '$stores/auth';
import { error, redirect } from '@sveltejs/kit';
import type { AuthProviderInfo } from 'pocketbase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, locals, url }) => {
	await parent();

	const authMethods = await locals.pb.collection('users').listAuthMethods();
	const discordProvider = authMethods.authProviders.find((method) => method.name === 'discord') as
		| (AuthProviderInfo & { redirectUrl: string })
		| undefined;

	if (!discordProvider) throw error(500, 'Discord auth provider not found!');

	// We don't need the email scope, so we'll replace it with guilds which we do need
	const authUrl = discordProvider.authUrl.replace('identify+email', 'identify+email+guilds');
	const redirectUrl = encodeURIComponent(url.origin + PUBLIC_DISCORD_REDIRECT_ROUTE);

	discordProvider.redirectUrl = redirectUrl;
	authState.set(JSON.stringify(discordProvider));

	throw redirect(302, authUrl + redirectUrl);
};
