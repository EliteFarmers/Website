<script lang="ts">
	import Head from '$comp/head.svelte';
	import type { ContestBracketsDetailsDto, ContestBracketsDto } from '$lib/api';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getReadableSkyblockDate, getSkyblockDate, getTimeStamp } from '$lib/format';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import { getJacobMedalBrackets } from '$lib/remote';
	import * as Accordion from '$ui/accordion';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import { SliderSimple } from '$ui/slider';
	import { Switch } from '$ui/switch';
	import * as Table from '$ui/table';
	import * as Tabs from '$ui/tabs';
	import { Walkthrough } from '$ui/walkthrough';
	import type { Step } from '$ui/walkthrough/ctx';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import { getCropDisplayName, getCropFromName, getFortuneRequiredForCollection } from 'farming-weight';

	const MONTHS_OPTIONS = [
		{ value: 1, label: '1 Month' },
		{ value: 4, label: '4 Months' },
		{ value: 8, label: '8 Months' },
		{ value: 12, label: '12 Months' },
	];

	interface MedalBracketEntry {
		key: keyof ContestBracketsDto;
		label: string;
		color: string;
		collection: number;
		fortune: number;
	}

	interface BracketRow {
		cropName: string;
		crop: NonNullable<ReturnType<typeof getCropFromName>>;
		img?: string;
		entries: MedalBracketEntry[];
	}

	const MEDAL_BRACKETS: { key: keyof ContestBracketsDto; label: string; color: string }[] = [
		{ key: 'diamond', label: 'Diamond', color: 'text-cyan-400' },
		{ key: 'platinum', label: 'Platinum', color: 'text-emerald-400' },
		{ key: 'gold', label: 'Gold', color: 'text-yellow-400' },
		{ key: 'silver', label: 'Silver', color: 'text-gray-300' },
		{ key: 'bronze', label: 'Bronze', color: 'text-amber-700' },
	];

	let bps = $state(20);
	let useMooshroom = $state(true);
	let monthsIndex = $state(1);
	let loading = $state(true);
	let error = $state('');
	let brackets = $state<ContestBracketsDetailsDto | null>(null);

	let showWalkthrough = $state(false);

	$effect(() => {
		if (!localStorage.getItem('jacob-fortune-walkthrough-seen')) {
			showWalkthrough = true;
		}
	});

	function completeWalkthrough() {
		localStorage.setItem('jacob-fortune-walkthrough-seen', 'true');
	}

	const walkthroughSteps: Step[] = [
		{
			target: 'jacob-controls',
			title: 'Settings',
			description:
				'Adjust your BPS efficiency, toggle Mooshroom Mushroom inclusion, and choose a lookback period.',
			position: 'bottom',
		},
		{
			target: 'jacob-results',
			title: 'Medal Brackets',
			description: 'Switch between medal tiers to see the average collection and fortune required for each crop.',
			position: 'top',
		},
		{
			target: 'jacob-faq',
			title: 'FAQ',
			description: 'Common questions about Jacob contests and how the requirements are calculated.',
			position: 'top',
		},
	];

	const selectedMonths = $derived(MONTHS_OPTIONS[monthsIndex]?.value ?? MONTHS_OPTIONS[0].value);
	const ratio = $derived(bps / 20);
	const blocksBroken = $derived(Math.round(24_000 * ratio));
	const lookbackStartLabel = $derived.by(() => {
		const now = getSkyblockDate(Date.now() / 1000);
		const totalMonths = now.year * 12 + now.month - (selectedMonths - 1);
		const clampedTotalMonths = Math.max(totalMonths, 0);
		const year = Math.floor(clampedTotalMonths / 12);
		const month = clampedTotalMonths % 12;
		return getReadableSkyblockDate(getTimeStamp(year, month, 0));
	});

	const bracketRows = $derived.by(() => {
		if (!brackets) return [] as BracketRow[];
		return Object.entries(brackets.brackets)
			.flatMap(([cropName, medals]) => {
				const crop = getCropFromName(cropName);
				if (!crop) return [];
				const displayName = getCropDisplayName(crop);
				const img = PROPER_CROP_TO_IMG[displayName];
				const entries: MedalBracketEntry[] = MEDAL_BRACKETS.map((medal) => {
					const collection = (medals[medal.key] ?? 0) as number;
					const fortune = Math.max(
						getFortuneRequiredForCollection({
							crop,
							collection,
							blocksBroken,
							useMooshroom,
						}),
						0
					);
					return { collection, fortune, ...medal };
				});
				return [{ cropName: displayName, crop, img, entries }];
			})
			.sort((a, b) => a.cropName.localeCompare(b.cropName));
	});
	const hasBracketRows = $derived(bracketRows.length > 0);

	async function fetchBrackets() {
		loading = true;
		error = '';
		try {
			const result = await getJacobMedalBrackets({ months: selectedMonths });
			brackets = result.data ?? null;
			error = result.error ?? (result.data ? '' : 'No bracket data is available for this range yet.');
		} catch {
			brackets = null;
			error = 'Failed to fetch bracket data. Please try again later.';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		// Re-fetch when months changes
		void selectedMonths;
		fetchBrackets();
	});

	function formatCollection(amount: number): string {
		if (amount < 1_000) return amount.toString();
		if (amount < 1_000_000) return `${(amount / 1_000).toFixed(1)}K`;
		if (amount < 1_000_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
		return `${(amount / 1_000_000_000).toFixed(3)}B`;
	}

	const pageCtx = getPageCtx();
	$effect.pre(() => {
		pageCtx.setBreadcrumbs([{ name: 'Tools', href: '/tools' }, { name: 'Jacob Fortune' }]);
	});
</script>

<Head
	title="Jacob Fortune Requirements | Elite"
	description="See the farming fortune required to earn each medal in Jacob Contests."
/>

<div class="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 py-8">
	<div class="flex flex-col items-center gap-2 text-center">
		<h1 class="text-3xl font-bold">Jacob Contest Fortune</h1>
		<p class="text-muted-foreground max-w-lg text-sm">
			Estimated farming fortune required to earn each medal, averaged from recent contest data.
		</p>
		<Button variant="outline" size="sm" class="mt-1" onclick={() => (showWalkthrough = true)}>
			<BookOpen class="mr-1 h-4 w-4" />
			How to use
		</Button>
	</div>

	<!-- Controls -->
	<section id="jacob-controls" class="bg-card flex w-full flex-col gap-4 rounded-lg border p-4">
		<div class="flex flex-wrap items-end gap-6">
			<div class="flex flex-col gap-2">
				<Label>BPS Efficiency</Label>
				<div class="flex items-center gap-3">
					<SliderSimple bind:value={bps} min={10} max={20} step={0.5} class="w-40" />
					<span class="text-muted-foreground w-28 text-sm">
						{bps} BPS ({(ratio * 100).toFixed(1)}%)
					</span>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<Switch bind:checked={useMooshroom} />
				<Label>Include Mooshroom Mushrooms</Label>
			</div>
		</div>

		<div class="flex flex-wrap gap-2">
			{#each MONTHS_OPTIONS as opt, i (opt.value)}
				<Button variant={i === monthsIndex ? 'default' : 'outline'} size="sm" onclick={() => (monthsIndex = i)}>
					{opt.label}
				</Button>
			{/each}
		</div>

		<p class="text-muted-foreground text-xs">
			Averaging contest data from <strong>{lookbackStartLabel}</strong> through the current SkyBlock month.
		</p>
	</section>

	<!-- Results -->
	<div id="jacob-results">
		{#if loading}
			<div class="flex items-center gap-2 py-12">
				<Loader2 class="h-6 w-6 animate-spin" />
				<span class="text-muted-foreground text-sm">Loading bracket data...</span>
			</div>
		{:else if error}
			<p class="text-destructive py-8 text-sm">{error}</p>
		{:else if !hasBracketRows}
			<p class="text-muted-foreground py-8 text-sm">
				No bracket data was returned for this range. Try another month range in a moment.
			</p>
		{:else}
			<Tabs.Root value="diamond" class="w-full">
				<Tabs.List class="w-full justify-start overflow-x-auto">
					{#each MEDAL_BRACKETS as medal (medal.key)}
						<Tabs.Trigger value={medal.key} class="flex items-center gap-2">
							<img src="/images/medals/{medal.key}.webp" alt={medal.label} class="pixelated h-5 w-5" />
							<span>{medal.label}</span>
						</Tabs.Trigger>
					{/each}
				</Tabs.List>

				{#each MEDAL_BRACKETS as medal (medal.key)}
					<Tabs.Content value={medal.key}>
						<div class="bg-card mt-2 overflow-hidden rounded-lg border">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head class="w-12"></Table.Head>
										<Table.Head>Crop</Table.Head>
										<Table.Head class="text-right">Avg Collection</Table.Head>
										<Table.Head class="text-right">Fortune Required</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each bracketRows as row (row.cropName)}
										{@const entry = row?.entries.find((e) => e.key === medal.key)}
										{#if row && entry}
											<Table.Row>
												<Table.Cell class="w-12 p-2">
													{#if row.img}
														<img
															src={row.img}
															alt={row.cropName}
															class="pixelated h-8 w-8"
														/>
													{/if}
												</Table.Cell>
												<Table.Cell class="font-medium">{row.cropName}</Table.Cell>
												<Table.Cell class="text-right font-mono">
													{formatCollection(entry.collection)}
												</Table.Cell>
												<Table.Cell class="text-right font-mono">
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
							<p class="text-muted-foreground mt-2 text-xs">
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
	<section id="jacob-faq" class="w-full">
		<h2 class="mb-3 text-lg font-semibold">Frequently Asked Questions</h2>
		<Accordion.Root type="multiple">
			<Accordion.Item value="what-is">
				<Accordion.Trigger>What does this tool show?</Accordion.Trigger>
				<Accordion.Content>
					It shows the estimated farming fortune you need to earn each Jacob Contest medal tier for every
					crop, based on real contest data averaged over your selected timeframe.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="bps">
				<Accordion.Trigger>What is BPS?</Accordion.Trigger>
				<Accordion.Content>
					BPS stands for Blocks Per Second. The maximum is 20 BPS. Lower values simulate slower farming
					speeds, which means you need more fortune to reach the same medal bracket.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="mooshroom">
				<Accordion.Trigger>What does the Mooshroom toggle do?</Accordion.Trigger>
				<Accordion.Content>
					When enabled, the fortune calculation accounts for bonus mushroom collection from the Mooshroom Cow
					pet. This lowers the fortune required for crops that drop mushrooms.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="months">
				<Accordion.Trigger>How does the month range affect results?</Accordion.Trigger>
				<Accordion.Content>
					The tool averages contest bracket data over the selected timeframe. A longer lookback gives more
					stable averages, while a shorter one reflects more recent competition levels.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="zero-fortune">
				<Accordion.Trigger>Why does some fortune show as 0?</Accordion.Trigger>
				<Accordion.Content>
					A fortune of 0 means you can earn that medal just by farming for the full contest duration without
					any farming fortune bonus. This is common for lower medal tiers.
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</section>
</div>

<Walkthrough steps={walkthroughSteps} bind:open={showWalkthrough} onComplete={completeWalkthrough} />
