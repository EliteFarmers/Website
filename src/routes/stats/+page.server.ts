import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { mcUuid } = await parent();

	if (mcUuid) {
		throw redirect(302, `/@${mcUuid}`);
	}

	throw redirect(302, `/`);
};
