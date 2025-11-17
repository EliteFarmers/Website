<script lang="ts">
	import type { HypixelGuildDetailsDto } from '$lib/api';

	interface Props {
		guild: HypixelGuildDetailsDto;
	}

	let { guild }: Props = $props();

	const level = $derived(+((guild.stats?.skyblockExperience.average ?? 0) / 100).toFixed(1));
</script>

<div class="flex flex-1 flex-col items-start justify-center gap-1">
	<p class="flex flex-row items-center gap-1 text-base">
		<span>{level.toLocaleString()}</span>
	</p>
</div>
