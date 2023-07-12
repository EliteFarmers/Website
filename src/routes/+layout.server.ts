import { FetchPremiumStatus, PremiumStatus } from '$lib/discord';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, parent }) => {
	await parent();

	if (!locals.user?.id) {
		return {
			user: undefined,
			premium: PremiumStatus.None,
		};
	}

	const premium = await FetchPremiumStatus(locals.user.id as unknown as string);

	return {
		user: locals.user,
		premium: premium,
		mcUuid:
			locals.user.minecraftAccounts?.find((account) => account.primaryAccount)?.name ??
			locals.user.minecraftAccounts?.[0]?.name,
	};
};
