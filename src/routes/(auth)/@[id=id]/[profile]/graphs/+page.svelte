<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import { applyAction, enhance } from '$app/forms';
	import { DatePicker } from '$ui/date-picker';
	import { Checkbox } from '$ui/checkbox';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';

	import Cropselector from '$comp/stats/contests/cropselector.svelte';
	import Graph from '$comp/charts/collectiongraph.svelte';
	import Head from '$comp/head.svelte';

	export let data: PageData;
	export let form: ActionData;

	$: collectionGraph = form?.graph ?? data.collectionGraph ?? [];

	$: tz = getLocalTimeZone();

	let initEnd = today(tz);
	let initStart = initEnd.subtract({ days: 14 });

	let showAll = false;
	let disabled = false;

	$: value = initStart;

	$: startTime = Math.floor(value.toDate(tz).getTime() / 1000);
</script>

<Head title="Player Charts" description="Admin page to view player stats" />

<main class="flex flex-col gap-2 justify-center items-center my-16">
	<h1 class="text-4xl">{data.account?.name} | {data.selectedProfile?.profileName}</h1>
	<p>Discord ID: {data.account?.discordId}</p>
	<p>Discord: {data.account?.discordUsername}</p>

	<Cropselector />

	<div class="flex flex-col gap-4 w-full items-center">
		<Graph points={collectionGraph} />
		<form
			method="post"
			action="?/collectiongraph"
			use:enhance={() => {
				disabled = true;

				return async ({ result }) => {
					await applyAction(result);
					disabled = false;
				};
			}}
		>
			<input type="hidden" bind:value={data.account.id} name="uuid" />
			<input type="hidden" bind:value={data.selectedProfile.profileId} name="profile" />
			<input type="hidden" bind:value={startTime} name="start" />
			<input type="hidden" bind:value={showAll} name="all" />
			<input type="hidden" value={7} name="days" />

			<div class="flex flex-col gap-2 items-center">
				<div class="flex flex-row gap-2 items-center">
					<DatePicker bind:value />
					<Button type="submit" variant="default" bind:disabled>Update</Button>
				</div>
				<div class="flex flex-row gap-2 items-center">
					<Checkbox bind:checked={showAll} id="check" />
					<Label for="check">Load all points</Label>
				</div>
			</div>
		</form>
		<!-- <Skillgraph points={data.skillGraph ?? []} /> -->
	</div>
</main>
