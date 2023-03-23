import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { authModel } = await parent();

	if (authModel?.uuid) {
		throw redirect(302, `/stats/${authModel.uuid}`);
	}

	throw redirect(303, '/');
};
