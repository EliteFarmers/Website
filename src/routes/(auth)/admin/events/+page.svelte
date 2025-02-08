<script lang="ts">
	import { enhance } from '$app/forms';
	import Head from '$comp/head.svelte';
	import { Button } from '$ui/button';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<Head title="Events" description="Manage events" />

<div class="my-16">
	<section class="my-8 flex w-full max-w-2xl flex-col gap-4">
		<h1 class="mb-16 text-4xl">Events</h1>

		<h2 class="text-2xl">Pending Events</h2>
		<div class="flex w-full flex-col gap-4">
			{#each data.pending as event (event.id)}
				<div class="flex w-full flex-col items-center justify-between gap-2 rounded-md bg-card p-2 md:flex-row">
					<div class="flex flex-col gap-2">
						<h3 class="text-lg">{event.name}</h3>
						<p class="text-sm">{event.description}</p>
					</div>
					<div class="flex flex-row gap-2">
						<Button href="/guild/{event.guildId}/event/{event.id}" variant="secondary">View</Button>
						<form action="?/approveevent" use:enhance method="post">
							<input type="hidden" name="eventId" value={event.id} />
							<Button type="submit">Approve</Button>
						</form>
					</div>
				</div>
			{/each}
			{#if data.pending.length === 0}
				<p class="my-8">No pending events!</p>
			{/if}
		</div>
	</section>

	<section class="my-8 flex w-full max-w-2xl flex-col gap-4">
		<h2 class="text-2xl">Current Events</h2>
		<div class="flex w-full flex-col gap-4">
			{#each data.upcoming as event (event.id)}
				<div class="flex w-full flex-col items-center justify-between gap-2 rounded-md bg-card p-2 md:flex-row">
					<div class="flex flex-col gap-2">
						<h3 class="text-lg">{event.name}</h3>
						<p class="text-sm">{event.description}</p>
					</div>
					<div class="flex flex-row gap-2">
						<Button href="/guild/{event.guildId}/event/{event.id}" variant="secondary">View</Button>
						<form action="?/approveevent" use:enhance method="post">
							<input type="hidden" name="eventId" value={event.id} />
							<input type="hidden" name="approve" value="false" />
							<Button type="submit" variant="destructive">Revoke Approval</Button>
						</form>
					</div>
				</div>
			{/each}
			{#if data.upcoming.length === 0}
				<p class="my-8">No current events!</p>
			{/if}
		</div>
	</section>
</div>
