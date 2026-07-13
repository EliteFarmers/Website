import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	if (!locals.session) {
		redirect(307, '/login?redirect=/admin');
	}

	if (!locals.session?.perms.viewAdminPages) {
		redirect(307, '/');
	}
}) satisfies PageServerLoad;
