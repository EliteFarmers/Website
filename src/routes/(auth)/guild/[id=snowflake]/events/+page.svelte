<script lang="ts">
	import { Button } from '$ui/button';
	import * as Popover from '$ui/popover';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
	import Settings from 'lucide-svelte/icons/settings';
	import type { PageData } from './$types';
	import Head from '$comp/head.svelte';
	import GuildIcon from '$comp/discord/guild-icon.svelte';
	import CreateEvent from './create-event.svelte';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import { page } from '$app/state';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let clickOutsideModal = $state(false);

	// Filter out events made more than a month ago
	let recentEvents = $derived(
		data.createdEvents?.filter((e) => new Date(e.createdAt ?? 0).getTime() > Date.now() - 2592000000) ?? []
	);

	let events = $derived(data.events?.sort((a, b) => b?.endTime?.localeCompare(a?.endTime ?? '') ?? 0) ?? []);

	const favorites = getFavoritesContext();
	favorites.setPage({
		icon: data.guild.icon?.url ?? undefined,
		name: 'Events',
		href: page.url.pathname,
	});
</script>

<Head title="Events" description="Manage Events happening in your guild" />

<div class="flex flex-col items-center gap-4">
	<div class="flex flex-row items-center gap-4">
		<GuildIcon guild={data.guild} size={16} />
		<h1 class="my-16 text-4xl">
			{data.guild?.name}
		</h1>
	</div>

	<section class="flex flex-col gap-4">
		<p class="text-lg">
			You have {recentEvents.length} / {data.maxMonthlyEvents ?? 0} available Events created
		</p>
		{#if (recentEvents.length ?? 0) < (data.maxMonthlyEvents ?? 0)}
			<div class="flex w-full items-center justify-center">
				<Button
					onclick={() => (clickOutsideModal = true)}
					disabled={data.guild.features?.eventsEnabled !== true}>Create New</Button
				>
			</div>
		{/if}
	</section>

	<section
		class="mb-16 flex w-[90%] max-w-screen-lg flex-col items-center justify-center justify-items-center gap-8 md:w-[70%]"
	>
		{#each events as event (event.id)}
			<div
				class="flex w-[90%] max-w-screen-lg flex-col justify-center justify-items-center rounded-md bg-card p-4 md:w-[70%]"
			>
				<div class="flex flex-row justify-between gap-2 p-4">
					<div class="flex flex-col gap-2">
						<div class="flex flex-row items-center gap-2">
							{#if !event.approved}
								<Popover.Mobile>
									{#snippet trigger()}
										<div>
											<TriangleAlert class="mt-1.5 text-destructive" />
										</div>
									{/snippet}
									<div>
										<p class="font-semibold">Pending approval!</p>
										<p>Ask kaeso.dev to approve this event.</p>
									</div>
								</Popover.Mobile>
							{/if}
							<h2 class="text-3xl">{event.name}</h2>
						</div>

						<p class="text-lg">{event.description}</p>
						<p class="text-lg">{event.rules}</p>
						<p class="text-lg">{event.prizeInfo}</p>
						<div class="flex flex-row items-center gap-2 text-lg font-semibold">
							<span>{new Date(+(event.startTime ?? 0) * 1000).toLocaleDateString()}</span>
							<span>{new Date(+(event.startTime ?? 0) * 1000).toLocaleTimeString()}</span>
							<span> - </span>
							<span>{new Date(+(event.endTime ?? 0) * 1000).toLocaleDateString()}</span>
							<span>{new Date(+(event.endTime ?? 0) * 1000).toLocaleTimeString()}</span>
						</div>
					</div>
					<div class="flex flex-col gap-2 p-4">
						<Popover.Mobile>
							{#snippet child({ props })}
								<Button href="/guild/{event.guildId}/event/{event.id}" {...props}>
									<Settings />
								</Button>
							{/snippet}
							<div>
								<p>Edit Event</p>
							</div>
						</Popover.Mobile>

						{#if event.approved}
							<Popover.Mobile>
								{#snippet child({ props })}
									<Button href="/event/{event.id}" target="_blank" {...props}>
										<ExternalLink />
									</Button>
								{/snippet}
								<div>
									<p>View Event Page</p>
								</div>
							</Popover.Mobile>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</section>
</div>

<CreateEvent bind:open={clickOutsideModal} />
