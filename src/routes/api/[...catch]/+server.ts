import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ELITE_API_URL } from '$env/static/private';

export const GET: RequestHandler = ({ url }) => {
	throw redirect(308, ELITE_API_URL + url.href.substring(url.origin.length));
};
