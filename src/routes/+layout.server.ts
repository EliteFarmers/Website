import { FetchPremiumStatus, PremiumStatus } from '$lib/discord';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, parent }) => {
	await parent();

	if (!locals.discordUser) {
		return {
			discordUser: locals.discordUser ?? false,
			authModel: locals.userRecord,
		};
	}

	const premium = await FetchPremiumStatus(locals.discordUser.id);

	if (locals.userRecord?.id && locals.userRecord.premium !== premium) {
		await locals.pb.collection('users').update(locals.userRecord.id, {
			premium: premium,
			subscribeDate: premium !== PremiumStatus.None ? new Date() : null,
		});
	}

	return {
		discordUser: locals.discordUser,
		premium: premium,
		authModel: locals.userRecord,
	};
};
