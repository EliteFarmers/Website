import { GetAccountFromDiscord } from '$db/database';
import { FetchPremiumStatus, PremiumStatus } from '$lib/discord';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, parent }) => {
	await parent();

	if (!locals.discordUser) {
		return {
			discordUser: locals.discordUser,
			premium: PremiumStatus.None,
		};
	}

	const premium = await FetchPremiumStatus(locals.discordUser.id);
	const uuid = GetAccountFromDiscord(locals.discordUser.id);

	return {
		discordUser: locals.discordUser,
		premium: premium,
		mcUuid: uuid,
	};
};
