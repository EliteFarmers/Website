<script lang="ts">
	import Lorebtn from '$comp/items/lorebtn.svelte';
	import Fortunebreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import { Button } from '$ui/button';
	import { FormatMinecraftText } from '$lib/format';
	import { GearSlot } from 'farming-weight';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import * as Popover from '$ui/popover';
	import Menu from 'lucide-svelte/icons/menu';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer';
	import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';

	export let player: RatesPlayerStore;

	const slots = [
		GearSlot.Helmet,
		GearSlot.Chestplate,
		GearSlot.Leggings,
		GearSlot.Boots,
		GearSlot.Necklace,
		GearSlot.Cloak,
		GearSlot.Belt,
		GearSlot.Gloves,
	] as const;
	$: set = $player.armorSet;

	$: armor = set.pieces;
	$: equipment = $player.equipment;

	$: pieces = set.slotOptions;

	$: selected = {
		[GearSlot.Helmet]: set.helmet?.item.uuid ?? '',
		[GearSlot.Chestplate]: set.chestplate?.item.uuid ?? '',
		[GearSlot.Leggings]: set.leggings?.item.uuid ?? '',
		[GearSlot.Boots]: set.boots?.item.uuid ?? '',
		[GearSlot.Necklace]: set.necklace?.item.uuid ?? '',
		[GearSlot.Cloak]: set.cloak?.item.uuid ?? '',
		[GearSlot.Belt]: set.belt?.item.uuid ?? '',
		[GearSlot.Gloves]: set.gloves?.item.uuid ?? '',
	} as Record<GearSlot, string>;
</script>

<div class="flex flex-col gap-3">
	<div class="flex justify-between items-center w-full pb-2">
		<p class="text-lg font-semibold">Farming Gear</p>
		<Fortunebreakdown breakdown={set.getFortuneBreakdown()} />
	</div>
	<div class="flex flex-col gap-3 mx-2">
		{#key set.fortune}
			{#each slots as slot (slot)}
				{@const piece = set.getPiece(slot)}
				{@const best = !set.slotOptions[slot].some((p) =>
					'potential' in p
						? p.potential > (!piece ? 0 : 'potential' in piece ? piece.potential ?? 0 : 0)
						: p.fortune > (piece?.fortune ?? 0)
				)}
				{#if piece}
					<div class="flex justify-between items-center w-full">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						<span class="text-lg font-semibold">{@html FormatMinecraftText(piece.item.name ?? '')}</span>
						<div class="flex flex-row gap-2 items-center">
							{#if !best}
								<Popover.Mobile>
									<div slot="trigger" class="px-1">
										<TriangleAlert size={20} class="-mb-1 text-yellow-600 dark:text-yellow-300" />
									</div>
									<div class="max-w-xs">
										<p class="text-md">This isn't the highest fortune item!</p>
									</div>
								</Popover.Mobile>
							{/if}
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
											const piece =
												armor.find((a) => a.item.uuid === value) ??
												equipment.find((e) => e.item.uuid === value);
											if (piece) {
												set.setPiece(piece);
												player.refresh();
											}
										}}
									>
										{#each pieces[slot] as piece}
											{#if piece.item.uuid}
												<DropdownMenu.RadioItem value={piece.item.uuid}>
													<div class="flex flex-row items-center gap-1">
														<!-- eslint-disable-next-line svelte/no-at-html-tags -->
														{@html FormatMinecraftText(piece.item.name ?? '')}
														<FortuneBreakdown total={piece.fortune} small={true} />
													</div>
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
		{/key}
	</div>
</div>
