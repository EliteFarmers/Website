import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
	const { guild } = await parent();

	if (!guild?.inviteCode) {
		throw redirect(302, '/browse');
	}

	throw redirect(302, `https://discord.gg/${guild?.inviteCode}`);
}) satisfies PageServerLoad;
