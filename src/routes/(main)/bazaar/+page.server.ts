import { cache } from '$lib/servercache';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		products: cache.bazaar?.products ?? {},
	};
};
