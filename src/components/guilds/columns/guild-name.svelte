<script lang="ts">
	import type { HypixelGuildDetailsDto } from '$lib/api';

	interface Props {
		guild: HypixelGuildDetailsDto;
	}

	let { guild }: Props = $props();
</script>

<div class="flex flex-1 flex-col items-start justify-center gap-1 py-1 pl-1">
	<p class="flex flex-row items-center gap-1 text-base">
		<span class="text-lg font-semibold">{guild.name}</span>
	</p>
</div>
