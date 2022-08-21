import { browser } from '$app/env';
import { goto, invalidate } from '$app/navigation';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ setHeaders }) => {
	
	setHeaders({
		'Set-Cookie': [
			`discord_access_token=deleted; Path=/; Max-Age=-1`,
			`discord_refresh_token=deleted; Path=/; Max-Age=-1`,
		]
	})

	if (browser) {
		await invalidate();
	}

	// Hacky fix for https://github.com/sveltejs/kit/issues/5952
	if (browser) {
		return await goto('/');
	} else throw redirect(302, '/');
}
