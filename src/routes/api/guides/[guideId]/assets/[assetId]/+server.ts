import { proxyEliteApi } from '$lib/server/elite-api-proxy';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = (event) => {
	return proxyEliteApi(event, `/guides/${event.params.guideId}/assets/${event.params.assetId}`, {
		method: 'DELETE',
	});
};
