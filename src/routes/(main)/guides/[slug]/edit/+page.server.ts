import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.access_token) {
		redirect(307, `/login?redirect=/guides/${params.slug}/edit`);
	}

	return {};
};
