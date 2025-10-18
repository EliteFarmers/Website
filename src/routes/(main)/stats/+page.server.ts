import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { session } = await parent();

	if (session?.ign) {
		throw redirect(307, `/@${session.ign}`);
	}

	throw redirect(307, `/`);
};
