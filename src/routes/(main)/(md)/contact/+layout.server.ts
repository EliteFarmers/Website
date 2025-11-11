import { getBusinessInfo } from '$lib/remote/business.remote';
import type { LayoutServerLoad } from './$types';

export const load = (async () => {
	const businessInfo = await getBusinessInfo();
	return { contact: businessInfo.contact };
}) satisfies LayoutServerLoad;
