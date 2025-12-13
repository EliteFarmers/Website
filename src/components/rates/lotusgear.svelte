<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import Lorebtn from '$comp/items/lorebtn.svelte';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import type { FarmingEquipment } from 'farming-weight';

	interface Props {
		items: FarmingEquipment[];
	}

	let { items }: Props = $props();

	let bySlot = $derived(
		items
			.sort((a, b) => b.fortune - a.fortune)
			.reduce<Record<string, FarmingEquipment>>((acc, item) => {
				if (!item.slot) return acc;
				if (!acc[item.slot]) {
					acc[item.slot] = item;
				}

				return acc;
			}, {})
	);
</script>

{#each Object.values(bySlot) as item, i (item.item.uuid ?? i)}
	<div class="flex w-full items-center justify-between px-4 py-2">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<span class="text-lg font-semibold">
			<FormattedText text={item.item.name ?? ''} />
		</span>
		<div class="flex flex-row items-center gap-1">
			<Lorebtn item={item.item} />
			<FortuneBreakdown total={item.fortune} breakdown={item.fortuneBreakdown} />
		</div>
	</div>
{/each}
