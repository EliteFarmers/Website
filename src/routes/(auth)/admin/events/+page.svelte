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

<main class="my-16">
	<section class="flex flex-col gap-4 w-full max-w-2xl my-8">
		<h1 class="text-4xl mb-16">Events</h1>

		<h2 class="text-2xl">Pending Events</h2>
		<div class="flex flex-col gap-4 w-full">
			{#each data.pending as event (event.id)}
				<div
					class="flex flex-col md:flex-row justify-between gap-2 w-full items-center p-2 rounded-md bg-primary-foreground"
				>
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

	<section class="flex flex-col gap-4 w-full max-w-2xl my-8">
		<h2 class="text-2xl">Current Events</h2>
		<div class="flex flex-col gap-4 w-full">
			{#each data.upcoming as event (event.id)}
				<div
					class="flex flex-col md:flex-row justify-between gap-2 w-full items-center p-2 rounded-md bg-primary-foreground"
				>
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
</main>
