import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session?.perms.moderator) {
		throw error(403, 'Insufficient permissions');
	}

	return {};
};
