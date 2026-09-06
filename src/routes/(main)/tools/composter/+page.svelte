<script lang="ts">
	import { page } from '$app/state';
	import Faq from '$comp/faq.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import CoinsBreakdown from '$comp/rates/coins-breakdown.svelte';
	import SliderField from '$comp/tools/slider-field.svelte';
	import ToolPage from '$comp/tools/tool-page.svelte';
	import ToolStat from '$comp/tools/tool-stat.svelte';
	import * as Alert from '$ui/alert';
	import { Button } from '$ui/button';
	import * as Card from '$ui/card';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import * as Table from '$ui/table';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import { type RankedComposterMaterial } from 'farming-weight';
	import { ComposterCalculator } from './composter-calculator.svelte';
	import { faqItems, upgradeSettings } from './composter-content';

	const calculator = new ComposterCalculator();
	calculator.connect(() => page.url);
</script>

<ToolPage title="Composter Calculator" description="Compare inputs, upgrades, Compost output, and daily profit.">
	{#if calculator.priceStatus === 'error'}
		<Alert.Root variant="destructive">
			<Alert.Title>Market prices are unavailable</Alert.Title>
			<Alert.Description class="flex flex-wrap items-center justify-between gap-3">
				<span>Upgrade and output calculations still work, but profit and rankings need current prices.</span>
				<Button variant="outline" size="sm" onclick={calculator.fetchPrices}>
					<RotateCcw class="size-4" aria-hidden="true" /> Try again
				</Button>
			</Alert.Description>
		</Alert.Root>
	{/if}

	<div class="grid items-start gap-6 lg:grid-cols-2">
		<Card.Root class="gap-5 rounded-md border-2 p-4 shadow-none">
			<div class="flex items-center justify-between gap-3">
				<h2 class="text-lg">Composter setup</h2>
				<div class="flex gap-1">
					<Button variant="ghost" size="sm" onclick={() => calculator.resetUpgrades(0)}>Reset</Button>
					<Button variant="outline" size="sm" onclick={() => calculator.resetUpgrades(25)}>Max all</Button>
				</div>
			</div>
			<div class="grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
				{#each upgradeSettings as upgrade (upgrade.key)}
					<SliderField
						id="upgrade-{upgrade.key}"
						label={upgrade.name}
						bind:value={calculator.upgradeLevels[upgrade.key]}
						max={25}
						description={upgrade.detail}
					/>
				{/each}
			</div>
			<div class="space-y-4 border-t pt-4">
				<div class="space-y-2">
					<Label for="organic-item">Organic Matter</Label>
					<Select.Simple
						id="organic-item"
						value={calculator.selectedOrganic.itemId}
						change={(value) => {
							if (value) calculator.selectedOrganicId = value;
						}}
						class="w-full"
						disabled={calculator.organicRankings.length === 0}
						options={calculator.organicRankings
							.filter((item) => item.fitsCapacity)
							.map((item) => ({ value: item.itemId, label: item.name }))}
					/>
				</div>
				<div class="space-y-2">
					<Label for="fuel-item">Machine Fuel</Label>
					<Select.Simple
						id="fuel-item"
						value={calculator.selectedFuel.itemId}
						change={(value) => {
							if (value) calculator.selectedFuelId = value;
						}}
						class="w-full"
						disabled={calculator.fuelRankings.length === 0}
						options={calculator.fuelRankings
							.filter((item) => item.fitsCapacity)
							.map((item) => ({ value: item.itemId, label: item.name }))}
					/>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-2">
						<Label for="composter-buy-mode">Buy inputs with</Label>
						<Select.Simple
							id="composter-buy-mode"
							class="w-full"
							bind:value={calculator.purchaseMode}
							options={[
								{ value: 'instabuy', label: 'Instant buy' },
								{ value: 'buyorder', label: 'Buy order' },
							]}
						/>
					</div>
					<div class="space-y-2">
						<Label for="composter-sell-mode">Sell Compost with</Label>
						<Select.Simple
							id="composter-sell-mode"
							class="w-full"
							bind:value={calculator.sellMode}
							options={[
								{ value: 'instasell', label: 'Instant sell' },
								{ value: 'sellorder', label: 'Sell order' },
							]}
						/>
					</div>
				</div>
			</div>
		</Card.Root>

		<section class="min-w-0 space-y-5" aria-labelledby="profit-summary">
			<div class="space-y-3">
				<h2 id="profit-summary" class="text-lg">Estimated daily profit</h2>
				{#if calculator.priceStatus === 'loading'}
					<p class="flex items-center gap-2 text-sm text-muted-foreground" role="status">
						<Loader2 class="size-4 animate-spin" aria-hidden="true" /> Loading market prices…
					</p>
				{:else if calculator.calculation.profitPerDay !== undefined}
					<div class="text-2xl"><CoinsBreakdown coins={calculator.calculation.profitPerDay} /></div>
				{:else}
					<p class="text-sm text-muted-foreground">Profit needs market prices.</p>
				{/if}
				<p class="text-xs text-muted-foreground">
					24 hours of continuous operation, after Organic Matter and Fuel costs.
				</p>
			</div>
			<dl class="grid grid-cols-2 gap-x-4 gap-y-5 border-y py-4">
				<ToolStat
					label="Compost / day"
					value={calculator.formatNumber(calculator.calculation.compostPerDay, 1)}
				/>
				<ToolStat
					label="Compost / hour"
					value={calculator.formatNumber(calculator.calculation.compostPerHour, 2)}
				/>
				<ToolStat label="Revenue / day" value={calculator.formatCoins(calculator.calculation.revenuePerDay)} />
				<ToolStat
					label="Input cost / day"
					value={calculator.formatCoins(calculator.calculation.totalCostPerDay)}
				/>
			</dl>
			<div>
				<h3 class="font-medium">Operating details</h3>
				<dl class="mt-3 space-y-3 text-sm">
					{@render detail(
						'Cycle time',
						`${calculator.formatNumber(calculator.calculation.secondsPerCycle, 1)} seconds`
					)}
					{@render detail(
						'Organic Matter / cycle',
						calculator.formatNumber(calculator.calculation.organicMatterPerCycle)
					)}
					{@render detail('Fuel / cycle', calculator.formatNumber(calculator.calculation.fuelPerCycle))}
					{@render detail(
						'Expected Compost / cycle',
						calculator.formatNumber(calculator.calculation.expectedCompostPerCycle, 2)
					)}
					{@render detail(
						'Organic Matter cost / day',
						calculator.formatCoins(calculator.calculation.organicCostPerDay)
					)}
					{@render detail('Fuel cost / day', calculator.formatCoins(calculator.calculation.fuelCostPerDay))}
					{@render detail('Cost / Compost', calculator.formatCoins(calculator.calculation.costPerCompost))}
					{@render detail(
						'Runtime per full load',
						calculator.formatDuration(calculator.calculation.unattendedHours)
					)}
				</dl>
			</div>
		</section>
	</div>

	<section class="space-y-4" aria-labelledby="input-rankings">
		<div class="space-y-1">
			<h2 id="input-rankings" class="text-lg">Cheapest inputs</h2>
			<p class="text-sm text-muted-foreground">
				Ranked by coins per unit. Organic Matter includes enchanted and compacted items.
			</p>
		</div>
		{#if calculator.priceStatus === 'loading'}
			<p class="flex items-center gap-2 py-6 text-sm text-muted-foreground" role="status">
				<Loader2 class="size-4 animate-spin" aria-hidden="true" /> Comparing prices…
			</p>
		{:else}
			<div class="grid gap-5 xl:grid-cols-2">
				{@render rankingList('Organic Matter', calculator.organicRankings.slice(0, 8), 'organic')}
				{@render rankingList('Machine Fuel', calculator.fuelRankings.slice(0, 8), 'fuel')}
			</div>
		{/if}
	</section>

	<Faq title="About this estimate" items={faqItems}>
		<p class="mt-4 text-xs text-muted-foreground">Your actual profit may differ as market prices change.</p>
	</Faq>
</ToolPage>

{#snippet detail(label: string, value: string)}
	<div class="flex items-center justify-between gap-4">
		<dt class="text-muted-foreground">{label}</dt>
		<dd class="text-right font-medium">{value}</dd>
	</div>
{/snippet}

{#snippet rankingList(title: string, items: readonly RankedComposterMaterial[], type: 'organic' | 'fuel')}
	<div class="min-w-0 space-y-2">
		<h3 class="font-medium">{title}</h3>
		<div class="overflow-hidden rounded-md border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Item</Table.Head>
						<Table.Head class="text-right">Cost / cycle</Table.Head>
						<Table.Head class="w-16"><span class="sr-only">Selection</span></Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each items as item (item.itemId)}
						{@const selected =
							item.itemId ===
							(type === 'organic' ? calculator.selectedOrganic.itemId : calculator.selectedFuel.itemId)}
						<Table.Row data-state={selected ? 'selected' : undefined}>
							<Table.Cell class="whitespace-normal">
								<div class="flex items-center gap-2">
									<ItemRender skyblockId={item.itemId} class="size-8 shrink-0" />
									<div class="min-w-0">
										<p class="font-medium">{item.name}</p>
										<p class="text-xs text-muted-foreground">
											{calculator.formatNumber(item.coinsPerValue, 3)} coins / unit
										</p>
										{#if !item.fitsCapacity}<p class="text-xs text-muted-foreground">
												Needs more capacity
											</p>{/if}
									</div>
								</div>
							</Table.Cell>
							<Table.Cell class="text-right tabular-nums"
								>{calculator.formatNumber(item.costPerCycle)}</Table.Cell
							>
							<Table.Cell class="text-right">
								<Button
									variant={selected ? 'secondary' : 'outline'}
									size="sm"
									class="min-w-16"
									aria-label={`Use ${item.name}`}
									aria-pressed={selected}
									disabled={!item.fitsCapacity}
									onclick={() =>
										type === 'organic'
											? (calculator.selectedOrganicId = item.itemId)
											: (calculator.selectedFuelId = item.itemId)}
								>
									{selected ? 'Using' : 'Use'}
								</Button>
							</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row
							><Table.Cell colspan={3} class="py-6 text-muted-foreground"
								>No current prices are available.</Table.Cell
							></Table.Row
						>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</div>
{/snippet}
