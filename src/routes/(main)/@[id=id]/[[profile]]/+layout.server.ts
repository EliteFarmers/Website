import { getPlayerLeaderboardRanks, getWithTimeout } from '$lib/api';
import { getProfileMember, getProfilesAccount } from '$lib/remote';
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
				getProfileMember({
					playerUuid: profileData.account.id,
					profileUuid: profileData.profile.profileId ?? '',
				}),
				getWithTimeout(
					(signal) =>
						getPlayerLeaderboardRanks(
							profileData.account.id,
							profileData.profile.profileId ?? '',
							undefined,
							{
								signal,
							}
						).then((res) => res.data),
					500
				),
			]);

			return {
				profileData,
				ssrProfileData: profileData,
				ssrMemberData: memberData ?? undefined,
				ssrRanksData: ranksData ?? undefined,
			};
		}

		return {
			profileData,
			ssrProfileData: profileData,
		};
	}

	return {
		profileData: profileDataPromise,
	};
};
