<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import PlayerSearch from '$comp/player-search.svelte';
	import CropRateDetails from '$comp/rates/crop-rate-details.svelte';
	import ToolPage from '$comp/tools/tool-page.svelte';
	import SliderField from '$comp/tools/slider-field.svelte';
	import * as Card from '$ui/card';
	import { Input } from '$ui/input';
	import CropSelector from '$comp/stats/contests/crop-selector.svelte';
	import { getSelectedCrops } from '$lib/stores/selectedCrops';
	import Faq from '$comp/faq.svelte';
	import * as Alert from '$ui/alert';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import { Switch } from '$ui/switch';
	import * as Table from '$ui/table';
	import { Walkthrough } from '$ui/walkthrough';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import { page } from '$app/state';
	import { RatesCalculator } from './rates-calculator.svelte';
	import {
		TIME_OPTIONS,
		PET_OPTIONS,
		REFORGE_OPTIONS,
		BAZAAR_MODE_OPTIONS,
		profitColumns,
		walkthroughSteps,
		faqItems,
	} from './rates-content';

	let showWalkthrough = $state(false);
	let showPlayerSearch = $state(false);
	const calculator = new RatesCalculator(getSelectedCrops());
	calculator.connect(() => page.url);
</script>

<ToolPage title="Rates Calculator" description="Compare crop collection and profit for your farming setup.">
	{#snippet actions()}
		<Button variant="ghost" size="sm" onclick={() => (showWalkthrough = true)}>
			<BookOpen class="size-4" aria-hidden="true" /> How to use
		</Button>
	{/snippet}

	<Card.Root
		class="gap-4 rounded-md border-2 border-primary/30 bg-primary/5 p-4 shadow-none sm:flex-row sm:items-center sm:justify-between"
	>
		<div class="space-y-1">
			<h2 class="font-medium">See rates for your actual gear</h2>
			<p class="max-w-2xl text-sm text-muted-foreground">
				This calculator uses a manual setup. Your player stats page calculates farming rates from your gear,
				pets, and Farming Fortune.
			</p>
		</div>
		<Button onclick={() => (showPlayerSearch = true)} class="w-full sm:w-auto">
			View personalized rates <ArrowRight class="size-4" aria-hidden="true" />
		</Button>
	</Card.Root>
	<PlayerSearch
		bind:open={showPlayerSearch}
		useButton={false}
		cmd={(player) => goto(resolve(`/@${encodeURIComponent(player)}/fortune`))}
	/>

	<Card.Root id="rates-controls" class="gap-5 rounded-md border-2 p-4 shadow-none">
		<h2 class="text-lg">Farming setup</h2>
		<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<div class="space-y-2">
				<Label for="rates-fortune">Farming fortune</Label>
				<Input
					id="rates-fortune"
					type="number"
					placeholder="Maximum"
					min={0}
					max={5000}
					bind:value={calculator.fortuneInput}
				/>
			</div>
			<div class="space-y-2">
				<Label for="rates-duration">Duration</Label>
				<Select.Simple
					id="rates-duration"
					class="w-full"
					options={TIME_OPTIONS}
					bind:value={calculator.timeBlocks}
				/>
			</div>
			<div class="space-y-2">
				<Label for="rates-reforge">Reforge</Label>
				<Select.Simple
					id="rates-reforge"
					class="w-full"
					options={REFORGE_OPTIONS}
					bind:value={calculator.reforge}
				/>
			</div>
			<div class="space-y-2">
				<Label for="rates-pet">Pet</Label>
				<Select.Simple id="rates-pet" class="w-full" options={PET_OPTIONS} bind:value={calculator.pet} />
			</div>
		</div>
		<div class="grid gap-4 sm:grid-cols-2">
			<SliderField
				id="rates-bps"
				label="Blocks per second"
				bind:value={calculator.bps}
				min={10}
				max={20}
				step={0.5}
			/>
			<div class="space-y-2">
				<Label for="rates-bazaar-mode">Sell crops with</Label>
				<Select.Simple
					id="rates-bazaar-mode"
					class="w-full"
					options={BAZAAR_MODE_OPTIONS}
					bind:value={calculator.bzMode}
				/>
			</div>
		</div>
		<div class="grid gap-3 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3">
			<div class="flex items-center gap-2">
				<Switch bind:checked={calculator.useMaxTool} id="sw-max-tool" /><Label for="sw-max-tool"
					>Level 50 Tool</Label
				>
			</div>
			<div class="flex items-center gap-2">
				<Switch bind:checked={calculator.useRarefinder} id="sw-rarefinder" /><Label for="sw-rarefinder"
					>Max Rarefinder Chip</Label
				>
			</div>
			<div class="flex items-center gap-2">
				<Switch bind:checked={calculator.useMechamind} id="sw-mechamind" /><Label for="sw-mechamind"
					>Max Mechamind Chip</Label
				>
			</div>
			<div class="flex items-center gap-2">
				<Switch bind:checked={calculator.useCropeetle} id="sw-cropeetle" /><Label for="sw-cropeetle"
					>Max Cropeetle Shard</Label
				>
			</div>
			<div class="flex items-center gap-2">
				<Switch bind:checked={calculator.useWartyBug} id="sw-wartybug" /><Label for="sw-wartybug"
					>Max Warty Bug Shard</Label
				>
			</div>
		</div>
		{#if calculator.isCustomFortune}
			<p class="text-xs text-muted-foreground">
				Fortune varies by crop. Compare the crop your entered fortune applies to.
			</p>
		{/if}
	</Card.Root>

	{#if calculator.bazaarStatus === 'error'}
		<Alert.Root variant="destructive">
			<Alert.Title>Bazaar prices are unavailable</Alert.Title>
			<Alert.Description
				>NPC estimates are still available. Bazaar values are hidden so they cannot be mistaken for live prices.</Alert.Description
			>
		</Alert.Root>
	{/if}

	<!-- Crop selector -->
	<CropSelector radio={true} allowDeselect />

	<!-- Results -->
	<div id="rates-results" class="w-full">
		{#if !calculator.selectedCrop}
			<div class="overflow-hidden rounded-md border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Crop</Table.Head>
							{#each profitColumns as column (column.key)}
								<Table.Head
									class="p-0 text-right"
									aria-sort={calculator.profitColumn === column.key
										? calculator.profitDirection
										: 'none'}
								>
									<Button
										variant="ghost"
										class="h-auto min-h-10 w-full justify-end gap-1 rounded-none px-2 py-2 whitespace-normal"
										onclick={() => calculator.sortByProfit(column.key)}
										aria-label={`Sort by ${column.label}, ${calculator.profitColumn === column.key && calculator.profitDirection === 'descending' ? 'lowest' : 'highest'} first`}
									>
										<span>{column.label}</span>
										{#if calculator.profitColumn !== column.key}<ArrowUpDown
												class="size-3.5"
												aria-hidden="true"
											/>
										{:else if calculator.profitDirection === 'descending'}<ArrowDown
												class="size-3.5"
												aria-hidden="true"
											/>
										{:else}<ArrowUp class="size-3.5" aria-hidden="true" />{/if}
										{#if column.key === 'bazaarProfit' && calculator.bazaarStatus === 'loading'}<Loader2
												class="size-3 animate-spin"
												aria-hidden="true"
											/>{/if}
									</Button>
								</Table.Head>
							{/each}
							<Table.Head class="hidden text-right sm:table-cell">Fortune</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each calculator.sortedCrops as row (row.crop)}
							<Table.Row
								class="cursor-pointer transition-colors hover:bg-muted/50 focus-visible:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
								role="button"
								tabindex={0}
								onclick={() => calculator.selectCrop(row.crop)}
								onkeydown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault();
										calculator.selectCrop(row.crop);
									}
								}}
							>
								<Table.Cell class="whitespace-normal">
									<div class="flex items-center gap-2">
										{#if row.img}
											<img src={row.img} alt="" class="pixelated size-6 shrink-0" />
										{/if}
										<div>
											<span class="font-medium">{row.displayName}</span>
											<span class="block text-xs text-muted-foreground sm:hidden"
												>{Math.round(row.fortune).toLocaleString()} FF</span
											>
										</div>
									</div>
								</Table.Cell>
								<Table.Cell class="text-right tabular-nums">
									{Math.round(row.npcProfit).toLocaleString()}
								</Table.Cell>
								<Table.Cell class="text-right tabular-nums">
									{row.bazaarProfit === null ? '—' : Math.round(row.bazaarProfit).toLocaleString()}
								</Table.Cell>
								<Table.Cell class="hidden text-right text-muted-foreground tabular-nums sm:table-cell">
									{row.fortune.toLocaleString()}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{:else if calculator.selectedCropDetail}
			<CropRateDetails
				detail={calculator.selectedCropDetail}
				timeName={calculator.timeName}
				bzMode={calculator.bzMode}
				bazaarStatus={calculator.bazaarStatus}
				onBack={calculator.clearSelectedCrop}
			/>
		{/if}
	</div>

	<!-- FAQ -->
	<Faq id="rates-faq" title="About this calculator" items={faqItems} />
</ToolPage>

<Walkthrough steps={walkthroughSteps} bind:open={showWalkthrough} />
