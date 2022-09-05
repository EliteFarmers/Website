import type { UserInfo } from '$db/models/users';
import type { AccountInfo, PlayerInfo, Profiles } from '$lib/skyblock';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const accountRes = await fetch(`/api/account/${params.id}`);

	if (!accountRes.ok) {
		throw error(404, accountRes.statusText);
	}

	const data = (await accountRes.json()) as AccountInfo;

	if (!data.success) {
		throw error(404, 'Account not found');
	}

	const account = data.account;

	const profilesFetch = fetch(`/api/profiles/${account.id}`);
	const playerFetch = fetch(`/api/player/${account.id}`);
	const userFetch = fetch(`/api/info/${account.id}`);

	try {
		const [profilesRes, playerRes, userRes] = await Promise.all([profilesFetch, playerFetch, userFetch]);
		const [profiles, player, user] = (await Promise.all([
			profilesRes.json(),
			playerRes.json(),
			userRes.json(),
		])) as [Profiles, PlayerInfo, UserInfo];

		return {
			account: account,
			profiles: profiles,
			player: player,
			profileName: params.profile,
			user: user,
		};
	} catch (err) {
		throw error(404);
	}
};
