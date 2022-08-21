import { browser } from '$app/env';
import { goto } from '$app/navigation';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { discordUser } = await parent();

	if (!discordUser) {
		// Redirect to login page
		if (browser) {
			await goto('/login');
		} else throw redirect(302, '/login');
	}
}
