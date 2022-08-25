import { GetUser } from '$db/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {

	const uuid = params.uuid.replaceAll('-', '');

	if (!uuid || uuid.length !== 32) {
		return new Response(JSON.stringify({ error: 'Not a valid UUID' }), { status: 400 });
	}

	const user = await GetUser(uuid);

	if (!user) {
		return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
	}

	if (!user.info) {
		return new Response(JSON.stringify({ error: 'User has no info' }), { status: 404 });
	}

	return new Response(JSON.stringify(user.info));
};