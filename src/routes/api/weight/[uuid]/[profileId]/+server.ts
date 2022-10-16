import { GetUser, UpdateUserInfo } from '$db/database';
import type { UserInfo } from '$db/models/users';
import { HYPIXEL_API_KEY } from '$env/static/private';
import { PROFILE_UPDATE_INTERVAL } from '$lib/constants/data';
import { accountFromUUID, fetchProfiles } from '$lib/data';
import { CalculateWeight } from '$lib/weight';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const uuid = params.uuid.replaceAll('-', '');

	if (!uuid || uuid.length !== 32) {
		return new Response(JSON.stringify({ error: 'Not a valid UUID' }), { status: 400 });
	}

	let user = await GetUser(uuid);

	if (!user) {
		// Create a new user
		const account = await accountFromUUID(uuid);

		if (account) {
			return new Response(JSON.stringify({ error: 'Account not found' }), { status: 404 });
		}

		user = await GetUser(uuid);

		if (!user) {
			return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
		}
	}

	const profilesData = await fetchProfiles(uuid, HYPIXEL_API_KEY);

	if (!profilesData?.success) {
		return new Response(JSON.stringify({ error: 'Profiles not found' }), { status: 404 });
	}

	const profiles = profilesData.profiles;
	const info = user.info as Partial<UserInfo> | undefined;

	if (!info) {
		return new Response(JSON.stringify({ error: 'User info not found' }), { status: 404 });
	}

	// If the profile data is recent enough, use the cached data
	if (
		Date.now() - profilesData.last_fetched < PROFILE_UPDATE_INTERVAL &&
		info.profiles &&
		info.profiles[params.profileId]
	) {
		const profile = info.profiles[params.profileId];
		return new Response(JSON.stringify(profile ?? { error: 'Profile not found.' }), {
			status: profile ? 200 : 404,
		});
	}

	const weightData = CalculateWeight(profiles);
	info.profiles = weightData;

	void UpdateUserInfo(uuid, info);

	const profile = info.profiles[params.profileId];
	return new Response(JSON.stringify(profile ?? { error: 'Profile not found.' }), { status: profile ? 200 : 404 });
};
