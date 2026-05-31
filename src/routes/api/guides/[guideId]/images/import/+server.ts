import { proxyEliteApi } from '$lib/server/elite-api-proxy';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	return proxyEliteApi(event, `/guides/${event.params.guideId}/images/import`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: await event.request.text(),
	});
};
