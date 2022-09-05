import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { user } = await parent();

	if (user) {
		throw redirect(302, `/stats/${user.ign ?? user.uuid}`);
	}

	throw redirect(302, '/');
}
