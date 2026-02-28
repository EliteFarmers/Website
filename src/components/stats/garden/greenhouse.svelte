<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import type { ProfileMemberMutationDataDto } from '$lib/api';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Dialog from '$ui/dialog';
	import * as Item from '$ui/item';
	import { compareRarity, getGreenhouseMutationRenderItemId, GREENHOUSE_MUTATIONS } from 'farming-weight';
	import ProgressBar from '../progress-bar.svelte';
	import MutationRequirementsGrid from './mutation-requirements-grid.svelte';

	interface MutationSpreadCondition {
		readonly type: string;
		readonly crop?: string;
		readonly count?: number;
		readonly range?: string;
		readonly requirement?: string;
	}

	interface MutationData {
		readonly id: string;
		readonly rarity: string;
		readonly display: {
			readonly name: string;
		};
		readonly growth: {
			readonly size: readonly number[];
			readonly surface: string;
			readonly stages: number;
			readonly requiresWater: boolean;
		};
		readonly spreadingConditions?: readonly MutationSpreadCondition[];
		readonly drops?: readonly {
			readonly item: string;
			readonly amount: number;
		}[];
	}

	interface MutationEntry {
		key: string;
		rarity: string;
		sortName: string;
		mutation: MutationData;
		status?: ProfileMemberMutationDataDto;
	}

	const ctx = getStatsContext();
	const garden = $derived(ctx.member.current?.memberData?.garden);
	const profileGarden = $derived(ctx.member.current?.garden);

	let detailsOpen = $state(false);
	let selectedMutation = $state<MutationEntry | null>(null);

	function stripMinecraftFormatting(text: string): string {
		return text.replaceAll(/(?:\u00C2)?\u00A7[0-9a-fk-or]/gi, '').trim();
	}

	function formatMutationField(value: string): string {
		const lower = value.replaceAll('_', ' ').toLowerCase();
		return lower.replace(/\b\w/g, (letter) => letter.toUpperCase());
	}

	function getMutationStatus(mutationKey: string, mutationId: string) {
		const mutations = garden?.mutations;
		if (!mutations) return undefined;

		return (
			mutations[mutationKey] ??
			mutations[mutationId] ??
			mutations[mutationKey.toLowerCase()] ??
			mutations[mutationId.toLowerCase()] ??
			mutations[mutationId.toUpperCase()]
		);
	}

	function getMutationStatusText(status?: ProfileMemberMutationDataDto) {
		if (status?.analyzed) return 'Analyzed';
		if (status?.discovered) return 'Discovered';
		return 'Undiscovered';
	}

	function compareMutationRarity(a: string, b: string) {
		if (a === 'Unknown' && b === 'Unknown') return 0;
		if (a === 'Unknown') return 1;
		if (b === 'Unknown') return -1;
		return compareRarity(b, a);
	}

	function getSpreadConditionLabel(condition: MutationSpreadCondition) {
		if (condition.type === 'CROP' && condition.crop) {
			const crop = formatMutationField(condition.crop);
			const range = formatMutationField(condition.range ?? 'ADJACENT');
			return `${condition.count ?? 1}x ${crop} (${range})`;
		}

		if (condition.type === 'EFFECT_TYPE' && condition.requirement) {
			return `Requires ${formatMutationField(condition.requirement)} effects`;
		}

		return formatMutationField(condition.type);
	}

	function onMutationCardKeydown(event: KeyboardEvent, entry: MutationEntry) {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		selectedMutation = entry;
		detailsOpen = true;
	}

	function openMutationDialog(entry: MutationEntry) {
		selectedMutation = entry;
		detailsOpen = true;
	}

	function openMutationById(mutationId: string) {
		const next = mutationById[mutationId];
		if (!next) return;
		selectedMutation = next;
		detailsOpen = true;
	}

	function onDialogOpenChange(open: boolean) {
		detailsOpen = open;
		if (!open) {
			selectedMutation = null;
		}
	}

	let mutationEntries = $derived.by(() =>
		Object.entries(GREENHOUSE_MUTATIONS).map(([key, mutation]) => {
			const mutationData = mutation as MutationData;
			return {
				key,
				mutation: mutationData,
				status: getMutationStatus(key, mutationData.id),
				rarity: mutationData.rarity ?? 'Unknown',
				sortName: stripMinecraftFormatting(mutationData.display.name),
			} satisfies MutationEntry;
		})
	);

	let mutationById = $derived.by(() =>
		mutationEntries.reduce<Record<string, MutationEntry>>((acc, entry) => {
			acc[entry.mutation.id] ??= entry;
			return acc;
		}, {})
	);

	let groupedMutations = $derived.by(() => {
		const groups: Partial<Record<string, MutationEntry[]>> = {};

		for (const entry of mutationEntries) {
			groups[entry.rarity] ??= [];
			groups[entry.rarity]?.push(entry);
		}

		for (const group of Object.values(groups)) {
			group?.sort((a, b) => a.sortName.localeCompare(b.sortName));
		}

		return Object.entries(groups).sort(([a], [b]) => compareMutationRarity(a, b));
	});
