<script lang="ts">
	import RenderHtml from '$comp/markdown/render-html.svelte';
	import type { AnnouncementDto } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { Button } from '$ui/button';
	import X from '@lucide/svelte/icons/x';
	import AnnouncementIcon from './announcement-icon.svelte';

	const ctx = getGlobalContext();

	const filteredAnnouncements = $derived(ctx.announcements);
</script>

{#if filteredAnnouncements.length > 0}
	<div class="mx-2 flex flex-col gap-2 py-4 sm:px-1">
		{#each filteredAnnouncements as a (a.id)}
			{@render announcement(a)}
		{/each}
	</div>
{/if}

{#snippet announcement(a: AnnouncementDto)}
	<div
		class="bg-card border-completed group flex scroll-mt-32 flex-col items-center justify-between gap-4 rounded-lg border-2 p-2 text-sm transition-transform sm:flex-row"
		id="announcement-{a.id}"
	>
		<div class="flex items-center gap-2">
			<AnnouncementIcon announcement={a} class="mx-2 hidden size-9 md:block lg:mx-3 lg:size-10" />
			<div class="flex flex-col">
				<span>
					<AnnouncementIcon announcement={a} class="mb-1 inline size-6 md:hidden" />
					<span class="text-lg font-semibold md:text-xl">{a.title}</span>
				</span>
				<span class="text-muted-foreground mt-3 max-w-2xl text-sm sm:mt-1">
					<RenderHtml content={a.content} />
				</span>
			</div>
		</div>
		<div class="mx-2 flex w-full flex-row items-center justify-evenly gap-2 sm:w-fit sm:flex-col md:flex-row">
			<Button
				variant="outline"
				class="hover:bg-secondary-hover w-full flex-initial rounded-md p-1 sm:flex-1 md:w-fit"
				onclick={() => {
					ctx.dismissAnnouncement(a.id);
				}}
			>
				<X />
				<span class="md:hidden">Dismiss</span>
			</Button>
			{#if a.targetUrl && a.targetUrl !== '/'}
				<Button href={a.targetUrl} class="w-full flex-initial sm:flex-1 md:w-fit">
					{a.targetLabel || 'Learn More'}
				</Button>
			{/if}
		</div>
	</div>
{/snippet}
