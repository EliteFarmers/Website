<script lang="ts">
	import { page } from '$app/state';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import SmallAnnouncement from './small-announcement.svelte';

	const ctx = getGlobalContext();

	const filteredAnnouncements = $derived(ctx.announcements);
</script>

{#if filteredAnnouncements.length > 0 && !page.data.bot}
	<div class="sticky top-16 z-40 h-0 w-full overflow-visible">
		<div class="relative">
			{#each filteredAnnouncements as a (a.id)}
				<SmallAnnouncement announcement={a} />
			{/each}
		</div>
	</div>
{/if}
