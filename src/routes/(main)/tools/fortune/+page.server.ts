import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, url }) => {
	const shareId = url.searchParams.get('share');

	if (shareId && !locals.access_token) {
		throw redirect(307, '/login?redirect=' + encodeURIComponent(url.pathname + url.search));
	}

	return {
		shareId,
	};
}) satisfies PageServerLoad;
