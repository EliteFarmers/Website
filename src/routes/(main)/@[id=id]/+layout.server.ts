import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url, params }) => {
	if (locals.bot) {
		throw redirect(307, `/og${url.pathname}`);
	}

	return {
		paramsId: params.id,
		paramsProfile: params.profile,
	};
};
