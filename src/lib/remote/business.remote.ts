import { prerender } from '$app/server';
import { fetchBusinessInfo } from '$lib/api/cms';

export const getBusinessInfo = prerender(async () => {
	return await fetchBusinessInfo();
});
