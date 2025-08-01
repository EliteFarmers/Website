<script lang="ts">
	import ComboBox from '$comp/ui/combobox/combo-box.svelte';
	import type { components } from '$lib/api/api';
	import { Button } from '$ui/button';
	import RefreshCcw from '@lucide/svelte/icons/refresh-ccw';
	import { onMount } from 'svelte';

	interface Props {
		words?: components['schemas']['EventTeamsWordListDto'];
		loading?: boolean;
		selected?: string[];
		displayName?: string;
	}

	let {
		words = { first: [], second: [], third: [] } as components['schemas']['EventTeamsWordListDto'],
		loading = $bindable(false),
		selected = $bindable([]),
		displayName = $bindable(''),
	}: Props = $props();

	let picked1 = $state('');
	let picked2 = $state('');
	let picked3 = $state('');

	function generateTeamName() {
		const firstWords = words?.first ?? [];
		const secondWords = words?.second ?? [];
		const thirdWords = words?.third ?? [];

		const first = firstWords[Math.floor(Math.random() * firstWords.length)].replaceAll(' ', '_');
		const second = secondWords[Math.floor(Math.random() * secondWords.length)].replaceAll(' ', '_');
		const third = thirdWords[Math.floor(Math.random() * thirdWords.length)].replaceAll(' ', '_');

		if (Math.random() > 0.5) {
			picked1 = first;
			picked3 = '';

			if (Math.random() > 0.5) {
				picked2 = second;
			} else {
				picked2 = third;
			}
		} else {
			picked1 = first;
			picked2 = second;
			picked3 = third;
		}

		updateName();

		if (name.length > 32) {
			generateTeamName();
		}
	}

	function updateName() {
		name = (picked1 ?? '') + ' ' + (picked2 ?? '') + ' ' + (picked3 ?? '').trim();
		displayName = name.replaceAll('_', ' ');
	}

	let name = $state('');

	let wordOptions = $derived(
		Array.from(new Set([...(words?.first ?? []), ...(words?.second ?? []), ...(words?.third ?? [])]), (w) => ({
			value: w.replaceAll(' ', '_'),
			label: w,
		}))
	);

	onMount(() => {
		if (selected.length > 0) {
			picked1 = selected[0] ?? '';
			picked2 = selected[1] ?? '';
			picked3 = selected[2] ?? '';
		} else {
			generateTeamName();
		}
	});
</script>

<input type="hidden" name="name" value={name} hidden />
<div class="flex flex-col gap-2">
	<p class="text-xl font-semibold">{name.replaceAll('_', ' ')}</p>
	<div class="flex max-w-sm flex-row flex-wrap gap-1 lg:flex-nowrap">
		<Button variant="secondary" onclick={generateTeamName} disabled={loading} class="order-5 lg:order-1">
			<RefreshCcw />
		</Button>
		<ComboBox
			options={wordOptions}
			bind:value={picked1}
			exclude={[picked2, picked3]}
			onChange={updateName}
			placeholder="Select Word"
			btnClass="order-2"
		/>
		<ComboBox
			options={wordOptions}
			bind:value={picked2}
			exclude={[picked1, picked3]}
			onChange={updateName}
			placeholder="Select Word"
			btnClass="order-3"
		/>
		<ComboBox
			options={wordOptions}
			bind:value={picked3}
			exclude={[picked1, picked2]}
			onChange={updateName}
			placeholder="Select Word"
			clear={true}
			btnClass="order-4"
		/>
	</div>
</div>
