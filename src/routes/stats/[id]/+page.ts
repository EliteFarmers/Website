import { redirect } from '@sveltejs/kit';
import type { AccountInfo, Profiles } from '$lib/skyblock';
import type { PageLoad } from './$types';
import { browser } from '$app/env';
import { goto } from '$app/navigation';

export const load: PageLoad = async ({ params, fetch }) => {

	let uuid = params.id;
	let ign; 

	if (uuid.length < 17) {
		const account = await fetch(`/api/account/${uuid}`);
		const info: AccountInfo = await account.json();

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

	const data: Profiles = await response.json();

	// Get latest profile
	data?.profiles?.sort((a, b) => b.member.last_save - a.member.last_save);
	const name = data?.profiles?.[0]?.cute_name;

	if (ign && name) {
		// Hacky fix for https://github.com/sveltejs/kit/issues/5952
		const location = `/stats/${ign}/${name}`;
		if (browser) {
			return await goto(location);
		} else throw redirect(302, location);
	}

	throw redirect(302, '/');
}
