import type { PageServerLoad } from './$types';

export const load = (async ({ parent, locals }) => {
	const { teams, self } = await parent();

	let ownTeam = null;

	if (teams) {
		ownTeam = teams.find((t) => t.members?.some((m) => m.playerUuid === locals.session?.uuid)) ?? undefined;
	} 

	return {
		joined: (ownTeam ?? self) !== undefined,
		ownTeam,
	};
}) satisfies PageServerLoad;
