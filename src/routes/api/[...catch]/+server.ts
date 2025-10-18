import { ELITE_API_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const newUrl = ELITE_API_URL + url.href.substring(url.origin.length);

	throw redirect(308, newUrl);
};
