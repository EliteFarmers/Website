import { error, redirect } from '@sveltejs/kit';
import type { ProfileData } from '$lib/skyblock';
import type { PageServerLoad } from './$types';
import { accountFromId } from '$lib/data';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { id } = params;

	const account = await accountFromId(id);

	if (!account) {
		throw error(404, 'Minecraft account not found');
	}

	const { id: uuid, name: ign } = account.account;

	const response = await fetch(`/api/profiles/${uuid}/selected`);

	if (!response.ok) {
		throw error(404, 'Skyblock profile not found for this player!');
	}

	const data = (await response.json()) as { profile: ProfileData; success: boolean };

	if (!data.success) {
		throw error(404, 'Skyblock profile not found for this player!');
	}

	throw redirect(303, `/stats/${ign}/${data.profile.profile_id}`);
};
