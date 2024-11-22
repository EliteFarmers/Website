<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
	import { applyAction, enhance } from '$app/forms';
	import { DatePicker } from '$ui/date-picker';
	import { Checkbox } from '$ui/checkbox';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';

	import Cropselector from '$comp/stats/contests/cropselector.svelte';
	import Graph from '$comp/charts/collectiongraph.svelte';
	import Head from '$comp/head.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data = $bindable(), form }: Props = $props();

	let collectionGraph = $derived(form?.graph ?? data.collectionGraph ?? []);

	let tz = $derived(getLocalTimeZone());
	let initEnd = $derived(today(tz));
	let initStart = $derived(initEnd.subtract({ days: 14 }));

	let showAll = $state(false);
	let disabled = $state(false);

	let value = $state<CalendarDate>((() => initStart)());

	$effect.pre(() => {
		value = initStart;
	});

	let startTime = $derived(Math.floor(value.toDate(tz).getTime() / 1000));
</script>

<Head title="Player Charts" description="Admin page to view player stats" />

<main class="my-16 flex flex-col items-center justify-center gap-2">
	<h1 class="text-4xl">{data.account?.name} | {data.selectedProfile?.profileName}</h1>
	<p>Discord ID: {data.account?.discordId}</p>
	<p>Discord: {data.account?.discordUsername}</p>

	<Cropselector />

	<div class="flex w-full flex-col items-center gap-4">
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
			<input type="hidden" value={startTime} name="start" />
			<input type="hidden" bind:value={showAll} name="all" />
			<input type="hidden" value={7} name="days" />

			<div class="flex flex-col items-center gap-2">
				<div class="flex flex-row items-center gap-2">
					<DatePicker bind:value />
					<Button type="submit" variant="default" {disabled}>Update</Button>
				</div>
				<div class="flex flex-row items-center gap-2">
					<Checkbox bind:checked={showAll} id="check" />
					<Label for="check">Load all points</Label>
				</div>
			</div>
		</form>
		<!-- <Skillgraph points={data.skillGraph ?? []} /> -->
	</div>
</main>
