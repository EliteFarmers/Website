<script lang="ts">
	import type { HypixelGuildDetailsDto } from '$lib/api';

	interface Props {
		guild: HypixelGuildDetailsDto;
	}

	let { guild }: Props = $props();

	const level = $derived(+((guild.stats?.skyblockExperience.average ?? 0) / 100).toFixed(2));
</script>

<div class="flex min-w-80 flex-1 flex-col items-start justify-center gap-1">
	<p class="flex flex-row items-center gap-1 text-base">
		<span class="font-semibold">{level.toLocaleString()}</span>
	</p>
</div>
