<script lang="ts">
	import type { HypixelGuildDetailsDto } from '$lib/api';
	import GuildTag from '../guild-tag.svelte';

	interface Props {
		guild: HypixelGuildDetailsDto;
		rank: number;
	}

	let { guild, rank }: Props = $props();
</script>

<div class="flex items-center gap-3 py-1 pl-1">
	<span class="text-muted-foreground min-w-9 shrink-0 text-right font-mono">#{rank}</span>
	<div class="flex flex-1 flex-col justify-center gap-1">
		<a
			href="/guilds/{guild.id}"
			class="text-foreground hover:text-primary flex items-center gap-2 text-lg font-semibold transition hover:underline"
		>
			<span>{guild.name}</span>
			{#if guild.tag}
				<GuildTag tag={guild.tag} tagColor={guild.tagColor} />
			{/if}
		</a>
	</div>
</div>
