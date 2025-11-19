import { cache } from '$lib/servercache';
import type { LayoutServerLoad } from './$types';

export const load = (async () => {
	return { contact: cache.businessInfo.contact };
}) satisfies LayoutServerLoad;
