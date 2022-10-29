import { error, redirect } from '@sveltejs/kit';
import type { AccountInfo, Profiles } from '$lib/skyblock';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	let uuid = params.id;
	let ign;

	if (uuid.length < 17) {
		// UUID is probably an IGN, check if matches valid characters
		if (!uuid.match(/^[a-zA-Z0-9_]+$/)) {
			throw error(400, 'Not a valid username!');
		}

		const account = await fetch(`/api/account/${uuid}`);
		const info = (await account.json().catch(() => undefined)) as AccountInfo | undefined;

		if (!info?.success) {
			throw error(404, 'Account not found!');
		}

		uuid = account.ok ? info.account.id : '';
		ign = account.ok ? info.account.name : undefined;
	}

	if (uuid === '' && ign === undefined) {
		throw redirect(303, '/');
	}

	const response = await fetch(`/api/profiles/${uuid}`);

	if (!response.ok) {
		throw redirect(303, '/');
	}

	const data = (await response.json()) as Profiles;

	// Get latest profile
	const name = data.profiles.filter((a) => a.selected)[0]?.cute_name;

	if (ign && name) {
		throw redirect(303, `/stats/${ign}/${name}`);
	}

	throw error(404, 'Skyblock profile not found for this player!');
};
