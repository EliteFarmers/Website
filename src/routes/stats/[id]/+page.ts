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
		const info = (await account.json()) as AccountInfo;

		uuid = account.ok ? info.account.id : '';
		ign = account.ok ? info.account.name : undefined;
	}

	if (uuid === '') {
		throw redirect(302, '/');
	}

	const response = await fetch(`/api/profiles/${uuid}`);

	if (!response.ok) {
		throw redirect(302, '/');
	}

	const data = (await response.json()) as Profiles;

	// Get latest profile
	data.profiles.sort((a, b) => b.member.last_save - a.member.last_save);
	const name = data.profiles[0]?.cute_name;

	if (ign && name) {
		throw redirect(302, `/stats/${ign}/${name}`);
	}

	throw redirect(302, '/');
};
