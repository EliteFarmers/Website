<script lang="ts">
	import ItemName from '$comp/items/item-name.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import { getUpgradeCost } from '$lib/items';
	import { getProgressCompletion } from '$lib/rates/progress-completion';
	import * as Accordion from '$ui/accordion';
	import { Button } from '$ui/button';
	import { Progress } from '$ui/progress';
	import { SelectSimple } from '$ui/select';
	import CircleHelp from '@lucide/svelte/icons/circle-help';
	import HandFist from '@lucide/svelte/icons/hand-fist';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import PawPrint from '@lucide/svelte/icons/paw-print';
	import Shield from '@lucide/svelte/icons/shield';
	import SprayCan from '@lucide/svelte/icons/spray-can';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import WandSparkles from '@lucide/svelte/icons/wand-sparkles';
	import {
		PEST_ARMOR_SLOTS,
		PEST_EQUIPMENT_SLOTS,
		getFarmingPetId,
		PestFarmingPhase,
		type GearSlot,
	} from 'farming-weight';
	import type { PestFarmingPageContext } from '../../../routes/(main)/@[id=id]/[[profile]]/pest-farming/pest-farming-context.svelte';
	import CategoryProgress from '../category-progress.svelte';
	import PestGearSelector from './pest-gear-selector.svelte';
	import VacuumSelector from './vacuum-selector.svelte';

	interface Props {
		pest: PestFarmingPageContext;
	}

	let { pest }: Props = $props();

	const armorName = $derived(
		pest.pestPlayer.getArmorSetLoadout(pest.activePhaseLoadout.armorSetId)?.name ?? 'No armor set'
	);
	const equipmentName = $derived(
		pest.pestPlayer.getEquipmentSetLoadout(pest.activePhaseLoadout.equipmentSetId)?.name ?? 'No equipment set'
	);
	const armorPieces = $derived(PEST_ARMOR_SLOTS.map((slot) => ({ slot, piece: pest.activeArmorSet?.slots[slot] })));
	const equipmentPieces = $derived(
		PEST_EQUIPMENT_SLOTS.map((slot) => ({ slot, piece: pest.activeEquipmentSet?.slots[slot] }))
	);
	const petProgress = $derived(
		pest.activePhasePet?.getProgress(pest.getPhaseStats(pest.activePhase), pest.activePhasePlayer) ?? []
	);
	const petOptions = $derived([
		{ value: '', label: 'No pet', pet: undefined },
		...pest.activePhasePlayer.pets
			.map((pet) => ({
				value: getFarmingPetId(pet) ?? '',
				label: pet.getFormattedName(),
				pet,
			}))
			.filter((option) => option.value),
	]);
	const armorCompletion = $derived(getProgressCompletion(pest.activeArmorSetProgress, !!pest.activeArmorSet));
	const equipmentCompletion = $derived(
		getProgressCompletion(pest.activeEquipmentSetProgress, !!pest.activeEquipmentSet)
	);
	const petCompletion = $derived(getProgressCompletion(petProgress, !!pest.activePhasePet));
	const vacuumCompletion = $derived(getProgressCompletion(pest.vacuumProgress, !!pest.selectedVacuum));

	function requestEdit(kind: 'armor' | 'equipment', slot: GearSlot, uuid?: string) {
		const setId = kind === 'armor' ? pest.prepareActiveArmorSetForEdit() : pest.prepareActiveEquipmentSetForEdit();
		if (!setId) return;
		if (kind === 'armor') {
			if (uuid) pest.selectArmorSetPiece(setId, slot, uuid);
			else pest.clearArmorSetPiece(setId, slot);
		} else if (uuid) pest.selectEquipmentSetPiece(setId, slot, uuid);
		else pest.clearEquipmentSetPiece(setId, slot);
	}
</script>

