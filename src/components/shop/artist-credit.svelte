<script lang="ts">
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import type { AuthorDto } from '$lib/api';
	import Paintbrush from '@lucide/svelte/icons/paintbrush';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		artist,
		class: className,
		prefix = 'By',
		...rest
	}: { artist: AuthorDto; prefix?: string } & HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class="flex items-center gap-2 {className ?? ''}" {...rest}>
	<Paintbrush class="text-muted-foreground" size={14} />
	<span class="text-muted-foreground text-sm">{prefix}</span>
	<a class="group flex items-center gap-2" href="/@{artist.id || artist.uuid}">
		{#if artist.avatar}
			<img src={artist.avatar} alt="{artist.name}'s avatar" class="size-5 rounded-full object-cover" />
		{:else if artist.uuid || artist.id}
			<PlayerHead uuid={artist.uuid || artist.id} />
		{/if}

		<span class="text-primary group-hover:underline">{artist.name}</span>
	</a>
</div>
