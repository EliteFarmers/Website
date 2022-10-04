<script lang="ts">
	import type { WeightInfo } from '$db/models/users';

	export let weightInfo: WeightInfo;

	const weightStr = weightInfo?.farming?.total?.toLocaleString() ?? '0';
</script>

<section>
	<h2 class="py-2">Farming Weight</h2>
	<h1 class="text-7xl md:text-8xl">{weightStr}</h1>
</section>
