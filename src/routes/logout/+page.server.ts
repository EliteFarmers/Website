import { DeleteAuthCookies } from '$lib/api/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => {
	DeleteAuthCookies(cookies);

	return {
		status: 200,
	};
};
