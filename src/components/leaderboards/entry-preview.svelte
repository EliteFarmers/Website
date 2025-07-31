<script lang="ts">
	import type { components } from '$lib/api/api';
	import type { LeaderboardEntry } from '$lib/api/elite';
	import type { LeaderboardStyle } from '$lib/styles/style';
	import Entry from './entry.svelte';

	interface Props {
		ign: string;
		uuid: string;
		styleId?: number;
		style?: components['schemas']['WeightStyleWithDataDto']['leaderboard'] | LeaderboardStyle;
		showLeaderboardName?: boolean;
	}

	let { ign, uuid, style, showLeaderboardName, styleId }: Props = $props();

	const entry = $derived({
		profile: 'Raspberry',
		amount: 1234567,
		removed: false,
		initialAmount: 0,
		ign,
		uuid,
		style,
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
		scoreDataType: 0,
		category: 'General',
		profile: false,
		minimumScore: 1000,
		intervalType: 0,
		suffix: '',
	}}
	{showLeaderboardName}
/>
