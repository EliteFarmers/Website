<script lang="ts">
	import Lorebtn from '$comp/items/lorebtn.svelte';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import { FormatMinecraftText } from '$lib/format';
	import type { FarmingEquipment } from 'farming-weight';

	interface Props {
		items: FarmingEquipment[];
	}

	let { items }: Props = $props();

	let bySlot = $derived(items
		.sort((a, b) => b.fortune - a.fortune)
		.reduce<Record<string, FarmingEquipment>>((acc, item) => {
			if (!acc[item.slot]) {
				acc[item.slot] = item;
			}

			return acc;
		}, {}));
</script>

{#each Object.values(bySlot) as item (item.item.uuid)}
	<div class="flex justify-between items-center w-full px-4 py-2">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<span class="text-lg font-semibold">{@html FormatMinecraftText(item.item.name ?? '')}</span>
		<div class="flex flex-row gap-1 items-center">
			<Lorebtn item={item.item} />
			<FortuneBreakdown total={item.fortune} breakdown={item.fortuneBreakdown} />
		</div>
	</div>
{/each}
