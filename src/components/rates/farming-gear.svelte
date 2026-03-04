<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import Lorebtn from '$comp/items/lorebtn.svelte';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer.svelte';
	import { buttonVariants } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import * as Popover from '$ui/popover';
	import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import type { GearSlot } from 'farming-weight';

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

	function setPiece(slot: GearSlot, piece: (typeof slots)[GearSlot]) {
		if (!piece) return;
		set.setPiece(piece);
		slots = { ...slots, [slot]: piece.item.uuid };
		fortune = set.getFortuneBreakdown();
	}
</script>

<div class="flex flex-col gap-3 rounded-md border p-4">
	<div class="flex w-full items-center justify-between">
		<p class="text-lg font-semibold">Farming Gear</p>
		<FortuneBreakdown breakdown={fortune} />
	</div>
	<hr />
	<div class="flex flex-col gap-3">
		{#each Object.entries(slots) as [slot] (slot)}
			{@const piece = set.getPiece(slot as GearSlot)}
			{@const best = !set.slotOptions[slot as GearSlot].some((p) =>
				'potential' in p
					? p.potential > (!piece ? 0 : 'potential' in piece ? (piece.potential ?? 0) : 0)
					: p.fortune > (piece?.fortune ?? 0)
			)}
			{#if piece}
				<div class="flex w-full items-center justify-between">
					<div class="flex flex-row items-center">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost' })}>
								<ArrowLeftRight size={20} />
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="max-w-xl">
								<DropdownMenu.Label>Swap {slot}</DropdownMenu.Label>
								<DropdownMenu.Separator />
								<DropdownMenu.RadioGroup
									value={piece.item.uuid ?? ''}
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
									{#each pieces[slot as GearSlot] as piece, i (piece.item.uuid ?? i)}
										{#if piece.item.uuid}
											<DropdownMenu.RadioItem value={piece.item.uuid}>
												<div class="flex flex-row items-center gap-1">
													<FormattedText text={piece.item.name ?? ''} />
													<FortuneBreakdown total={piece.fortune} small={true} />
												</div>
											</DropdownMenu.RadioItem>
										{/if}
									{/each}
								</DropdownMenu.RadioGroup>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
						<div class="flex flex-row items-center gap-1">
							<ItemRender skyblockId={piece.item.skyblockId ?? ''} class="size-10" />
							<span class="text-lg font-semibold"><FormattedText text={piece.item.name ?? ''} /></span>
						</div>
					</div>
					<div class="flex flex-row items-center gap-2">
						{#if !best}
							<Popover.Mobile>
								{#snippet trigger()}
									<div class="px-1">
										<TriangleAlert size={20} class="text-completed -mb-1" />
									</div>
								{/snippet}
								<div class="max-w-xs">
									<p class="text-md">This isn't the highest fortune item!</p>
								</div>
							</Popover.Mobile>
						{/if}
						<Lorebtn item={piece.item} />
						{#key $player}
							<FortuneBreakdown total={piece.fortune} breakdown={piece.fortuneBreakdown} />
						{/key}
					</div>
				</div>
			{/if}
		{:else}
			<p class="my-4 text-center text-lg font-semibold">No gear found!</p>
		{/each}
	</div>
</div>
