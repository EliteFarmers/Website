import { browser } from '$app/env';
import { goto } from '$app/navigation';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { user } = await parent();

	if (user) {
		// Hacky fix for https://github.com/sveltejs/kit/issues/5952
		const location = `/stats/${user.ign}`;
		if (browser) {
			return await goto(location);
		} else throw redirect(302, location);
	}

	// Hacky fix for https://github.com/sveltejs/kit/issues/5952
	if (browser) {
		return await goto('/');
	} else throw redirect(302, '/');
}
