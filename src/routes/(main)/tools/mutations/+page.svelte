<script lang="ts">
	import ItemRender from '$comp/items/item-render.svelte';
	import ToolPage from '$comp/tools/tool-page.svelte';
	import SliderField from '$comp/tools/slider-field.svelte';
	import * as Card from '$ui/card';
	import * as Select from '$ui/select';
	import Faq from '$comp/faq.svelte';
	import * as Alert from '$ui/alert';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import * as Table from '$ui/table';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import { page } from '$app/state';
	import { MutationCalculator } from './mutation-calculator.svelte';
	import { faqItems } from './mutations-content';

	const calculator = new MutationCalculator();
	calculator.connect(() => page.url);
</script>

<ToolPage title="Mutation Copper" description="Find the cheapest mutations to analyze for Copper.">
	<Card.Root class="gap-4 rounded-md border-2 p-4 shadow-none">
		<div class="flex flex-wrap items-baseline justify-between gap-2">
			<h2 class="text-lg">Copper boosts</h2>
			<p class="text-sm text-muted-foreground">
				Total bonus <span class="font-medium text-foreground">+{calculator.totalCopperBonus.toFixed(1)}%</span>
			</p>
		</div>
		<div class="grid gap-6 sm:grid-cols-2">
			<SliderField
				id="synthesis-level"
				label="Synthesis Chip level"
				bind:value={calculator.synthesisLevel}
				max={20}
				description={calculator.synthesis.level > 0
					? `${calculator.synthesis.rarity} · +${calculator.synthesis.bonus.toFixed(1)}% Copper`
					: 'No Synthesis Chip equipped'}
			/>
			<SliderField
				id="rose-dragon-level"
				label="Rose Dragon level"
				bind:value={calculator.roseDragonLevel}
				min={100}
				max={200}
				allowNone
				description={calculator.roseDragonLevel > 0
					? `+${calculator.roseDragonBonus.toFixed(1)}% Copper`
					: 'No Rose Dragon equipped'}
			/>
		</div>
	</Card.Root>

	<section class="space-y-3" aria-labelledby="mutation-results">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h2 id="mutation-results" class="text-lg">Best value per Copper</h2>
				<p class="text-sm text-muted-foreground">Includes the mutation price and analysis fee.</p>
			</div>

			<div class="w-full space-y-2 sm:w-40">
				<Label for="mutation-buy-mode">Buy mutations with</Label>
				<Select.Simple
					id="mutation-buy-mode"
					class="w-full"
					bind:value={calculator.selectedType}
					options={[
						{ value: 'instabuy', label: 'Instant buy' },
						{ value: 'buyorder', label: 'Buy order' },
					]}
				/>
			</div>
		</div>

		{#if calculator.priceStatus === 'loading'}
			<div class="flex items-center gap-2 py-12" aria-live="polite">
				<Loader2 class="size-5 animate-spin" aria-hidden="true" />
				<span class="text-sm text-muted-foreground">Loading Bazaar prices...</span>
			</div>
		{:else if calculator.priceStatus === 'error'}
			<Alert.Root variant="destructive">
				<Alert.Title>Bazaar prices are unavailable</Alert.Title>
				<Alert.Description
					class="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
				>
					<span>The rankings need current mutation prices. Try loading them again in a moment.</span>
					<Button variant="outline" size="sm" onclick={calculator.fetchPrices}>
						<RotateCcw class="size-4" aria-hidden="true" />
						Try again
					</Button>
				</Alert.Description>
			</Alert.Root>
		{:else}
			<div class="overflow-hidden rounded-md border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="hidden w-12 text-center sm:table-cell">Rank</Table.Head>
							<Table.Head>Mutation</Table.Head>
							<Table.Head class="text-right">Coins / Copper</Table.Head>
							<Table.Head class="hidden text-right md:table-cell">Copper</Table.Head>
							<Table.Head class="hidden text-right md:table-cell">Total cost</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each calculator.sortedRatios as entry, index (entry.id)}
							{@const coinPerCopper = calculator.getCoinPerCopper(entry)}
							{@const totalCost = calculator.getTotalCost(entry)}
							<Table.Row>
								<Table.Cell class="hidden text-center text-muted-foreground sm:table-cell"
									>{index + 1}</Table.Cell
								>
								<Table.Cell class="whitespace-normal">
									<div class="flex items-center gap-2">
										<ItemRender skyblockId={entry.id} class="size-8 shrink-0" />
										<div class="min-w-0">
											<span class="font-medium">{entry.name}</span>
											<span class="block text-xs text-muted-foreground md:hidden"
												>{calculator.formatCopper(entry.copper)} Copper</span
											>
										</div>
									</div>
								</Table.Cell>
								<Table.Cell class="text-right tabular-nums">
									<span class="font-medium"
										>{Number.isFinite(coinPerCopper)
											? calculator.formatCoinRatio(coinPerCopper)
											: 'Unavailable'}</span
									>
									<span class="block text-xs text-muted-foreground md:hidden"
										>{Number.isFinite(totalCost)
											? `${calculator.formatCoins(totalCost)} total`
											: 'No price'}</span
									>
								</Table.Cell>
								<Table.Cell class="hidden text-right tabular-nums md:table-cell"
									>{calculator.formatCopper(entry.copper)}</Table.Cell
								>
								<Table.Cell class="hidden text-right text-muted-foreground tabular-nums md:table-cell"
									>{Number.isFinite(totalCost)
										? calculator.formatCoins(totalCost)
										: 'Unavailable'}</Table.Cell
								>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{/if}
	</section>

	<Faq title="About mutation costs" items={faqItems} />
</ToolPage>
