import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent, locals, url }) => {
	const { session } = await parent();
	const { access_token: token } = locals;

	if (!session || !token) {
		throw redirect(307, '/login?redirect=' + url.pathname);
	}
}) satisfies PageServerLoad;
