<script lang="ts">
	import { page } from '$app/state';
	import { OTHER_SITES } from '$content/othersites';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Popover from '$ui/popover';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Globe from '@lucide/svelte/icons/globe';

	const ctx = getStatsContext();
</script>

<nav class="sr-only" aria-label="External profile links">
	{@render externalSiteLinks('underline', false)}
</nav>

<Popover.Mobile triggerClass="m-0 flex flex-row items-center justify-between gap-2 rounded-md border p-2 md:p-3">
	{#snippet trigger()}
		<Globe class="inline-block" />
	{/snippet}
	<div class="flex flex-col gap-2" data-sveltekit-preload-data="tap">
		{@render externalSiteLinks(
			'hover:bg-muted flex flex-row items-center justify-between gap-2 rounded-md p-2 px-3'
		)}
	</div>
</Popover.Mobile>

{#snippet externalSiteLinks(className: string, icon = true)}
	{#each OTHER_SITES as site (site.name)}
		<a
			href={site.url({
				uuid: ctx.uuid ?? page.params.id,
				ign: ctx.ign,
				profile: ctx.selectedProfile?.profileName ?? page.params.profile,
			})}
			class={className}
			aria-label={site.label}
			target="_blank"
			rel={site.rel}
		>
			<p>
				{site.name}
			</p>
			{#if icon}
				<ExternalLink size={16} />
			{/if}
		</a>
	{/each}
{/snippet}
