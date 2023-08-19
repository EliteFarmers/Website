import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ELITE_API_URL } from '$env/static/private';

export const GET: RequestHandler = ({ url }) => {
	const newUrl = ELITE_API_URL + url.href.substring(url.origin.length);
	console.log(newUrl);
	throw redirect(308, newUrl);
};
