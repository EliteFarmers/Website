<script lang="ts">
	import type { HypixelGuildDetailsDto } from '$lib/api';
	import Users from '@lucide/svelte/icons/users';

	interface Props {
		guild: HypixelGuildDetailsDto;
	}

	let { guild }: Props = $props();
</script>

<div class="flex flex-1 flex-col items-start justify-center gap-1">
	<p class="flex flex-row items-center gap-1 text-base">
		<Users class="text-muted-foreground size-5" />
		<span>{guild.memberCount}</span>
	</p>
</div>
