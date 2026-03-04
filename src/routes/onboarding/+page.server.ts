import { linkOwnAccount, searchAccountsWithDiscord } from '$lib/api';
import { FetchDiscordUserData, FetchUserSession } from '$lib/api/auth';
import { IsIGNOrUUID } from '$params/id';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, parent }) => {
	const { session } = await parent();
	const { access_token: token } = locals;

	if (!session || !token) {
		throw redirect(307, '/login?redirect=' + url.pathname);
	}

	const discord = await FetchDiscordUserData();

	if (!discord) {
		throw redirect(307, '/login?redirect=' + url.pathname);
	}

	const { data: accountOptions } = await searchAccountsWithDiscord();

	const redirectTo = url.searchParams.get('redirect') ?? '/';

	return {
		user: discord,
		redirectTo,
		accountOptions,
	};
};

export const actions: Actions = {
	link: async ({ locals, request, cookies }) => {
		if (!locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const username = data.get('ign')?.toString().trim();

		if (!username || !IsIGNOrUUID(username)) {
			return fail(400, { error: 'Invalid username.' });
		}

		const { error: problem, response } = await linkOwnAccount(username);

		if (!response.ok || problem) {
			return fail(response.status, {
				error: 'Error linking account, please check spelling and that your Discord account is correctly linked on Hypixel.',
				problem: problem,
			});
		}

		if (!locals.session?.uuid) {
			await FetchUserSession(cookies, false, true);
		}

		return { success: true };
	},
};
