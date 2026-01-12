import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.access_token) {
		redirect(307, '/login?redirect=/guides/new');
	}

	return {};
};
