<script lang="ts">
	import Lorebtn from '$comp/items/lorebtn.svelte';
	import Fortunebreakdown from '$comp/items/tools/fortunebreakdown.svelte';
	import { FormatMinecraftText } from '$lib/format';
	import type { LotusGear } from 'farming-weight';

	export let items: LotusGear[];

	$: bySlot = items
		.sort((a, b) => b.fortune - a.fortune)
		.reduce<Record<string, LotusGear>>((acc, item) => {
			if (!acc[item.slot]) {
				acc[item.slot] = item;
			}

			return acc;
		}, {});
</script>

{#each Object.values(bySlot) as item (item.item.uuid)}
	<div class="flex justify-between items-center w-full px-4 py-2">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<span class="text-lg font-semibold">{@html FormatMinecraftText(item.item.name ?? '')}</span>
		<div class="flex flex-row gap-1 items-center">
			<Lorebtn item={item.item} />
			<Fortunebreakdown total={item.fortune} breakdown={item.fortuneBreakdown} />
		</div>
	</div>
{/each}
