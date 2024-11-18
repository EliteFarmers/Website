<script lang="ts">
	import Lorebtn from '$comp/items/lorebtn.svelte';
	import Fortunebreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import { buttonVariants } from '$ui/button';
	import { FormatMinecraftText } from '$lib/format';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import * as Popover from '$ui/popover';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer.svelte';
	import Menu from 'lucide-svelte/icons/menu';
	import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
	import { GearSlot } from 'farming-weight';

	interface Props {
		player: RatesPlayerStore;
	}

	let { player }: Props = $props();

	let set = $derived($player.armorSet);
	let armor = $derived(set.pieces);
	let equipment = $derived(set.equipmentPieces);
	let pieces = $derived(set.slotOptions);

	let slots = $state($player.armorSet.slots);
	let fortune = $state((() => set.getFortuneBreakdown())());

	function setPiece(slot: GearSlot, piece: typeof slots[GearSlot]) {
		if (!piece) return;
		set.setPiece(piece);
		slots = { ...slots, [slot]: piece.item.uuid };
		fortune = set.getFortuneBreakdown();
	}

	let selected = $derived({
		[GearSlot.Helmet]: set.helmet?.item.uuid ?? '',
		[GearSlot.Chestplate]: set.chestplate?.item.uuid ?? '',
		[GearSlot.Leggings]: set.leggings?.item.uuid ?? '',
		[GearSlot.Boots]: set.boots?.item.uuid ?? '',
		[GearSlot.Necklace]: set.necklace?.item.uuid ?? '',
		[GearSlot.Cloak]: set.cloak?.item.uuid ?? '',
		[GearSlot.Belt]: set.belt?.item.uuid ?? '',
		[GearSlot.Gloves]: set.gloves?.item.uuid ?? '',
	} as Record<GearSlot, string>);
</script>

<div class="flex flex-col gap-3">
	<div class="flex justify-between items-center w-full pb-2">
		<p class="text-lg font-semibold">Farming Gear</p>
		<Fortunebreakdown breakdown={fortune} />
	</div>
	<div class="flex flex-col gap-3 mx-2">
		{#each Object.entries(slots) as [slot] (slot)}
			{@const piece = set.getPiece(slot as GearSlot)}
			{@const best = !set.slotOptions[slot as GearSlot].some((p) =>
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
								{#snippet trigger()}
									<div class="px-1">
										<TriangleAlert size={20} class="-mb-1 text-yellow-600 dark:text-yellow-300" />
									</div>
								{/snippet}
								<div class="max-w-xs">
									<p class="text-md">This isn't the highest fortune item!</p>
								</div>
							</Popover.Mobile>
						{/if}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost' })}>
								<Menu size={20} />
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="max-w-xl">
								<DropdownMenu.Label>Swap {slot}</DropdownMenu.Label>
								<DropdownMenu.Separator />
								<DropdownMenu.RadioGroup
									bind:value={selected[slot as GearSlot]}
									onValueChange={(value) => {
										const piece =
											armor.find((a) => a.item.uuid === value) ??
											equipment.find((e) => e.item.uuid === value);
										if (piece) {
											setPiece(slot as GearSlot, piece);
											player.refresh();
										}
									}}
								>
									{#each pieces[slot as GearSlot] as piece}
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
	</div>
</div>
