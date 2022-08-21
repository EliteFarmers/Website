import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { discordUser } = await parent();

	if (!discordUser) {
		// Redirect to login page
		throw redirect(302, '/login');
	}
}
