import type { AccountInfo, PlayerInfo, Profiles } from '$lib/skyblock';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const accountRes = await fetch(`/api/account/${params.id}`);

	if (!accountRes.ok) {
		throw error(404, accountRes.statusText);
	}

	const { account }: AccountInfo = await accountRes.json();

	if (!account) {
		throw error(404, 'Account not found');
	}

	const profilesFetch = fetch(`/api/profiles/${account.id}`);
	const playerFetch = fetch(`/api/player/${account.id}`);

	try {
		const [ profilesRes, playerRes ] = await Promise.all([ profilesFetch, playerFetch ]);
		const [ profiles, player ] = await Promise.all([ profilesRes.json(), playerRes.json() ]);

		return { 
			account: account, 
			profiles: profiles as Profiles, 
			player: player as PlayerInfo, 
			profileName: params.profile 
		};
	} catch (err) {
		throw error(404);
	}
}
