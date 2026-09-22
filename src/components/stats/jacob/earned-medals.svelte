<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import MedalCounts from './medalcounts.svelte';

	const ctx = getStatsContext();
	const jacob = $derived(ctx.member.current?.jacob);
</script>

<MedalCounts
	participations={jacob?.contests?.length ?? 0}
	medals={{
		diamond: jacob?.earnedMedals?.diamond ?? 0,
		platinum: jacob?.earnedMedals?.platinum ?? 0,
		gold: jacob?.earnedMedals?.gold ?? 0,
		silver: jacob?.earnedMedals?.silver ?? 0,
		bronze: jacob?.earnedMedals?.bronze ?? 0,
	}}
/>
