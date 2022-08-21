import { browser } from '$app/env';
import { invalidate } from '$app/navigation';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	await fetch('/api/signout');
	
	if (browser) { 
		await invalidate();
	}

	throw redirect(302, '/');
}
