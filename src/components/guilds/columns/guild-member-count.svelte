<script lang="ts">
	import type { HypixelGuildDetailsDto } from '$lib/api';

	interface Props {
		guild: HypixelGuildDetailsDto;
	}

	let { guild }: Props = $props();
</script>

<div class="flex min-w-80 flex-1 flex-col items-start justify-center gap-1">
	<p class="flex flex-row items-center gap-1 text-base">
		<span class="font-bold">{guild.memberCount}</span>
	</p>
</div>
