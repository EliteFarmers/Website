<script lang="ts">
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import SmallAnnouncement from './small-announcement.svelte';

	const ctx = getGlobalContext();

	const filteredAnnouncements = $derived(ctx.announcements);
</script>

{#if filteredAnnouncements.length > 0}
	<div class="sticky top-16 z-40 w-full">
		<div class="relative">
			{#each filteredAnnouncements as a (a.id)}
				<SmallAnnouncement announcement={a} />
			{/each}
		</div>
	</div>
{/if}
