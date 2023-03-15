import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	return json({ success: false, error: 'Route not found.' }, { status: 404 });
};
