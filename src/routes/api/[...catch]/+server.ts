import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	return new Response(JSON.stringify({ success: false, error: 'Route not found.' }), { status: 404 });
};
