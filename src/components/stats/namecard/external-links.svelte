<script lang="ts">
	import { page } from '$app/state';
	import Globe from '@lucide/svelte/icons/globe';
	import * as Popover from '$ui/popover';
	import { OTHER_SITES } from '$content/othersites';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { getStatsContext } from '$lib/stores/stats.svelte';

	const ctx = getStatsContext();
</script>

<Popover.Mobile
	triggerRootClass="rounded-md border p-2 md:p-3"
	triggerClass="p-0 m-0 flex flex-row items-center justify-between gap-2"
>
	{#snippet trigger()}
		<Globe class="inline-block" />
	{/snippet}
	<div class="flex flex-col gap-2" data-sveltekit-preload-data="tap">
		{#each OTHER_SITES as site (site.name)}
			<a
				href={site.url(ctx.uuid ?? page.params.id, ctx.selectedProfile?.profileName ?? page.params.profile)}
				class="hover:bg-muted flex flex-row items-center justify-between gap-2 rounded-md p-2 px-3"
				target="_blank"
				rel="noopener noreferrer nofollow"
			>
				<p>
					{site.name}
				</p>
				<ExternalLink size={16} />
			</a>
		{/each}
	</div>
</Popover.Mobile>
