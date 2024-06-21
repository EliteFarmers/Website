import type { PageServerLoad } from './$types';

export const load = (async ({ parent, locals }) => {
	const { members, teams } = await parent();

	let joined = false;
	if (teams) {
		joined = teams.some((t) => t.members?.some((m) => m.playerUuid === locals.session?.uuid)) ?? false;
	} else if (members) {
		joined = members.some((m) => m.playerUuid === locals.session?.uuid) ?? false;
	}

	return {
		joined,
	};
}) satisfies PageServerLoad;
