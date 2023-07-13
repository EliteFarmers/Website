import { PremiumStatus } from '$lib/discord';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, parent }) => {
	await parent();

	if (!locals.user?.id) {
		return {
			userInfo: locals.userInfo,
			premium: PremiumStatus.None,
		};
	}

	return {
		userInfo:
			locals.userInfo ??
			(locals.user.id
				? {
						id: locals.user.id,
						username: locals.user.username,
						avatar: locals.user.avatar,
				  }
				: undefined),
		premium: PremiumStatus.None,
		mcUuid:
			locals.user.minecraftAccounts?.find((account) => account.primaryAccount)?.name ??
			locals.user.minecraftAccounts?.[0]?.name,
	};
};
