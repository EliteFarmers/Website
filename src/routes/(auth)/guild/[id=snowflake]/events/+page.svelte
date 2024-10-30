<script lang="ts">
	import { Button } from '$ui/button';
	import * as Popover from '$ui/popover';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
	import Settings from 'lucide-svelte/icons/settings';
	import type { PageData } from './$types';
	import Head from '$comp/head.svelte';
	import Guildicon from '$comp/stats/discord/guildicon.svelte';
	import CreateEvent from './create-event.svelte';

	export let data: PageData;

	let clickOutsideModal = false;

	// Filter out events made more than a month ago
	$: recentEvents =
		data.createdEvents?.filter((e) => new Date(e.createdAt ?? 0).getTime() > Date.now() - 2592000000) ?? [];

	$: events = data.events?.sort((a, b) => b?.endTime?.localeCompare(a?.endTime ?? '') ?? 0) ?? [];
</script>

<Head title="Events" description="Manage Events happening in your guild" />

<main class="flex flex-col items-center gap-4">
	<div class="flex flex-row items-center gap-4">
		<Guildicon guild={data.guild} size={16} />
		<h1 class="text-4xl my-16">
			{data.guild?.name}
		</h1>
	</div>

	<section class="flex flex-col gap-4">
		<p class="text-lg">
			You have {recentEvents.length} / {data.maxMonthlyEvents ?? 0} available Events created
		</p>
		{#if (recentEvents.length ?? 0) < (data.maxMonthlyEvents ?? 0)}
			<div class="flex w-full justify-center items-center">
				<Button on:click={() => (clickOutsideModal = true)}>Create New</Button>
			</div>
		{/if}
	</section>

	<section
		class="flex flex-col gap-8 justify-center items-center justify-items-center w-[90%] md:w-[70%] max-w-screen-lg mb-16"
	>
		{#each events as event (event.id)}
			<div
				class="flex p-4 flex-col justify-center justify-items-center w-[90%] md:w-[70%] max-w-screen-lg bg-primary-foreground rounded-md"
			>
				<div class="flex flex-row justify-between p-4 gap-2">
					<div class="flex flex-col gap-2">
						<div class="flex flex-row items-center gap-2">
							{#if !event.approved}
								<Popover.Mobile>
									<div slot="trigger">
										<TriangleAlert class="text-red-500 mt-1.5" />
									</div>
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
						<div class="flex flex-row gap-2 font-semibold items-center text-lg">
							<span>{new Date(+(event.startTime ?? 0) * 1000).toLocaleDateString()}</span>
							<span>{new Date(+(event.startTime ?? 0) * 1000).toLocaleTimeString()}</span>
							<span> - </span>
							<span>{new Date(+(event.endTime ?? 0) * 1000).toLocaleDateString()}</span>
							<span>{new Date(+(event.endTime ?? 0) * 1000).toLocaleTimeString()}</span>
						</div>
					</div>
					<div class="p-4 flex flex-col gap-2">
						<Popover.Mobile>
							<div slot="trigger">
								<Button href="/guild/{event.guildId}/event/{event.id}">
									<Settings />
								</Button>
							</div>
							<div>
								<p>Edit Event</p>
							</div>
						</Popover.Mobile>

						{#if event.approved}
							<Popover.Mobile>
								<div slot="trigger">
									<Button href="/event/{event.id}" target="_blank">
										<ExternalLink />
									</Button>
								</div>
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
</main>

<CreateEvent bind:open={clickOutsideModal} />
