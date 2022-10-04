import type { UserInfo, WeightInfo } from '$db/models/users';
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

		let profileId = params.profile;
		let profileName = profileId;
		// If the profile ID is long then it's a UUID, so we need to find the name

		let profile =
			profileId.length > 20
				? profiles.profiles.find((p) => p.profile_id.toUpperCase() === profileId.toUpperCase())
				: profiles.profiles.find((p) => p.cute_name.toUpperCase() === profileId.toUpperCase());

		profileId = profile?.profile_id ?? profileId;
		profileName = profile?.cute_name ?? profileName;

		if (!profile) {
			if (profiles.profiles.length <= 0) {
				throw error(404, 'No profiles found');
			}

			const selected = profiles.profiles.find((p) => p.selected);
			profile = selected ?? profiles.profiles[0];
		}

		const profileIds = profiles.profiles
			.filter((p) => p.profile_id !== profile?.profile_id)
			.map((p) => ({
				id: p.profile_id,
				name: p.cute_name,
			}));
		profileIds.unshift({ id: profile.profile_id, name: profile.cute_name });

		const weightFetch = await fetch(`/api/weight/${account.id}/${profileId}`);
		const weight = (await weightFetch.json()) as WeightInfo;

		return {
			account: account,
			profile: profile,
			profiles: profileIds,
			player: player,
			profileName: profileName,
			user: user,
			weight: weight,
			last_fetched: profiles.last_fetched,
		};
	} catch (err) {
		console.error(err);
		throw error(404);
	}
};
