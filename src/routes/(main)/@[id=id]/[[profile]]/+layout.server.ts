import { getPlayerLeaderboardRanks, getProfile } from '$lib/api';
import { getProfilesAccount } from '$lib/remote';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, locals }) => {
	const profileDataPromise = getProfilesAccount({
		id: params.id,
		profile: params.profile,
	});

	if (locals.bot) {
		const profileData = await profileDataPromise;

		if (profileData.account?.id && profileData.profile?.profileId) {
			const [memberData, ranksData] = await Promise.all([
				getProfile(profileData.account.id, profileData.profile.profileId).then((res) => res.data),
				getPlayerLeaderboardRanks(profileData.account.id, profileData.profile.profileId).then(
					(res) => res.data
				),
			]);

			return {
				profileData,
				ssrMemberData: memberData,
				ssrRanksData: ranksData,
			};
		}

		return {
			profileData,
		};
	}

	return {
		profileData: profileDataPromise,
	};
};
