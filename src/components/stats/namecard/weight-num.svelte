<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	const ctx = getStatsContext();

	const weightInfo = $derived(ctx.member.farmingWeight);
	const weightStr = $derived(weightInfo?.totalWeight?.toLocaleString() ?? '0');
</script>

<div class="block">
	<div class="object-scale-down">
		<h1 class="text-4xl leading-none font-semibold sm:text-6xl md:text-7xl xl:text-8xl">{weightStr}</h1>
	</div>
</div>
