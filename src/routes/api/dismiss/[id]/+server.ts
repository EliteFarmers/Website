import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DismissAnnouncement } from '$lib/api/elite';

export const GET: RequestHandler = async ({ locals, params }) => {
	const id = params.id;
	if (!id) {
		error(400, 'ID is required to dismiss an announcement.');
	}

	if (!locals.access_token) {
		error(403, 'You must be logged in to dismiss an announcement.');
	}

	const { response, error: e } = await DismissAnnouncement(locals.access_token, id);
	if (e) {
		error(500, 'Failed to dismiss announcement.');
	}

	return response;
};
