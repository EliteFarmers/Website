<script lang="ts">
	import { Button } from '$ui/button';
	import * as Popover from '$ui/popover';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Settings from '@lucide/svelte/icons/settings';
	import type { PageData } from './$types';
	import Head from '$comp/head.svelte';
	import GuildIcon from '$comp/discord/guild-icon.svelte';
	import CreateEvent from './create-event.svelte';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import { page } from '$app/state';
	import EventType from '$comp/events/event-type.svelte';
	import { getBreadcrumb, type Crumb } from '$lib/hooks/breadcrumb.svelte';

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

	const crumbs = $derived<Crumb[]>([
		{
			name: 'Servers',
			href: '/profile/servers',
		},
		{
			name: data.guild.name,
			href: `/guild/${data.guild.id}`,
		},
		{
			name: 'Events',
		},
	]);

	const breadcrumb = getBreadcrumb();
	$effect.pre(() => {
		breadcrumb.setOverride(crumbs);
	});

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
			You have {recentEvents.length} / {data.maxMonthlyEvents ?? 0} available Events created.
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

	<section class="mb-16 flex max-w-screen-lg flex-col items-center justify-center justify-items-center gap-8">
		{#each events as event (event.id)}
			{@const start = new Date(+(event.startTime ?? 0) * 1000)}
			{@const end = new Date(+(event.endTime ?? 0) * 1000)}
			{@const background = event.banner?.url
				? `background-image: url(${event.banner.url}); color: white;`
				: data.guild?.banner?.url
					? `background-image: url(${data.guild.banner.url}); color: white;`
					: ''}
			<div
				class="relative flex w-full flex-1 flex-row items-center justify-start gap-8 rounded-lg bg-card bg-cover bg-center bg-no-repeat p-8 py-8 align-middle"
				style={background || ''}
			>
				{#if data.guild?.banner}
					<div
						class="absolute bottom-0 left-0 right-0 top-0 rounded-lg bg-gradient-to-r from-zinc-900/70 via-transparent to-zinc-900/70"
					></div>
				{/if}
				<GuildIcon guild={data.guild} class="z-10 size-12" />
				<div class="z-10 flex w-full flex-col items-start justify-between gap-1 md:flex-row">
					<div class="flex flex-col items-start gap-1">
						<div class="flex flex-row items-center gap-2">
							{#if !event.approved}
								<Popover.Mobile>
									{#snippet trigger()}
										<TriangleAlert class="mt-1.5 size-5 text-destructive" />
									{/snippet}
									<div>
										<p class="font-semibold">Pending approval!</p>
										<p>Ask kaeso.dev to approve this event.</p>
									</div>
								</Popover.Mobile>
							{/if}
							<h2 class="text-md xs:text-lg font-semibold sm:text-2xl md:text-2xl">{event.name}</h2>
						</div>
						<EventType type={event.type ?? 1} />
					</div>
					<div class="flex flex-col items-start gap-2 md:items-end">
						<div class="z-10 flex flex-row items-center gap-2 font-semibold sm:text-sm md:text-lg">
							<span>{start.toLocaleDateString()}</span>
							<span> - </span>
							<span>{end.toLocaleDateString()}</span>
						</div>
						<div class="flex flex-row gap-2">
							{#if event.approved}
								<Popover.Mobile>
									{#snippet child({ props })}
										<Button href="/event/{event.id}" target="_blank" {...props} size="sm">
											<ExternalLink />
										</Button>
									{/snippet}
									<div>
										<p>View Event Page</p>
									</div>
								</Popover.Mobile>
							{/if}
							<Popover.Mobile>
								{#snippet child({ props })}
									<Button href="/guild/{event.guildId}/event/{event.id}" {...props} size="sm">
										<Settings />
									</Button>
								{/snippet}
								<div>
									<p>Edit Event</p>
								</div>
							</Popover.Mobile>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</section>
</div>

<CreateEvent bind:open={clickOutsideModal} />