<section class="overflow-hidden rounded-lg border bg-card" aria-labelledby="optimized-layout-title">
	<header class="flex flex-row items-center justify-between gap-3 border-b p-4 md:px-5">
		<div class="min-w-0 flex-1">
			<h2 id="optimized-layout-title" class="text-xl leading-tight font-semibold">Optimized Layout</h2>
			<p class="mt-0.5 text-sm text-muted-foreground">{pest.activePhaseConfig.label} phase</p>
		</div>
		<div class="flex flex-wrap gap-2">
			{#if pest.optimizationRunning}
				<Button variant="outline" onclick={() => pest.cancelLoadoutOptimization()}>
					<LoaderCircle class="size-4 animate-spin" />
					Cancel · {pest.optimizationEvaluated.toLocaleString()}
				</Button>
			{:else if pest.itemPriceLoadFailed}
				<Button variant="outline" onclick={() => pest.retryItemPrices()}>
					<TriangleAlert class="size-4 text-destructive" />
					Retry prices
				</Button>
			{:else}
				<Button
					onclick={() => void pest.optimizeLoadouts()}
					disabled={!pest.loadoutState || !pest.itemPricesReady}
				>
					{#if pest.itemPricesReady}
						<WandSparkles class="size-4" />
						Optimize
					{:else}
						<LoaderCircle class="size-4 animate-spin" />
						Loading prices
					{/if}
				</Button>
			{/if}
		</div>
	</header>

	<Accordion.Root type="multiple">
		<Accordion.Item value="armor">
			<Accordion.Trigger class="px-4 py-3 hover:no-underline md:px-5">
				<div class="flex min-w-0 flex-1 flex-col gap-3 pr-3 sm:flex-row sm:items-center">
					<div class="flex min-w-0 items-center gap-3 sm:w-48">
						<div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
							<Shield class="size-4" />
						</div>
						<div class="min-w-0">
							<p class="font-semibold">Armor</p>
							<p class="truncate text-xs font-normal text-muted-foreground">{armorName}</p>
						</div>
					</div>
					<div class="flex min-w-36 flex-1 items-center gap-1.5">
						{#each armorPieces as { slot, piece } (slot)}
							{#if piece}
								{@const conflict = pest.getArmorPieceConflict(
									pest.activePhaseLoadout.armorSetId,
									piece.item.uuid
								)}
								<div
									class="relative flex size-9 shrink-0 items-center justify-center rounded-md border bg-background p-0.5"
									class:border-destructive={!!conflict}
									title={piece.item.name ?? slot}
								>
									<ItemRender
										skyblockId={piece.item.skyblockId ?? ''}
										inline={false}
										class="size-full [&>img]:p-0.5"
									/>
									{#if conflict}
										<span
											class="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground ring-2 ring-card"
											aria-label="Requires a second copy"
										>
											<TriangleAlert class="size-2.5" />
										</span>
									{/if}
								</div>
							{:else}
								<div
									class="flex size-9 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted/30"
									title="Empty {slot.toLowerCase()} slot"
								>
									<Shield class="size-3.5 text-muted-foreground/60" />
								</div>
							{/if}
						{/each}
					</div>
					<div class="flex w-full shrink-0 flex-col gap-1 sm:w-40">
						<span
							class={armorCompletion.maxed
								? 'text-xs font-medium text-completed'
								: 'text-xs font-normal text-muted-foreground'}>{armorCompletion.label}</span
						>
						<Progress
							value={armorCompletion.percentage}
							class={armorCompletion.maxed ? '**:data-[slot=progress-indicator]:bg-completed' : ''}
						/>
					</div>
				</div>
			</Accordion.Trigger>
			<Accordion.Content class="border-t bg-muted/15 px-4 pt-4 md:px-5">
				{#if pest.activeArmorSet}
					<PestGearSelector
						embedded
						armorSet={pest.activeArmorSet}
						slots={PEST_ARMOR_SLOTS}
						selectPiece={(slot, uuid) => requestEdit('armor', slot, uuid)}
						clearPiece={(slot) => requestEdit('armor', slot)}
						getPieceBreakdown={(piece) => pest.getPhasePieceBreakdown(piece)}
						getPieceRateImpact={(piece) => pest.getPhasePieceRateImpact(piece)}
						getPieceConflict={(piece) =>
							pest.getArmorPieceConflict(pest.activePhaseLoadout.armorSetId, piece.item.uuid)}
					>
						<CategoryProgress
							name="Armor Progress"
							progress={pest.activeArmorSetProgress}
							items={pest.itemsData}
							costFn={getUpgradeCost}
							referenceOnlyPrices={pest.ctx.isNonClassicProfile}
							applyUpgrade={(upgrade) => pest.applyActivePhaseUpgrade(upgrade)}
							expandUpgrade={(upgrade) => pest.expandActivePhaseUpgrade(upgrade)}
							getUpgrades={(progress) => pest.getProgressUpgrades(progress)}
						/>
					</PestGearSelector>
				{:else}
					<div class="flex items-center justify-between gap-3 py-3">
						<p class="text-sm text-muted-foreground">No armor is selected for this phase.</p>
						<Button variant="outline" onclick={() => pest.prepareActiveArmorSetForEdit()}
							>Choose pieces</Button
						>
					</div>
				{/if}
			</Accordion.Content>
		</Accordion.Item>

		<Accordion.Item value="equipment">
			<Accordion.Trigger class="px-4 py-3 hover:no-underline md:px-5">
				<div class="flex min-w-0 flex-1 flex-col gap-3 pr-3 sm:flex-row sm:items-center">
					<div class="flex min-w-0 items-center gap-3 sm:w-48">
						<div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
							<HandFist class="size-4" />
						</div>
						<div class="min-w-0">
							<p class="font-semibold">Equipment</p>
							<p class="truncate text-xs font-normal text-muted-foreground">{equipmentName}</p>
						</div>
					</div>
					<div class="flex min-w-36 flex-1 items-center gap-1.5">
						{#each equipmentPieces as { slot, piece } (slot)}
							{#if piece}
								{@const conflict = pest.getEquipmentPieceConflict(
									pest.activePhaseLoadout.equipmentSetId,
									piece.item.uuid
								)}
								<div
									class="relative flex size-9 shrink-0 items-center justify-center rounded-md border bg-background p-0.5"
									class:border-destructive={!!conflict}
									title={piece.item.name ?? slot}
								>
									<ItemRender
										skyblockId={piece.item.skyblockId ?? ''}
										inline={false}
										class="size-full [&>img]:p-0.5"
									/>
									{#if conflict}
										<span
											class="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground ring-2 ring-card"
											aria-label="Requires a second copy"
										>
											<TriangleAlert class="size-2.5" />
										</span>
									{/if}
								</div>
							{:else}
								<div
									class="flex size-9 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted/30"
									title="Empty {slot.toLowerCase()} slot"
								>
									<HandFist class="size-3.5 text-muted-foreground/60" />
								</div>
							{/if}
						{/each}
					</div>
					<div class="flex w-full shrink-0 flex-col gap-1 sm:w-40">
						<span
							class={equipmentCompletion.maxed
								? 'text-xs font-medium text-completed'
								: 'text-xs font-normal text-muted-foreground'}>{equipmentCompletion.label}</span
						>
						<Progress
							value={equipmentCompletion.percentage}
							class={equipmentCompletion.maxed ? '**:data-[slot=progress-indicator]:bg-completed' : ''}
						/>
					</div>
				</div>
			</Accordion.Trigger>
			<Accordion.Content class="border-t bg-muted/15 px-4 pt-4 md:px-5">
				{#if pest.activeEquipmentSet}
					<PestGearSelector
						embedded
						armorSet={pest.activeEquipmentSet}
						slots={PEST_EQUIPMENT_SLOTS}
						selectPiece={(slot, uuid) => requestEdit('equipment', slot, uuid)}
						clearPiece={(slot) => requestEdit('equipment', slot)}
						getPieceBreakdown={(piece) => pest.getActiveEquipmentPieceBreakdown(piece)}
						getPieceRateImpact={(piece) => pest.getActiveEquipmentPieceRateImpact(piece)}
						getPieceConflict={(piece) =>
							pest.getEquipmentPieceConflict(pest.activePhaseLoadout.equipmentSetId, piece.item.uuid)}
					>
						<CategoryProgress
							name="Equipment Progress"
							progress={pest.activeEquipmentSetProgress}
							items={pest.itemsData}
							costFn={getUpgradeCost}
							referenceOnlyPrices={pest.ctx.isNonClassicProfile}
							applyUpgrade={(upgrade) => pest.applyActivePhaseUpgrade(upgrade)}
							expandUpgrade={(upgrade) => pest.expandActivePhaseUpgrade(upgrade)}
							getUpgrades={(progress) => pest.getProgressUpgrades(progress)}
						/>
					</PestGearSelector>
				{:else}
					<div class="flex items-center justify-between gap-3 py-3">
						<p class="text-sm text-muted-foreground">No equipment is selected for this phase.</p>
						<Button variant="outline" onclick={() => pest.prepareActiveEquipmentSetForEdit()}
							>Choose pieces</Button
						>
					</div>
				{/if}
			</Accordion.Content>
		</Accordion.Item>

		<Accordion.Item value="pet">
			<Accordion.Trigger class="px-4 py-3 hover:no-underline md:px-5">
				<div class="flex min-w-0 flex-1 flex-col gap-3 pr-3 sm:flex-row sm:items-center">
					<div class="flex min-w-0 items-center gap-3 sm:w-48">
						<div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
							<PawPrint class="size-4" />
						</div>
						<div class="min-w-0">
							<p class="font-semibold">Pet</p>
							<p class="truncate text-xs font-normal text-muted-foreground">
								{#if pest.activePhasePet}<ItemName
										name={pest.activePhasePet.getFormattedName()}
									/>{:else}No pet{/if}
							</p>
						</div>
					</div>
					<div class="flex min-w-36 flex-1 items-center">
						{#if pest.activePhasePet}
							<div
								class="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background p-0.5"
							>
								<ItemRender
									skyblockId={pest.activePhasePet.pet.type ?? ''}
									pet
									inline={false}
									class="size-full [&>img]:p-0.5"
								/>
							</div>
						{:else}
							<div
								class="flex size-9 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted/30"
							>
								<CircleHelp class="size-3.5 text-muted-foreground/60" />
							</div>
						{/if}
					</div>
					<div class="flex w-full shrink-0 flex-col gap-1 sm:w-40">
						<span
							class={petCompletion.maxed
								? 'text-xs font-medium text-completed'
								: 'text-xs font-normal text-muted-foreground'}>{petCompletion.label}</span
						>
						<Progress
							value={petCompletion.percentage}
							class={petCompletion.maxed ? '**:data-[slot=progress-indicator]:bg-completed' : ''}
						/>
					</div>
				</div>
			</Accordion.Trigger>
			<Accordion.Content class="border-t bg-muted/15 px-4 pt-4 md:px-5">
				<div class="mb-4 max-w-md">
					<label for="pest-phase-pet" class="mb-1.5 block text-sm font-medium"
						>{pest.activePhaseConfig.label} pet</label
					>
					<SelectSimple
						id="pest-phase-pet"
						options={petOptions}
						value={pest.activePhaseLoadout.petId ?? ''}
						change={(value) => pest.selectPhasePet(pest.activePhase, value || undefined)}
						option={petOption}
						trigger={petOption}
						class="w-full"
					/>
				</div>
				{#if pest.activePhasePet}
					<div class="flex flex-col gap-4">
						<div class="flex items-center gap-3">
							<div class="rounded-md border bg-background p-1.5">
								<ItemRender
									skyblockId={pest.activePhasePet.pet.type ?? ''}
									pet
									inline={false}
									class="size-10"
								/>
							</div>
							<div class="min-w-0">
								<p class="text-base font-semibold">
									<ItemName name={pest.activePhasePet.getFormattedName()} />
								</p>
								<p class="text-sm text-muted-foreground">
									Level {pest.activePhasePet.level}
									{pest.activePhasePet.rarity}
								</p>
							</div>
							<div class="ml-auto">
								<FortuneBreakdown
									title="{pest.activePhaseConfig.label} Pet Stats"
									breakdown={pest.getPetBreakdown(pest.activePhasePet, pest.activePhase)}
								/>
							</div>
						</div>
						<CategoryProgress
							name="Pet Progress"
							progress={petProgress}
							items={pest.itemsData}
							costFn={getUpgradeCost}
							referenceOnlyPrices={pest.ctx.isNonClassicProfile}
							applyUpgrade={(upgrade) => pest.applyActivePhaseUpgrade(upgrade)}
							expandUpgrade={(upgrade) => pest.expandActivePhaseUpgrade(upgrade)}
							getUpgrades={(progress) => pest.getProgressUpgrades(progress)}
						/>
					</div>
				{/if}
			</Accordion.Content>
		</Accordion.Item>

		{#if pest.activePhase === PestFarmingPhase.Kill}
			<Accordion.Item value="vacuum" class="mt-2 border-t">
				<Accordion.Trigger class="px-4 py-3 hover:no-underline md:px-5">
					<div class="flex min-w-0 flex-1 flex-col gap-3 pr-3 sm:flex-row sm:items-center">
						<div class="flex min-w-0 items-center gap-3 sm:w-48">
							<div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
								<SprayCan class="size-4" />
							</div>
							<div class="min-w-0">
								<p class="font-semibold">Vacuum</p>
								<p class="truncate text-xs font-normal text-muted-foreground">
									{#if pest.selectedVacuum}<ItemName name={pest.selectedVacuum.name} />{:else}No
										vacuum{/if}
								</p>
							</div>
						</div>
						<div class="flex min-w-36 flex-1 items-center">
							{#if pest.selectedVacuum}
								<div
									class="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background p-0.5"
								>
									<ItemRender
										skyblockId={pest.selectedVacuum.item.skyblockId ?? ''}
										inline={false}
										class="size-full [&>img]:p-0.5"
									/>
								</div>
							{:else}
								<div
									class="flex size-9 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted/30"
								>
									<CircleHelp class="size-3.5 text-muted-foreground/60" />
								</div>
							{/if}
						</div>
						<div class="flex w-full shrink-0 flex-col gap-1 sm:w-40">
							<span
								class={vacuumCompletion.maxed
									? 'text-xs font-medium text-completed'
									: 'text-xs font-normal text-muted-foreground'}>{vacuumCompletion.label}</span
							>
							<Progress
								value={vacuumCompletion.percentage}
								class={vacuumCompletion.maxed ? '**:data-[slot=progress-indicator]:bg-completed' : ''}
							/>
						</div>
					</div>
				</Accordion.Trigger>
				<Accordion.Content class="border-t bg-muted/15 px-4 pt-4 md:px-5">
					<VacuumSelector
						embedded
						vacuums={pest.vacuums}
						selected={pest.selectedVacuum}
						onSelect={(id) => pest.selectVacuum(id)}
					>
						<CategoryProgress
							name="Vacuum Upgrades"
							progress={pest.vacuumProgress}
							items={pest.itemsData}
							costFn={getUpgradeCost}
							referenceOnlyPrices={pest.ctx.isNonClassicProfile}
							applyUpgrade={(upgrade) => pest.applyActivePhaseUpgrade(upgrade)}
							expandUpgrade={(upgrade) => pest.expandActivePhaseUpgrade(upgrade)}
							getUpgrades={(progress) => pest.getProgressUpgrades(progress)}
						/>
					</VacuumSelector>
				</Accordion.Content>
			</Accordion.Item>
		{/if}
	</Accordion.Root>
</section>

{#snippet petOption(option: (typeof petOptions)[number] | undefined)}
	{#if option?.pet}
		<div class="flex min-w-0 items-center gap-2">
			<ItemRender skyblockId={option.pet.pet.type ?? ''} pet class="size-6 shrink-0" />
			<span class="truncate"><ItemName name={option.pet.getFormattedName()} /></span>
		</div>
	{:else}
		<span>No pet</span>
	{/if}
{/snippet}
