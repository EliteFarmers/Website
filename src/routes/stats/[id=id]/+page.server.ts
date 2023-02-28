import { redirect } from '@sveltejs/kit';
import type { ProfileData } from '$lib/skyblock';
import type { PageServerLoad } from './$types';
import { accountFromId } from '$lib/data';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { id } = params;

	const account = await accountFromId(id);

	if (!account) {
		throw redirect(303, `/search/${id}`);
	}

	const { id: uuid, name: ign } = account.account;

	const response = await fetch(`/api/profiles/${uuid}/selected`);

	if (!response.ok) {
		throw redirect(303, `/search/${id}`);
	}

	const data = (await response.json()) as { profile: ProfileData; success: boolean };

	if (!data.success) {
		throw redirect(303, `/search/${id}`);
	}

	throw redirect(303, `/stats/${ign}/${data.profile.profile_id}`);
};
