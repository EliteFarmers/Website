import { cache } from '$lib/servercache';
import { SIDEBAR_COOKIE_NAME } from '$ui/sidebar/constants';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, parent, cookies }) => {
	await parent();

	const sidebarState = cookies.get(SIDEBAR_COOKIE_NAME);

	return {
		session: locals.session,
		persistSession: locals.persistSession ?? false,
		cache: {
			events: cache.events,
			announcements: cache.announcements ?? [],
			footer: cache.businessInfo.footer,
		},
		sidebar: (sidebarState ?? 'true') === 'true',
		bot: locals.bot ?? false,
	};
};
