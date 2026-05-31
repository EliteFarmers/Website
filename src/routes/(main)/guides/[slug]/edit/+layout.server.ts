import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	if (!locals.access_token) {
		redirect(307, `/login?redirect=/guides/${params.slug}/edit`);
	}

	return {};
};
