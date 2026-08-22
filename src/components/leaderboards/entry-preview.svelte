<script lang="ts">
	import { LeaderboardScoreDataType, LeaderboardType, type WeightStyleWithDataDto } from '$lib/api';
	import type { LeaderboardEntry } from '$lib/api/elite';
	import type { LeaderboardStyle } from '$lib/styles/style';
	import Entry from './entry.svelte';

	interface Props {
		ign: string;
		uuid: string;
		styleId?: number;
		style?: WeightStyleWithDataDto['leaderboard'] | LeaderboardStyle;
		frame?: NonNullable<WeightStyleWithDataDto['frame']>['leaderboard'];
		showLeaderboardName?: boolean;
		imageRefs?: WeightStyleWithDataDto['imageRefs'];
		frameImageRefs?: WeightStyleWithDataDto['imageRefs'];
	}

	let { ign, uuid, style, frame, showLeaderboardName, styleId, imageRefs, frameImageRefs }: Props = $props();

	const entry = $derived({
		profile: 'Raspberry',
		amount: 1234567,
		removed: false,
		initialAmount: 0,
		ign,
		uuid,
		style: style as WeightStyleWithDataDto['leaderboard'],
		imageRefs,
		frame,
		frameImageRefs,
		meta: {
			leaderboard: {
				styleId: styleId ?? undefined,
			},
		},
	} satisfies LeaderboardEntry);
</script>

<Entry
	{entry}
	rank={3113}
	leaderboard={{
		title: 'Farming Weight',
		id: 'farmingweight',
		scoreDataType: LeaderboardScoreDataType.Decimal,
		category: 'General',
		profile: false,
		minimumScore: 1000,
		cachedRankAmount: 50000,
		intervalType: LeaderboardType.Current,
		suffix: '',
	}}
	{showLeaderboardName}
	disabled={true}
/>
