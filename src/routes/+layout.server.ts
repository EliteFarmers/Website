import { FetchPremiumStatus } from '$lib/discord';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, parent }) => {
	await parent();

	const model = structuredClone(locals.pb.authStore.model)

	if (!locals.discordUser) {
		return {
			user: locals.user ?? false,
			discordUser: locals.discordUser ?? false,
			authModel: model ?? null,
		};
	}

	const premium = await FetchPremiumStatus(locals.discordUser.id);
	return {
		user: locals.user ?? false,
		discordUser: locals.discordUser,
		premium: premium,
		authModel: model ?? null,
	};
};
