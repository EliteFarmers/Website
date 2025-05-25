import { SIDEBAR_COOKIE_NAME } from '$ui/sidebar/constants';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, parent, cookies }) => {
	await parent();

	const sidebarState = cookies.get(SIDEBAR_COOKIE_NAME);

	return {
		session: locals.session,
		cache: {
			leaderboards: locals.cache?.leaderboards,
			events: locals.cache?.events,
		},
		sidebar: (sidebarState ?? 'true') === 'true',
	};
};
