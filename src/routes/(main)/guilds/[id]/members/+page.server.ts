import type { GuildMembersLeaderboard } from '$lib/api/elite';
import { getGuildMembersLeaderboard } from '$lib/remote/guilds.remote';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const DEFAULT_LEADERBOARD_ID = 'skyblockxp';

export const load = (async ({ parent, url }) => {
	const { guild, leaderboards } = await parent();

	if (!guild) {
		error(404, 'Guild not found');
	}

	const lookup = leaderboards?.leaderboards ?? {};
	const requested = url.searchParams.get('leaderboard') ?? undefined;

	const modeParam = url.searchParams.get('mode') ?? undefined;
	const mode =
		modeParam && ['classic', 'ironman', 'island'].includes(modeParam)
			? (modeParam as 'classic' | 'ironman' | 'island')
			: undefined;
	const interval = url.searchParams.get('interval') ?? undefined;
	const removedParam = url.searchParams.get('removed') ?? undefined;
	const removed = removedParam && removedParam.match(/^[012]$/) ? (Number(removedParam) as 0 | 1 | 2) : undefined;

	let selected: string | undefined;

	if (requested && lookup[requested]) {
		selected = requested;
	} else if (lookup[DEFAULT_LEADERBOARD_ID]) {
		selected = DEFAULT_LEADERBOARD_ID;
	} else {
		selected = Object.keys(lookup)[0];
	}

	let initialLeaderboard: GuildMembersLeaderboard | null = null;
	let loadError: string | null = null;

	if (selected && lookup[selected]) {
		try {
			const result = await getGuildMembersLeaderboard({
				guildId: guild.id,
				leaderboardId: selected,
				interval,
				mode,
				removed,
			});

			if (result) {
				initialLeaderboard = result;
			}
		} catch (cause) {
			console.error('Failed to load guild member leaderboard', cause);
			loadError = 'Unable to load guild member leaderboard.';
		}
	}

	return {
		selectedLeaderboardId: selected,
		initialLeaderboard,
		initialError: loadError,
		selectedInterval: interval,
		selectedMode: mode,
		selectedRemoved: removed,
	};
}) satisfies PageServerLoad;
