import { browser } from '$app/environment';
import { invalidateAll } from '$app/navigation';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ setHeaders }) => {
	setHeaders({
		'Set-Cookie': [
			`discord_access_token=deleted; Path=/; Max-Age=-1`,
			`discord_refresh_token=deleted; Path=/; Max-Age=-1`,
		],
	});

	if (browser) {
		await invalidateAll();
	}

	throw redirect(302, '/');
};
