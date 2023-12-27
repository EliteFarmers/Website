<script lang="ts">
	import Fortunebreakdown from '$comp/items/tools/fortunebreakdown.svelte';
	import { FormatMinecraftText } from '$lib/format';
	import { ArmorSet, FarmingArmor, GearSlot, type PlayerOptions } from 'farming-weight';

	export let options: PlayerOptions;

	$: armor = options.armor.filter((i) => FarmingArmor.isValid(i)).map((i) => new FarmingArmor(i, options));

	$: helmet = armor.filter((a) => a.slot === GearSlot.Helmet)?.sort((a, b) => b.fortune - a.fortune);
	$: chestplate = armor.filter((a) => a.slot === GearSlot.Chestplate)?.sort((a, b) => b.fortune - a.fortune);
	$: leggings = armor.filter((a) => a.slot === GearSlot.Leggings)?.sort((a, b) => b.fortune - a.fortune);
	$: boots = armor.filter((a) => a.slot === GearSlot.Boots)?.sort((a, b) => b.fortune - a.fortune);

	$: selected = [helmet[0], chestplate[0], leggings[0], boots[0]] as (FarmingArmor | undefined)[];

	$: set = new ArmorSet(selected.filter((a) => a) as FarmingArmor[]);
</script>

<div class="flex flex-col gap-2">
	<div class="flex justify-between items-center w-full px-4 py-2">
		<span class="text-lg font-semibold">Total Armor Fortune</span>
		<Fortunebreakdown breakdown={set.getFortuneBreakdown()} />
	</div>
	{#each selected.filter((a) => a) as piece (piece)}
		{#if piece}
			<div class="flex justify-between items-center w-full px-4 py-2">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<span class="text-lg font-semibold">{@html FormatMinecraftText(piece.item.name ?? '')}</span>
				<Fortunebreakdown total={piece.fortune} breakdown={piece.fortuneBreakdown} />
			</div>
		{/if}
	{/each}
	<!-- {#each armor as piece (piece.item.uuid ?? piece)}
		<div class="flex justify-between items-center w-full px-4 py-2">
			<!-- eslint-disable-next-line svelte/no-at-html-tags --
			<span class="text-lg font-semibold">{@html FormatMinecraftText(piece.item.name ?? '')}</span>
			<Fortunebreakdown total={piece.fortune} breakdown={piece.fortuneBreakdown} />
		</div>
	{/each} -->
</div>
