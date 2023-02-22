import { FindSimilarUsers } from '$db/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const input = params.input.replaceAll('-', '');

	const names = (await FindSimilarUsers(input)) as { ign: string; similarity: number }[] | null;

	if (!names) {
		return new Response(JSON.stringify({ error: "Database couldn't be reached" }), { status: 404 });
	}

	return new Response(JSON.stringify(names));
};
