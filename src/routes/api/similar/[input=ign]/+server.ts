import { FindSimilarUsers } from '$db/database';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const input = params.input.replaceAll('-', '');

	const names = (await FindSimilarUsers(input)) as { ign: string; similarity: number }[] | null;

	if (!names) {
		return json({ success: false, error: "Database couldn't be reached" }, { status: 404 });
	}

	setHeaders({
		'Cache-Control': `max-age=86400, public`,
	});

	return json({ success: true, players: names });
};
