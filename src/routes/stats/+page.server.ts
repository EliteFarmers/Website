import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { userInfo } = await parent();

	if (userInfo) {
		throw redirect(302, `/@${userInfo.id}`);
	}

	throw redirect(302, `/`);
};
