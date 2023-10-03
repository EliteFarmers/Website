import { PUBLIC_SUPPORT_SERVER_INVITE } from '$env/static/public';
import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	throw redirect(302, PUBLIC_SUPPORT_SERVER_INVITE);
};
