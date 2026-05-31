import { proxyEliteApi } from '$lib/server/elite-api-proxy';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = (event) => {
	return proxyEliteApi(event, `/guides/${event.params.guideId}/assets`, {
		method: 'GET',
	});
};
