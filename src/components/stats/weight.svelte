<script lang="ts">
	import type { WeightInfo } from '$db/models/users';

	export let weightInfo: WeightInfo;
	export let rank: number;

	const rankText = rank !== -1 ? `#${rank}` : '';

	const weightStr = weightInfo?.farming?.total?.toLocaleString() ?? '0';
</script>

<section>
	<h2 class="py-2">
		<span class="mx-1 text-2xl font-semibold text-green-800 dark:text-green-300">{rankText}</span>
		Farming Weight
	</h2>
	<h1 class="text-7xl md:text-8xl">{weightStr}</h1>
</section>
