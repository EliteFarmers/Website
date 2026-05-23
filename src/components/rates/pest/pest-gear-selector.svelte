<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import Lorebtn from '$comp/items/lorebtn.svelte';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import { buttonVariants } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import * as Popover from '$ui/popover';
	import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Shield from '@lucide/svelte/icons/shield';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import type {
		ArmorLoadout,
		ArmorSet,
		EquipmentLoadout,
		FarmingArmor,
		FarmingEquipment,
		GearSlot,
		Stat,
		StatBreakdown,
	} from 'farming-weight';

	type PestGearLoadout = ArmorSet | ArmorLoadout | EquipmentLoadout;

	interface Props {
		title?: string;
		subtitle?: string;
		armorSet: PestGearLoadout;
		selectPiece: (slot: GearSlot, uuid: string) => void;
		clearPiece?: (slot: GearSlot) => void;
		getPieceBreakdown: (piece: FarmingArmor | FarmingEquipment) => StatBreakdown;
		getPieceScore: (piece: FarmingArmor | FarmingEquipment) => number;
		overallBreakdown?: Record<string, { value: number; stat: Stat }>;
		slots?: readonly GearSlot[];
		blockedUuids?: Record<string, string>;
		children?: import('svelte').Snippet;
	}

	let {
		title = 'Pest Gear',
		subtitle,
		armorSet,
		selectPiece,
		clearPiece,
		getPieceBreakdown,
		getPieceScore,
		overallBreakdown,
		slots,
		blockedUuids = {},
		children,
	}: Props = $props();

	const slotEntries = $derived(
		(Object.entries(armorSet.slots) as [GearSlot, FarmingArmor | FarmingEquipment | undefined][]).filter(
			([slot]) => !slots || slots.includes(slot)
		)
	);
</script>

<section class="bg-card flex flex-col gap-4 rounded-lg border p-4 md:p-6">
	<header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-3">
			<div class="bg-muted text-foreground flex size-10 items-center justify-center rounded-md">
				<Shield class="size-5" />
			</div>
			<div>
				<h2 class="text-xl leading-tight font-semibold">{title}</h2>
				{#if subtitle}
					<p class="text-muted-foreground text-sm">{subtitle}</p>
				{/if}
			</div>
		</div>
		{#if overallBreakdown}
			<FortuneBreakdown title="Pest Gear Stats" breakdown={overallBreakdown} />
		{/if}
	</header>

	<div class="flex flex-col gap-2">
		{#each slotEntries as [slot, piece] (slot)}
			{@const options = armorSet.slotOptions[slot] ?? []}
			{@const eligible = options.filter(
				(o) => !o.item.uuid || !blockedUuids[o.item.uuid] || o.item.uuid === piece?.item.uuid
			)}
			{@const bestScore = eligible.reduce((max, p) => Math.max(max, getPieceScore(p)), 0)}
			{@const currentScore = piece ? getPieceScore(piece) : 0}
			{@const isBest = !piece || currentScore >= bestScore}

			<div
				class="hover:bg-muted/30 flex w-full items-center justify-between gap-2 rounded-md py-2 transition-colors"
			>
				<div class="flex min-w-0 flex-row items-center gap-1">
					{#if options.length > 0}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger
								class={buttonVariants({ variant: 'ghost', size: 'icon' })}
								aria-label="Swap {slot}"
							>
								<ArrowLeftRight size={18} />
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="max-w-xl">
								<DropdownMenu.Label>Swap {slot}</DropdownMenu.Label>
								<DropdownMenu.Separator />
								<DropdownMenu.RadioGroup
									value={piece?.item.uuid ?? ''}
									onValueChange={(value) => value && selectPiece(slot, value)}
								>
									{#each options as option, i (option.item.uuid ?? i)}
										{#if option.item.uuid}
											{@const blockedBy =
												option.item.uuid !== piece?.item.uuid
													? blockedUuids[option.item.uuid]
													: undefined}
											<DropdownMenu.RadioItem
												value={option.item.uuid}
												disabled={!!blockedBy}
												class={blockedBy ? 'opacity-50' : ''}
											>
												<div class="flex flex-row items-center gap-2">
													<ItemRender
														skyblockId={option.item.skyblockId ?? ''}
														class="size-6"
													/>
													<FormattedText text={option.item.name ?? ''} />
													{#if blockedBy}
														<span class="text-muted-foreground text-xs whitespace-nowrap"
															>(on {blockedBy})</span
														>
													{/if}
												</div>
											</DropdownMenu.RadioItem>
										{/if}
									{/each}
								</DropdownMenu.RadioGroup>
								{#if clearPiece && piece}
									<DropdownMenu.Separator />
									<DropdownMenu.Item onSelect={() => clearPiece?.(slot)}>
										<CircleX class="size-4" />
										Unequip
									</DropdownMenu.Item>
								{/if}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					{:else}
						<div class="w-9"></div>
					{/if}
					{#if piece}
						<ItemRender skyblockId={piece.item.skyblockId ?? ''} class="size-10" />
						<div class="min-w-0 truncate text-base font-semibold">
							<FormattedText text={piece.item.name ?? ''} />
						</div>
					{:else}
						<div class="bg-muted/40 flex size-10 items-center justify-center rounded-md">
							<Shield class="text-muted-foreground size-5" />
						</div>
						<div class="min-w-0">
							<p class="text-muted-foreground text-sm capitalize">No {slot.toLowerCase()}</p>
						</div>
					{/if}
				</div>
				{#if piece}
					<div class="flex items-center gap-2">
						{#if !isBest}
							<Popover.Mobile>
								{#snippet trigger()}
									<span
										class="inline-flex size-6 items-center justify-center text-amber-500"
										aria-label="Better option available"
									>
										<TriangleAlert class="size-4" />
									</span>
								{/snippet}
								<p class="max-w-xs text-sm">
									A higher-scoring pest gear option exists for this slot. Use the swap button to equip
									it.
								</p>
							</Popover.Mobile>
						{/if}
						<Lorebtn item={piece.item} />
						<FortuneBreakdown title="{slot} Pest Stats" breakdown={getPieceBreakdown(piece)} small />
					</div>
				{/if}
			</div>
		{/each}
	</div>

	{@render children?.()}
</section>
