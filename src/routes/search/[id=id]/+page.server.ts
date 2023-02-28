import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	// Find similar users
	const similar = await fetch(`/api/similar/${params.id}`);

	if (!similar.ok) {
		throw error(404, 'Skyblock profile not found for this player!');
	}

	const results = (await similar.json()) as { success: boolean; players: { ign: string; uuid: string }[] } | null;

	if (!results?.success) {
		throw error(404, 'Skyblock profile not found for this player!');
	}

	return {
		similar: results.players,
	};
};
