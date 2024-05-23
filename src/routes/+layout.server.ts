import { PremiumStatus } from '$lib/discord';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, parent }) => {
	await parent();

	return {
		userInfo:
			locals.userInfo ??
			(locals.user?.id
				? {
						id: locals.user.id,
						username: locals.user.username,
						avatar: locals.user.avatar,
				  }
				: undefined),
		premium: PremiumStatus.None,
		mcUuid: locals.session?.ign,
		session: locals.session,
	};
};
