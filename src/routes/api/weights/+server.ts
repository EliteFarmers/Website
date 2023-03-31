import { CROPS_PER_ONE_WEIGHT } from '$lib/constants/weights';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ setHeaders }) => {
	setHeaders({
		'Cache-Control': 'max-age=86400, public', // 1 day
	});

	return json({ success: true, crops: CROPS_PER_ONE_WEIGHT });
};
