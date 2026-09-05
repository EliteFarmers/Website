<script lang="ts">
	import ToolPage from '$comp/tools/tool-page.svelte';
	import SliderField from '$comp/tools/slider-field.svelte';
	import * as Card from '$ui/card';
	import * as Select from '$ui/select';
	import Faq from '$comp/faq.svelte';
	import * as Alert from '$ui/alert';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import { Switch } from '$ui/switch';
	import * as Table from '$ui/table';
	import * as Tabs from '$ui/tabs';
	import { Walkthrough } from '$ui/walkthrough';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import { Crop } from 'farming-weight';
	import { page } from '$app/state';
	import { JacobCalculator } from './jacob-calculator.svelte';
	import { MONTHS_OPTIONS, MEDAL_BRACKETS, walkthroughSteps, faqItems } from './jacob-fortune-content';

	let showWalkthrough = $state(false);
	const calculator = new JacobCalculator();
	calculator.connect(() => page.url);
	const hasWheat = $derived(calculator.bracketRows.some((row) => row.crop === Crop.Wheat));
</script>

<ToolPage
	title="Jacob Contest Fortune"
	description="Estimate the farming fortune needed for each medal from recent contests."
>
	{#snippet actions()}
		<Button
			variant="ghost"
			size="sm"
			disabled={calculator.loading || !!calculator.error || !hasWheat}
			onclick={() => {
				calculator.activeMedal = 'gold';
				showWalkthrough = true;
			}}
		>
			<BookOpen class="size-4" aria-hidden="true" /> How to use
		</Button>
	{/snippet}

	<Card.Root id="jacob-controls" class="gap-4 rounded-md border-2 p-4 shadow-none">
		<h2 class="text-lg">Contest setup</h2>
		<div class="grid gap-5 sm:grid-cols-2">
			<SliderField
				id="jacob-bps"
				label="Blocks per second"
				bind:value={calculator.bps}
				min={10}
				max={20}
				step={0.5}
			/>
			<div class="space-y-2">
				<Label for="jacob-months">Contest history</Label>
				<Select.Simple
					id="jacob-months"
					class="w-full"
					options={MONTHS_OPTIONS.map((option, i) => ({ value: String(i), label: option.label }))}
					value={String(calculator.monthsIndex)}
					change={(value) => {
						if (value !== undefined) calculator.monthsIndex = Number(value);
					}}
				/>
				<p class="text-xs text-muted-foreground">SkyBlock months, including the current month.</p>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<Switch id="jacob-mooshroom" bind:checked={calculator.useMooshroom} />
			<Label for="jacob-mooshroom">Include Mooshroom mushrooms</Label>
		</div>
		<p class="text-xs text-muted-foreground">
			Contests since {calculator.lookbackStartLabel}.
			{#if calculator.brackets}{calculator.brackets.contestCount.toLocaleString()} contests across {calculator
					.brackets.monthsLoaded} month{calculator.brackets.monthsLoaded === 1 ? '' : 's'}.{/if}
		</p>
	</Card.Root>

	<!-- Results -->
	<div id="jacob-results">
		{#if calculator.loading}
			<div class="flex items-center gap-2 py-12">
				<Loader2 class="h-6 w-6 animate-spin" />
				<span class="text-sm text-muted-foreground">Loading bracket data...</span>
			</div>
		{:else if calculator.error}
			<Alert.Root variant="destructive">
				<Alert.Title>Contest data unavailable</Alert.Title>
				<Alert.Description>{calculator.error}</Alert.Description>
			</Alert.Root>
		{:else if !calculator.hasBracketRows}
			<p class="py-8 text-sm text-muted-foreground">
				No bracket data was returned for this range. Try another month range in a moment.
			</p>
		{:else}
			<Tabs.Root bind:value={calculator.activeMedal} class="w-full">
				<Tabs.List class="grid h-auto w-full grid-cols-5">
					{#each MEDAL_BRACKETS as medal (medal.key)}
						<Tabs.Trigger
							id={medal.key === 'gold' ? 'jacob-gold-tab' : undefined}
							value={medal.key}
							class="flex min-w-0 flex-col items-center gap-1 px-1 py-2 sm:flex-row sm:gap-2"
						>
							<img src="/images/medals/{medal.key}.webp" alt="" class="pixelated h-5 w-5" />
							<span>{medal.label}</span>
						</Tabs.Trigger>
					{/each}
				</Tabs.List>

				{#each MEDAL_BRACKETS as medal (medal.key)}
					<Tabs.Content value={medal.key}>
						<div class="mt-2 overflow-hidden rounded-md border">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Crop</Table.Head>
										<Table.Head class="text-right whitespace-normal">Avg Collection</Table.Head>
										<Table.Head class="text-right whitespace-normal">Fortune Required</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each calculator.bracketRows as row (row.cropName)}
										{@const entry = row?.entries.find((e) => e.key === medal.key)}
										{#if row && entry}
											<Table.Row>
												<Table.Cell class="whitespace-normal">
													<div class="flex items-center gap-2">
														{#if row.img}
															<img
																src={row.img}
																alt=""
																class="pixelated size-6 shrink-0"
															/>
														{/if}
														<span class="font-medium">{row.cropName}</span>
													</div>
												</Table.Cell>
												<Table.Cell
													id={medal.key === 'gold' && row.crop === Crop.Wheat
														? 'jacob-wheat-collection'
														: undefined}
													class="text-right font-mono"
												>
													{calculator.formatCollection(entry.collection)}
												</Table.Cell>
												<Table.Cell
													id={medal.key === 'gold' && row.crop === Crop.Wheat
														? 'jacob-wheat-fortune'
														: undefined}
													class="text-right font-mono"
												>
													{#if entry.fortune === 0}
														<span class="text-muted-foreground">0</span>
													{:else}
														{entry.fortune.toLocaleString()}
													{/if}
												</Table.Cell>
											</Table.Row>
										{/if}
									{/each}
								</Table.Body>
							</Table.Root>
						</div>

						{#if medal.key === 'silver' || medal.key === 'bronze'}
							<p class="mt-2 text-xs text-muted-foreground">
								A fortune of 0 means you can earn this medal just by farming for the full contest
								duration without any fortune.
							</p>
						{/if}
					</Tabs.Content>
				{/each}
			</Tabs.Root>
		{/if}
	</div>

	<!-- FAQ -->
	<Faq id="jacob-faq" title="About contest estimates" items={faqItems} />
</ToolPage>

<Walkthrough steps={walkthroughSteps} bind:open={showWalkthrough} />
