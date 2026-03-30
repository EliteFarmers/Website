import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const { access_token: token, session } = locals;

	if (!session || !session.perms.admin || !token) {
		throw error(404, 'Not Found');
	}

	return {};
}) satisfies PageServerLoad;
