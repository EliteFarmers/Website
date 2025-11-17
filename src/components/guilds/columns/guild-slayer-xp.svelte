<script lang="ts">
	import type { HypixelGuildDetailsDto } from '$lib/api';

	interface Props {
		guild: HypixelGuildDetailsDto;
	}

	let { guild }: Props = $props();

	const level = $derived(+(guild.stats?.slayerExperience.total ?? 0).toFixed(1));
</script>

<div class="flex flex-1 flex-col items-end justify-center gap-1">
	<p class="flex flex-row items-center gap-1 font-mono text-base">
		<span>{level.toLocaleString()}</span>
	</p>
</div>
