import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, parent }) => {
	await parent();

	return {
		session: locals.session,
		cache: locals.cache,
	};
};
