import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ELITE_API_URL } from '$env/static/private';

export const GET: RequestHandler = ({ url }) => {
	console.log('url', ELITE_API_URL as string + url.href.substring(url.origin.length));
	throw redirect(308, ELITE_API_URL as string + url.href.substring(url.origin.length));
};
