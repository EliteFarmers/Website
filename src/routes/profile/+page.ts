import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { discordUser } = await parent();

	if (!discordUser) {
		throw redirect(302, '/login');
	}
};
