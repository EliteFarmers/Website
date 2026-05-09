<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer.svelte';
	import * as Select from '$ui/select';
	import { Stat, type FarmingPet, type FortuneUpgrade, type UpgradeInfo, type UpgradeTreeNode } from 'farming-weight';
	import FortuneProgress from './fortune-progress.svelte';
	import UpgradeTree from './upgrades/upgrade-tree.svelte';

	interface Props {
		player: RatesPlayerStore;
		pets?: FarmingPet[];
		items?: RatesItemPriceData;
		costFn?: (upgrade: FortuneUpgrade | UpgradeInfo, items?: RatesItemPriceData) => number;
		expandUpgrade: (upgrade: FortuneUpgrade) => UpgradeTreeNode;
	}

	let { player, pets: petList, items, costFn, expandUpgrade }: Props = $props();

	const petStats = [Stat.FarmingFortune, Stat.Overbloom];
	let selectedPetId = $state<string | undefined>(undefined);

	const pets = $derived(petList ?? $player.pets);
	const sortedPets = $derived.by(() => {
		return [...pets].sort(
			(a, b) => b.getFortune(Stat.FarmingFortune, $player) - a.getFortune(Stat.FarmingFortune, $player)
		);
	});
	const petOptions = $derived.by(() =>
		sortedPets.map((pet) => ({
			value: pet.pet.uuid ?? '',
			label: pet.getFormattedName(),
			pet,
		}))
	);
	const bestPet = $derived(sortedPets[0]);
	const selectedPet = $derived.by(() => pets.find((pet) => pet.pet.uuid === selectedPetId) ?? bestPet);
	const selectedProgress = $derived.by(() => selectedPet?.getProgress(petStats, $player)[0]);
	const selectedBreakdown = $derived.by(() => selectedPet?.getFullBreakdown($player));
	const selectedUpgrades = $derived.by(() => selectedPet?.getUpgrades({ stats: petStats }, $player) ?? []);
	const sortedUpgrades = $derived.by(() => {
		const upgrades = [...selectedUpgrades];
		upgrades.sort((a, b) => {
			if (!costFn) return (b.increase ?? 0) - (a.increase ?? 0);
			const aCost = a.increase > 0 ? costFn(a, items) / a.increase : Infinity;
			const bCost = b.increase > 0 ? costFn(b, items) / b.increase : Infinity;
			return aCost - bCost;
		});
		return upgrades;
	});

	function getUpgradeKey(upgrade: FortuneUpgrade, index: number): string {
		const metaKey = upgrade.meta?.id ?? upgrade.meta?.key ?? '';
		return `${upgrade.category}|${upgrade.title}|${metaKey}|${upgrade.conflictKey ?? ''}|${index}`;
	}

	function getUpgradeNode(upgrade: FortuneUpgrade): UpgradeTreeNode {
		return expandUpgrade(upgrade);
	}
</script>

<section class="bg-card flex w-full max-w-6xl flex-col gap-4 rounded-lg border-2 p-4">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
			<h2 class="text-xl">Pet Fortune</h2>
			{#if petOptions.length > 1}
				<Select.Simple
					size="sm"
					class="h-8 min-w-48"
					options={petOptions}
					value={selectedPet?.pet.uuid}
					placeholder="Select pet"
					change={(petId?: string) => {
						if (petId) selectedPetId = petId;
					}}
				>
					{#snippet trigger(option)}
						<span class="truncate">
							<FormattedText text={option?.label ?? 'Select pet'} />
						</span>
					{/snippet}
					{#snippet option(option)}
						<div class="flex min-w-0 flex-row items-center gap-2">
							<ItemRender skyblockId={option.pet.type} pet class="size-6" />
							<span class="truncate">
								<FormattedText text={option.label} />
							</span>
						</div>
					{/snippet}
				</Select.Simple>
			{/if}
		</div>

		{#if selectedPet}
			<FortuneBreakdown title="Pet Fortune Breakdown" breakdown={selectedBreakdown} />
		{/if}
	</div>

	<hr class="w-full" />

	{#if selectedPet && selectedProgress}
		<div class="flex flex-col gap-4">
			<div class="flex min-w-0 items-center gap-3">
				<div class="bg-background rounded-md border p-1.5">
					<ItemRender skyblockId={selectedPet.type} pet class="size-10" />
				</div>
				<div class="min-w-0">
					<p class="text-lg font-semibold wrap-break-word">
						<FormattedText text={selectedPet.getFormattedName()} />
					</p>
					<p class="text-muted-foreground text-sm capitalize">
						Level {selectedPet.level}
						{selectedPet.rarity}
					</p>
				</div>
			</div>

			{#if selectedProgress.progress?.length}
				<div class="grid w-full grid-cols-1 gap-2 md:grid-cols-2">
					{#each selectedProgress.progress as progress (progress.name)}
						<div class="rounded-md border px-2 py-1">
							<FortuneProgress {progress} barBg="bg-card" />
						</div>
					{/each}
				</div>
			{:else if selectedProgress.stats || selectedProgress.effects?.length}
				<FortuneProgress progress={selectedProgress} barBg="bg-card" useItemName={false} />
			{:else}
				<p class="text-muted-foreground text-sm">
					This pet does not currently add the selected fortune stats, but upgrades may still make it useful.
				</p>
			{/if}

			{#if sortedUpgrades.length > 0}
				<div class="flex flex-col gap-2">
					<h3 class="text-muted-foreground text-sm font-bold tracking-wider uppercase">Available Upgrades</h3>
					{#each sortedUpgrades as upgrade, i (getUpgradeKey(upgrade, i))}
						<UpgradeTree node={getUpgradeNode(upgrade)} {items} {costFn} />
					{/each}
				</div>
			{:else}
				<p class="text-muted-foreground text-sm">No pet upgrades found for the selected stats.</p>
			{/if}
		</div>
	{:else}
		<p class="text-muted-foreground text-sm">No farming pets found.</p>
	{/if}
</section>
