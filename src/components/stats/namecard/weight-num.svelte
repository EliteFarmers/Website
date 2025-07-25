<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	const ctx = getStatsContext();

	const weightInfo = $derived(ctx.member.farmingWeight);
	const weightStr = $derived(weightInfo?.totalWeight?.toLocaleString() ?? '0');
</script>

<div class="block">
	<div class="object-scale-down">
		<h1 class="text-5xl font-semibold md:text-6xl lg:text-8xl">{weightStr}</h1>
	</div>
</div>
