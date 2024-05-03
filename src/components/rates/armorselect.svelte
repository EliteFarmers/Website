<script lang="ts">
	import Lorebtn from '$comp/items/lorebtn.svelte';
	import Fortunebreakdown from '$comp/items/tools/fortunebreakdown.svelte';
	import { Button } from '$ui/button';
	import { FormatMinecraftText } from '$lib/format';
	import { FarmingArmor, GearSlot } from 'farming-weight';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import Menu from 'lucide-svelte/icons/menu';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer';

	export let player: RatesPlayerStore;

	const slots = [GearSlot.Helmet, GearSlot.Chestplate, GearSlot.Leggings, GearSlot.Boots];

	$: armor = $player.armorSet.pieces;

	$: pieces = {
		[GearSlot.Helmet]: armor.filter((a) => a.slot === GearSlot.Helmet)?.sort((a, b) => b.potential - a.potential),
		[GearSlot.Chestplate]: armor
			.filter((a) => a.slot === GearSlot.Chestplate)
			?.sort((a, b) => b.potential - a.potential),
		[GearSlot.Leggings]: armor
			.filter((a) => a.slot === GearSlot.Leggings)
			?.sort((a, b) => b.potential - a.potential),
		[GearSlot.Boots]: armor.filter((a) => a.slot === GearSlot.Boots)?.sort((a, b) => b.potential - a.potential),
	} as Record<GearSlot, FarmingArmor[]>;

	$: set = $player.armorSet;

	$: selected = {
		[GearSlot.Helmet]: set.helmet?.item.uuid ?? pieces[GearSlot.Helmet][0]?.item?.uuid ?? '',
		[GearSlot.Chestplate]: set.chestplate?.item.uuid ?? pieces[GearSlot.Chestplate][0]?.item?.uuid ?? '',
		[GearSlot.Leggings]: set.leggings?.item.uuid ?? pieces[GearSlot.Leggings][0]?.item?.uuid ?? '',
		[GearSlot.Boots]: set.boots?.item.uuid ?? pieces[GearSlot.Boots][0]?.item?.uuid ?? '',
	} as Record<GearSlot, string>;
</script>

<div class="flex flex-col gap-2">
	<div class="flex justify-between items-center w-full px-4 py-2">
		<span class="text-lg font-semibold">Total Armor Fortune</span>
		<Fortunebreakdown breakdown={set.getFortuneBreakdown()} />
	</div>
	{#each slots as slot (slot)}
		{@const piece = set.getPiece(slot)}
		{#if piece}
			<div class="flex justify-between items-center w-full px-4 py-2">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<span class="text-lg font-semibold">{@html FormatMinecraftText(piece.item.name ?? '')}</span>
				<div class="flex flex-row gap-2 items-center">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button builders={[builder]} variant="ghost" size="sm" class="px-2">
								<Menu size={20} />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="max-w-xl">
							<DropdownMenu.Label>Swap {slot}</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.RadioGroup
								bind:value={selected[slot]}
								onValueChange={(value) => {
									const piece = armor.find((a) => a.item.uuid === value);
									if (piece) {
										set.setPiece(piece);
										player.refresh();
									}
								}}
							>
								{#each pieces[slot] as piece}
									{#if piece.item.uuid}
										<DropdownMenu.RadioItem value={piece.item.uuid}>
											<!-- eslint-disable-next-line svelte/no-at-html-tags -->
											{@html FormatMinecraftText(piece.item.name ?? '')}
										</DropdownMenu.RadioItem>
									{/if}
								{/each}
							</DropdownMenu.RadioGroup>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
					<Lorebtn item={piece.item} />
					<Fortunebreakdown total={piece.fortune} breakdown={piece.fortuneBreakdown} />
				</div>
			</div>
		{/if}
	{/each}
</div>
