<script lang="ts">
	import type { HypixelGuildDetailsDto } from '$lib/api';
	import GuildTag from '../guild-tag.svelte';

	interface Props {
		guild: HypixelGuildDetailsDto;
	}

	let { guild }: Props = $props();
</script>

<div class="flex flex-1 flex-col items-start justify-center gap-1 py-1 pl-1">
	<p class="flex flex-row items-center gap-2 text-base">
		<span class="text-lg font-semibold">{guild.name}</span>
		{#if guild.tag}
			<GuildTag tag={guild.tag} tagColor={guild.tagColor} />
		{/if}
	</p>
</div>