</script>

<div class="flex w-full max-w-7xl flex-col items-center gap-8">
	<div class="flex w-full max-w-4xl flex-1 flex-col gap-1">
		<h3 class="mt-2 mb-4 text-xl leading-none font-semibold">Greenhouse Upgrades</h3>
		<div class="flex flex-col items-center justify-center gap-6 md:flex-row">
			<div class="flex flex-col gap-2">
				<p class="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
					Greenhouse Plant Slots
				</p>
				<div class="grid h-fit w-fit grid-cols-10 gap-px">
					{#each { length: 100 }, index (index)}
						{@const x = index % 10}
						{@const y = Math.floor(index / 10)}
						{@const isFilled = profileGarden?.greenhouseSlots.some((slot) => slot.x === x && slot.z === y)}
						{@const isCenter = x >= 3 && x <= 6 && y >= 3 && y <= 6 && (x % 3 !== 0 || y % 3 !== 0)}
						<div
							class="size-6 rounded-sm {isFilled
								? 'bg-progress'
								: isCenter
									? 'bg-progress/60'
									: 'bg-muted'}"
						></div>
					{/each}
				</div>
			</div>
			<div class="flex flex-1 flex-col gap-2">
				<Item.Root variant="outline" class="flex w-full flex-row items-center">
					<ItemRender skyblockId="SEEDS" class="pixelated size-12" />
					<Item.Content>
						<Item.Title class="font-semibold">Growth Speed</Item.Title>
						<Item.Description
							><ProgressBar
								class="text-primary"
								percent={((profileGarden?.gardenUpgrades?.greenhouseGrowthSpeed ?? 0) / 9) * 100}
								readable="{profileGarden?.gardenUpgrades?.greenhouseGrowthSpeed ?? 0} / 9"
								barBg="bg-card"
							/></Item.Description
						>
					</Item.Content>
				</Item.Root>
				<Item.Root variant="outline" class="flex w-full flex-row items-center">
					<ItemRender skyblockId="FLOWER_POT_ITEM" class="pixelated size-12" />
					<Item.Content>
						<Item.Title class="font-semibold">Plant Yield</Item.Title>
						<Item.Description
							><ProgressBar
								class="text-primary"
								percent={((profileGarden?.gardenUpgrades?.greenhouseYield ?? 0) / 9) * 100}
								readable="{profileGarden?.gardenUpgrades?.greenhouseYield ?? 0} / 9"
								barBg="bg-card"
							/></Item.Description
						>
					</Item.Content>
				</Item.Root>
				<Item.Root variant="outline" class="flex w-full flex-row items-center">
					<ItemRender skyblockId="GRASS" class="pixelated size-12" />
					<Item.Content>
						<Item.Title class="font-semibold">Greenhouse Plot Limit</Item.Title>
						<Item.Description
							><ProgressBar
								class="text-primary"
								percent={((profileGarden?.gardenUpgrades?.greenhousePlotLimit ?? 0) / 2) * 100}
								readable="{profileGarden?.gardenUpgrades?.greenhousePlotLimit ?? 0} / 2"
								barBg="bg-card"
							/></Item.Description
						>
					</Item.Content>
				</Item.Root>
			</div>
		</div>
	</div>
	<div class="flex w-full max-w-4xl flex-1 flex-col gap-1">
		<h3 class="mt-2 mb-4 text-xl leading-none font-semibold">Mutations</h3>
		<div class="flex flex-col gap-5">
			{#each groupedMutations as [rarity, mutations] (rarity)}
				<div class="flex flex-col gap-2">
					<p class="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{rarity}</p>
					<div class="grid grid-cols-2 gap-2 md:grid-cols-3">
						{#each mutations as entry (entry.key)}
							<Item.Root
								variant="outline"
								class={`relative flex cursor-pointer flex-row items-center transition-colors hover:bg-zinc-500/5 ${entry.status?.analyzed ? 'border-completed' : ''} ${entry.status?.discovered ? '' : 'opacity-70'}`}
								role="button"
								tabindex={0}
								onclick={() => openMutationDialog(entry)}
								onkeydown={(event) => onMutationCardKeydown(event, entry)}
							>
								<ItemRender skyblockId={entry.mutation.id} class="pixelated size-12" />
								<Item.Content>
									<Item.Title class="flex items-center gap-1 font-semibold">
										<FormattedText text={entry.mutation.display.name} />
									</Item.Title>
									<Item.Description>{getMutationStatusText(entry.status)}</Item.Description>
								</Item.Content>
							</Item.Root>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<Dialog.Root open={detailsOpen} onOpenChange={onDialogOpenChange}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
		{#if selectedMutation}
			<Dialog.Header>
				<Dialog.Title>
					<FormattedText text={selectedMutation.mutation.display.name} />
				</Dialog.Title>
				<Dialog.Description>
					Spread requirements, growth data, and drops for this greenhouse mutation.
				</Dialog.Description>
			</Dialog.Header>

			<div class="flex flex-col gap-6 py-4">
				<div class="grid grid-cols-2 gap-2 md:grid-cols-5">
					<div class="bg-muted rounded-md border p-2">
						<p class="text-muted-foreground text-xs font-medium uppercase">Rarity</p>
						<p class="text-sm font-semibold">{selectedMutation.rarity}</p>
					</div>
					<div class="bg-muted rounded-md border p-2">
						<p class="text-muted-foreground text-xs font-medium uppercase">Status</p>
						<p class="text-sm font-semibold">{getMutationStatusText(selectedMutation.status)}</p>
					</div>
					<div class="bg-muted rounded-md border p-2">
						<p class="text-muted-foreground text-xs font-medium uppercase">Size</p>
						<p class="text-sm font-semibold">
							{selectedMutation.mutation.growth.size[0] ?? 1}x{selectedMutation.mutation.growth.size[1] ??
								1}
						</p>
					</div>
					<div class="bg-muted rounded-md border p-2">
						<p class="text-muted-foreground text-xs font-medium uppercase">Surface</p>
						<p class="text-sm font-semibold">
							{formatMutationField(selectedMutation.mutation.growth.surface)}
						</p>
					</div>
					<div class="bg-muted rounded-md border p-2">
						<p class="text-muted-foreground text-xs font-medium uppercase">Growth Stages</p>
						<p class="text-sm font-semibold">{selectedMutation.mutation.growth.stages}</p>
					</div>
				</div>

				<div class="flex flex-col items-center gap-2">
					<p class="text-sm font-semibold">Spread Grid</p>
					<p class="text-muted-foreground text-center text-sm">
						These are just the base requirements, not an optimal greenhouse layout!
					</p>
					<MutationRequirementsGrid
						mutation={selectedMutation.mutation}
						onMutationSelect={openMutationById}
					/>
				</div>

				{#if selectedMutation.mutation.spreadingConditions?.length}
					<div class="flex flex-col gap-1">
						<p class="text-sm font-semibold">Conditions</p>
						<ul class="text-muted-foreground list-disc pl-5 text-sm">
							{#each selectedMutation.mutation.spreadingConditions as condition, idx (idx)}
								<li>{getSpreadConditionLabel(condition)}</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if selectedMutation.mutation.drops?.length}
					<div class="flex flex-col gap-2">
						<p class="text-sm font-semibold">Drops</p>
						<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
							{#each selectedMutation.mutation.drops as drop (drop.item)}
								<Item.Root variant="outline" size="sm" class="flex flex-row items-center">
									<ItemRender
										skyblockId={getGreenhouseMutationRenderItemId(drop.item)}
										class="pixelated size-8"
									/>
									<Item.Content>
										<Item.Title class="font-semibold">{formatMutationField(drop.item)}</Item.Title>
										<Item.Description>{drop.amount.toLocaleString()} base drops</Item.Description>
									</Item.Content>
								</Item.Root>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
