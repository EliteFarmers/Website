import { browser } from '$app/environment';
import { invalidateAll } from '$app/navigation';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	await parent();

	if (browser) {
		await invalidateAll();
	}

	throw redirect(302, '/');
};
