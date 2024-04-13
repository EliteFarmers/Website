<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import CropGraph from '$comp/charts/crop-graph.svelte';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import type { ActionData, PageData } from './$types';
	import { DatePicker } from '$ui/date-picker';
	import { Button } from '$ui/button';

	export let data: PageData;
	export let form: ActionData;

	$: crops =
		(form?.graph ?? data.crops)?.reduce<Record<string, { date: string; value: number }[]>>((acc, curr) => {
			for (const [crop, value] of Object.entries(curr.crops ?? {})) {
				acc[crop] ??= [];

                const last = acc[crop].at(-1);
                if (last && last.value > value) continue;

				acc[crop].push({
					date: (curr.timestamp ?? 0) + '',
					value: value ?? 0,
				});
			}
			return acc;
		}, {}) ?? {};

    $: tz = getLocalTimeZone();

	let initEnd = today(tz);
	let initStart = initEnd.subtract({ days: 7 });
	let disabled = false;

	$: value = initStart;
	$: startTime = Math.floor(value.toDate(tz).getTime() / 1000);
</script>

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
	<input type="hidden" bind:value={data.profile.profileId} name="profile" />
	<input type="hidden" bind:value={startTime} name="start" />
	<input type="hidden" value={7} name="days" />

	<div class="flex flex-col gap-2 items-center">
		<div class="flex flex-row gap-2 items-center">
			<DatePicker bind:value />
			<Button type="submit" variant="default" bind:disabled>Update</Button>
		</div>
	</div>
</form>

<div class="flex flex-wrap justify-center">
	{#each Object.entries(crops) as [crop, data]}
		<div class="basis-1/2">
			<CropGraph {data} {crop} />
		</div>
	{/each}
</div>
