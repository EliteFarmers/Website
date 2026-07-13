import { getAccount } from '$lib/api';
import { getStreamerProfile } from '$lib/remote/streamers.remote';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	const profile = await getStreamerProfile(params.twitchLogin);
	const uuid = profile.streamer?.minecraftUuid;
	const minecraftAccount = uuid ? await getAccount(uuid).catch(() => null) : null;

	return {
		profile,
		minecraftName: minecraftAccount?.ok ? minecraftAccount.data.name : null,
	};
}) satisfies PageServerLoad;
