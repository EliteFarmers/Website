<script lang="ts">
	import { browser } from '$app/environment';
	import Head from '$comp/head.svelte';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import CoinsBreakdown from '$comp/rates/coins-breakdown.svelte';
	import CropSelector from '$comp/stats/contests/crop-selector.svelte';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import { calculateBestBazaarProfit } from '$lib/calc/fortune-compare';
	import { collectBazaarItemIds } from '$lib/calc/fortune-sandbox-helpers';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import { getItems } from '$lib/remote/items.remote';
	import { DEFAULT_SELECTED_CROPS, getSelectedCrops } from '$lib/stores/selectedCrops';
	import * as Accordion from '$ui/accordion';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import { SliderSimple } from '$ui/slider';
	import { Switch } from '$ui/switch';
	import * as Table from '$ui/table';
	import { Walkthrough } from '$ui/walkthrough';
	import type { Step } from '$ui/walkthrough/ctx';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import {
		calculateAverageSpecialCrops,
		calculateDetailedAverageDrops,
		Crop,
		CROP_INFO,
		FarmingPet,
		getCropDisplayName,
		getCropFromName,
		getPossibleResultsFromCrops,
		MAX_CROP_FORTUNE,
		type DetailedDropsResult,
	} from 'farming-weight';

	const TIME_OPTIONS = [
		{ value: 24_000, label: 'Jacob Contest' },
		{ value: 72_000, label: '1 Hour' },
		{ value: 288_000, label: '4 Hours' },
		{ value: 864_000, label: '12 Hours' },
		{ value: 1_728_000, label: '24 Hours' },
	];

	const PET_OPTIONS = [
		{ value: 'rose_dragon', label: 'Rose Dragon' },
		{ value: 'mooshroom', label: 'Mooshroom Cow' },
		{ value: 'elephant', label: 'Elephant' },
	];

	const REFORGE_OPTIONS = [
		{ value: 'bountiful', label: 'Bountiful' },
		{ value: 'blessed', label: 'Blessed' },
	];
	const BAZAAR_MODE_OPTIONS: { value: 'order' | 'insta'; label: string }[] = [
		{ value: 'order', label: 'Sell Order' },
		{ value: 'insta', label: 'Insta-Sell' },
	];

	const ALL_CROPS = Object.values(Crop).filter((c) => c !== Crop.Seeds);

	// Rose Dragon vs others fortune difference
	const ElephantFortuneDiff = 396.7 - 210;
	const MooshroomFortuneDiff = 396.7 - 217;

	let fortuneInput = $state<number | undefined>(undefined);
	let timeBlocks = $state(72_000);
	let reforge = $state('bountiful');
	let pet = $state('rose_dragon');
	let bps = $state(20);
	let useMaxTool = $state(true);
	let useRarefinder = $state(true);
	let useMechamind = $state(true);
	let useCropeetle = $state(true);
	let useWartyBug = $state(false);
	let bzMode = $state<'order' | 'insta'>('order');

	let bazaarData = $state<RatesItemPriceData | undefined>(undefined);
	let bazaarLoading = $state(false);

	const selectedCrops = getSelectedCrops();
	const selectedCrop = $derived.by(() => {
		const name = Object.entries($selectedCrops).find(([, v]) => v)?.[0] ?? null;
		return name ? (getCropFromName(name) ?? null) : null;
	});

	function selectCrop(crop: Crop) {
		selectedCrops.set({ ...DEFAULT_SELECTED_CROPS, [getCropDisplayName(crop)]: true });
	}

	function clearSelectedCrop() {
		selectedCrops.set({ ...DEFAULT_SELECTED_CROPS });
	}

	let showWalkthrough = $state(false);

	$effect(() => {
		if (browser && !localStorage.getItem('rates-calculator-walkthrough-seen')) {
			showWalkthrough = true;
		}
	});

	function completeWalkthrough() {
		localStorage.setItem('rates-calculator-walkthrough-seen', 'true');
	}

	const walkthroughSteps: Step[] = [
		{
			target: 'rates-controls',
			title: 'Configure Settings',
			description:
				'Set your farming fortune, duration, reforge, pet, BPS, and bazaar mode. Leave fortune blank for max fortune.',
			position: 'bottom',
		},
		{
			target: 'rates-results',
			title: 'Compare Crops',
			description: 'View NPC and Bazaar profits for every crop. Click any row to see a detailed breakdown.',
			position: 'top',
		},
		{
			target: 'rates-faq',
			title: 'FAQ',
			description: 'Common questions about rates and how the calculator works.',
			position: 'top',
		},
	];

	const blocksBroken = $derived(Math.round(timeBlocks * (bps / 20)));
	const timeName = $derived(TIME_OPTIONS.find((t) => t.value === timeBlocks)?.label ?? '1 Hour');
	const petName = $derived(PET_OPTIONS.find((p) => p.value === pet)?.label ?? 'Rose Dragon');
	const reforgeName = $derived(reforge === 'bountiful' ? 'Bountiful' : 'Blessed');
	const isCustomFortune = $derived(fortuneInput !== undefined && fortuneInput > 0);

	const settingsSummary = $derived.by(() => {
		const chips = [useRarefinder && 'Rarefinder', useMechamind && 'Mechamind'].filter(Boolean) as string[];
		const shards = [useCropeetle && 'Cropeetle', useWartyBug && 'Warty Bug'].filter(Boolean) as string[];
		return [
			`${bps} BPS (${((bps / 20) * 100).toFixed(1)}%)`,
			reforgeName,
			petName,
			useMaxTool ? 'Level 50 Tool' : null,
			chips.length ? `Chips: ${chips.join(', ')}` : null,
			shards.length ? `Shards: ${shards.join(', ')}` : null,
		]
			.filter(Boolean)
			.join(' · ');
	});

	const petData = $derived.by(() => {
		if (pet === 'rose_dragon') {
			return new FarmingPet({
				type: 'ROSE_DRAGON',
				exp: 1708399946,
				active: true,
				tier: 'LEGENDARY',
				heldItem: 'GREEN_BANDANA',
			});
		}
		return undefined;
	});

	const allResults = $derived.by(() => {
		const options: Parameters<typeof calculateDetailedAverageDrops>[0] = {
			farmingFortune: isCustomFortune ? fortuneInput : undefined,
			blocksBroken,
			bountiful: reforge === 'bountiful',
			mooshroom: pet === 'mooshroom',
			maxTool: useMaxTool,
			pet: petData,
			chips: {
				RAREFINDER: useRarefinder ? 20 : 0,
				MECHAMIND: useMechamind ? 20 : 0,
			},
			attributes: {
				CROPEETLE: useCropeetle ? 64 : 0,
				WART_EATER: useWartyBug ? 24 : 0,
			},
		};

		// Adjust fortune for non-rose-dragon pets when using max fortune
		if (!isCustomFortune && pet !== 'rose_dragon') {
			const diff = pet === 'mooshroom' ? MooshroomFortuneDiff : ElephantFortuneDiff;
			options.cropFortune = Object.fromEntries(
				Object.entries(MAX_CROP_FORTUNE).map(([crop, max]) => [crop, max - diff])
			) as typeof MAX_CROP_FORTUNE;
		}

		const results = calculateDetailedAverageDrops(options) as Partial<
			ReturnType<typeof calculateDetailedAverageDrops>
		>;
		delete results[Crop.Seeds];
		return results;
	});

	const formattedCrops = $derived.by(() => {
		return ALL_CROPS.map((crop) => {
			const details = allResults[crop] as DetailedDropsResult | undefined;
			if (!details) return null;

			const npcProfit = details.npcCoins ?? 0;
			const displayName = getCropDisplayName(crop);
			const img = PROPER_CROP_TO_IMG[displayName];

			// Best bazaar profit
			let bestBzProfit = npcProfit;
			if (bazaarData) {
				const bz = calculateBestBazaarProfit(details, crop, bazaarData, bzMode);
				if (bz !== null) bestBzProfit = bz;
			}

			return {
				crop,
				displayName,
				img,
				fortune: details.fortune,
				collection: details.collection,
				npcProfit,
				bazaarProfit: bestBzProfit,
				coinSources: Object.entries(details.coinSources).sort(([, a], [, b]) => b - a),
				otherCollection: Object.entries(details.otherCollection).sort(([, a], [, b]) => b - a),
				items: details.items,
			};
		})
			.filter((row): row is NonNullable<typeof row> => row !== null)
			.sort((a, b) => b.bazaarProfit - a.bazaarProfit);
	});

	function getSellPrice(
		bzData: { averageSellOrder?: number; averageSell?: number } | undefined,
		mode: 'order' | 'insta'
	) {
		if (!bzData) return 0;
		return mode === 'insta' ? (bzData.averageSell ?? 0) : (bzData.averageSellOrder ?? 0);
	}

	const selectedCropDetail = $derived.by(() => {
		if (!selectedCrop) return null;
		const row = formattedCrops.find((r) => r.crop === selectedCrop);
		if (!row) return null;
		const details = allResults[selectedCrop] as DetailedDropsResult | undefined;
		if (!details) return null;

		const cropAmount = details.items[selectedCrop] ?? details.collection;
		const otherCoinsNpc = details.npcCoins - cropAmount * details.npcPrice;

		const sellToBazaar: { itemId: string; name: string; items: number; npc: number; per: number; gain: number }[] =
			[];
		let sellToBazaarCoins = 0;
		let sellToBazaarDelta = 0;

		for (const [itemId, items] of [
			...Object.entries(details.items ?? {}),
			...Object.entries(details.rngItems ?? {}),
		]) {
			if (itemId === selectedCrop) continue;
			if (!items || items <= 0) continue;
			const bzData = bazaarData?.[itemId]?.bazaar;
			if (!bzData) continue;
			const npc = bzData.npc ?? 0;
			const per = getSellPrice(bzData, bzMode);
			if (per <= npc || per <= 0) continue;
			const gain = items * (per - npc);
			sellToBazaarDelta += gain;
			sellToBazaarCoins += items * per;
			sellToBazaar.push({
				itemId,
				name: bazaarData?.[itemId]?.bazaar?.name ?? bazaarData?.[itemId]?.item?.name ?? itemId,
				items,
				npc,
				per,
				gain,
			});
		}
		sellToBazaar.sort((a, b) => b.gain - a.gain);

		const otherCoinsTotal = otherCoinsNpc + sellToBazaarDelta;
		const sellToBazaarCoinsFloor = Math.floor(sellToBazaarCoins);
		const otherCoinsNpcRemaining = Math.floor(Math.max(0, otherCoinsTotal - sellToBazaarCoins));

		const crafts = getPossibleResultsFromCrops(selectedCrop, cropAmount);
		const bzOptions = Object.entries(crafts)
			.filter(([itemId]) => itemId !== selectedCrop)
			.map(([itemId, craft]) => {
				const bzData = bazaarData?.[itemId]?.bazaar;
				if (!bzData) return null;
				const per = getSellPrice(bzData, bzMode);
				const profit = craft.fractionalItems * per - craft.fractionalCost;
				return {
					name: bazaarData?.[itemId]?.bazaar?.name ?? bazaarData?.[itemId]?.item?.name ?? itemId,
					items: craft.fractionalItems,
					cost: craft.fractionalCost,
					per,
					profit: Math.floor(profit),
					total: Math.floor(profit + otherCoinsTotal),
				};
			})
			.filter((x): x is NonNullable<typeof x> => x !== null)
			.sort((a, b) => b.total - a.total);

		const threeFourths = calculateAverageSpecialCrops(blocksBroken, selectedCrop, 3);
		const fromSpecial = details.coinSources[threeFourths.type] ?? 0;
		const specialDifference = fromSpecial - threeFourths.npc;
		const threeFourthsTotal = Math.floor(details.npcCoins - specialDifference);

		return {
			...row,
			bzOptions,
			sellToBazaar,
			otherCoinsTotal: Math.floor(otherCoinsTotal),
			otherCoinsNpcRemaining,
			sellToBazaarCoins: sellToBazaarCoinsFloor,
			threeFourths: {
				total: threeFourthsTotal,
				specialDifference: Math.floor(specialDifference),
				amount: Math.round(threeFourths.amount),
				type: threeFourths.type,
			},
		};
	});

	// Fetch bazaar data when results change
	$effect(() => {
		if (!browser) return;
		const items = collectBazaarItemIds(Object.values(allResults).filter(Boolean));
		const craftIds = ALL_CROPS.flatMap((crop) => CROP_INFO[crop]?.crafts?.map((c) => c.item) ?? []);
		const allIds = [...new Set([...items, ...craftIds])];
		if (!allIds.length) {
			bazaarData = undefined;
			return;
		}

		bazaarLoading = true;
		getItems(allIds)
			.then((data) => {
				bazaarData = data ?? undefined;
			})
			.catch(() => {
				bazaarData = undefined;
			})
			.finally(() => {
				bazaarLoading = false;
			});
	});

	const pageCtx = getPageCtx();
	$effect.pre(() => {
		pageCtx.setBreadcrumbs([{ name: 'Tools', href: '/tools' }, { name: 'Rates Calculator' }]);
	});
</script>

<Head
	title="Farming Rates Calculator | Elite"
	description="Calculate NPC and Bazaar profit rates for any amount of farming fortune."
/>

<div class="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 py-8">
	<div class="flex flex-col items-center gap-2 text-center">
		<h1 class="text-3xl font-bold">Rates Calculator</h1>
		<p class="text-muted-foreground max-w-lg text-sm">
			Expected rates for
			{#if isCustomFortune}
				<strong>{fortuneInput?.toLocaleString()}</strong>
			{:else}
				<strong>MAX</strong>
			{/if}
			farming fortune in <strong>{timeName}</strong>.
		</p>
		<p class="text-muted-foreground text-xs">{settingsSummary} · 4/4 Helianthus</p>
		<Button variant="outline" size="sm" class="mt-1" onclick={() => (showWalkthrough = true)}>
			<BookOpen class="mr-1 h-4 w-4" />
			How to use
		</Button>
	</div>

	<!-- Controls -->
	<section id="rates-controls" class="bg-card flex w-full flex-col gap-4 rounded-lg border p-4">
		<div class="flex flex-wrap items-end gap-x-6 gap-y-4">
			<div class="flex flex-col gap-1.5">
				<Label>Fortune (blank = MAX)</Label>
				<input
					type="number"
					class="bg-background border-input h-9 w-32 rounded-md border px-3 text-sm"
					placeholder="MAX"
					min={0}
					max={5000}
					oninput={(e) => {
						const v = (e.target as HTMLInputElement).valueAsNumber;
						fortuneInput = Number.isNaN(v) ? undefined : v;
					}}
				/>
			</div>
			<div class="flex flex-col gap-1.5">
				<Label>Duration</Label>
				<Select.Simple class="w-36" options={TIME_OPTIONS} bind:value={timeBlocks} />
			</div>
			<div class="flex flex-col gap-1.5">
				<Label>Reforge</Label>
				<Select.Simple class="w-32" options={REFORGE_OPTIONS} bind:value={reforge} />
			</div>
			<div class="flex flex-col gap-1.5">
				<Label>Pet</Label>
				<Select.Simple class="w-40" options={PET_OPTIONS} bind:value={pet} />
			</div>
		</div>
		<div class="flex flex-wrap items-end gap-x-6 gap-y-4">
			<div class="flex flex-col gap-1.5">
				<Label>BPS Efficiency</Label>
				<div class="flex items-center gap-3">
					<SliderSimple bind:value={bps} min={10} max={20} step={0.5} class="w-40" />
					<span class="text-muted-foreground w-28 text-sm">{bps} BPS ({((bps / 20) * 100).toFixed(1)}%)</span>
				</div>
			</div>
			<div class="flex flex-col gap-1.5">
				<Label>Bazaar Mode</Label>
				<Select.Simple class="w-36" options={BAZAAR_MODE_OPTIONS} bind:value={bzMode} />
			</div>
		</div>
		<div class="flex flex-wrap gap-x-6 gap-y-3">
			<div class="flex items-center gap-2">
				<Switch bind:checked={useMaxTool} id="sw-max-tool" />
				<Label for="sw-max-tool">Level 50 Tool</Label>
			</div>
			<div class="flex items-center gap-2">
				<Switch bind:checked={useRarefinder} id="sw-rarefinder" />
				<Label for="sw-rarefinder">Max Rarefinder Chip</Label>
			</div>
			<div class="flex items-center gap-2">
				<Switch bind:checked={useMechamind} id="sw-mechamind" />
				<Label for="sw-mechamind">Max Mechamind Chip</Label>
			</div>
			<div class="flex items-center gap-2">
				<Switch bind:checked={useCropeetle} id="sw-cropeetle" />
				<Label for="sw-cropeetle">Max Cropeetle Shard</Label>
			</div>
			<div class="flex items-center gap-2">
				<Switch bind:checked={useWartyBug} id="sw-wartybug" />
				<Label for="sw-wartybug">Max Warty Bug Shard</Label>
			</div>
		</div>

		{#if isCustomFortune}
			<p class="text-muted-foreground text-xs">
				<strong>Note:</strong> Fortune varies by crop. For best results, only compare the crop your entered fortune
				is for.
			</p>
		{/if}
	</section>

	<!-- Crop selector -->
	<CropSelector radio={true} />

	<!-- Results -->
	<div id="rates-results" class="w-full">
		{#if !selectedCrop}
			<div class="bg-card w-full overflow-hidden rounded-lg border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-12"></Table.Head>
							<Table.Head>Crop</Table.Head>
							<Table.Head class="text-right">NPC Profit</Table.Head>
							<Table.Head class="text-right">
								Bazaar Profit
								{#if bazaarLoading}
									<Loader2 class="ml-1 inline h-3 w-3 animate-spin" />
								{/if}
							</Table.Head>
							<Table.Head class="text-right">Fortune</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each formattedCrops as row (row.crop)}
							<Table.Row
								class="hover:bg-accent/50 cursor-pointer transition-colors"
								onclick={() => selectCrop(row.crop)}
							>
								<Table.Cell class="w-12 p-2">
									{#if row.img}
										<img src={row.img} alt={row.displayName} class="pixelated h-8 w-8" />
									{/if}
								</Table.Cell>
								<Table.Cell class="font-medium">{row.displayName}</Table.Cell>
								<Table.Cell class="text-right font-mono">
									{row.npcProfit.toLocaleString()}
								</Table.Cell>
								<Table.Cell class="text-right font-mono">
									{row.bazaarProfit.toLocaleString()}
								</Table.Cell>
								<Table.Cell class="text-muted-foreground text-right font-mono">
									{row.fortune.toLocaleString()}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{:else if selectedCropDetail}
			{@const d = selectedCropDetail}
			<div class="flex w-full flex-col gap-5">
				<button
					class="text-muted-foreground hover:text-foreground flex items-center gap-1 self-start text-sm transition-colors"
					onclick={clearSelectedCrop}
				>
					← Back to all crops
				</button>

				<!-- Header -->
				<div class="flex flex-wrap items-center gap-4">
					{#if d.img}
						<img src={d.img} alt={d.displayName} class="pixelated h-16 w-16" />
					{/if}
					<div>
						<h2 class="text-4xl font-bold">{d.displayName}</h2>
						<p class="text-muted-foreground text-sm">
							{timeName} · {isCustomFortune ? fortuneInput?.toLocaleString() + ' fortune' : 'MAX fortune'}
						</p>
						<p class="text-muted-foreground text-xs">{settingsSummary} · 4/4 Helianthus</p>
					</div>
				</div>

				<!-- Summary stat cards -->
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
					<div class="bg-card flex flex-col gap-2 rounded-lg border p-4">
						<span class="text-muted-foreground text-xs font-medium tracking-wide uppercase">NPC Profit</span
						>
						<CoinsBreakdown coins={d.npcProfit} />
					</div>
					<div class="bg-card flex flex-col gap-2 rounded-lg border p-4">
						<span class="text-muted-foreground text-xs font-medium tracking-wide uppercase"
							>Best Bazaar Profit</span
						>
						<CoinsBreakdown coins={d.bazaarProfit} />
					</div>
					<div class="bg-card flex flex-col gap-2 rounded-lg border p-4">
						<span class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Fortune</span>
						<FortuneBreakdown total={d.fortune} />
					</div>
				</div>

				<!-- Detailed sections -->
				<div class="flex flex-col gap-3">
					<!-- NPC Profit -->
					<div class="bg-card rounded-lg border">
						<Accordion.Root type="single" value="open">
							<Accordion.Item value="open" class="border-b-0">
								<Accordion.Trigger class="px-4">
									<span class="font-semibold">NPC Profit</span>
									<span class="ml-auto pr-2">
										<CoinsBreakdown coins={d.npcProfit} small={true} />
									</span>
								</Accordion.Trigger>
								<Accordion.Content class="px-4 pb-4">
									<Table.Root>
										<Table.Header>
											<Table.Row>
												<Table.Head>Source</Table.Head>
												<Table.Head class="text-right">Coins</Table.Head>
											</Table.Row>
										</Table.Header>
										<Table.Body>
											{#each d.coinSources as [source, amount] (source)}
												<Table.Row>
													<Table.Cell>{source}</Table.Cell>
													<Table.Cell class="text-right">
														<CoinsBreakdown coins={amount} small={true} />
													</Table.Cell>
												</Table.Row>
											{/each}
										</Table.Body>
									</Table.Root>
									{#if d.threeFourths.specialDifference !== 0}
										<div class="text-muted-foreground mt-3 rounded-md border p-3 text-sm">
											<p class="font-medium">3/4 Helianthus Armor</p>
											<CoinsBreakdown coins={d.threeFourths.total} small={true} />
											<p class="mt-1 text-xs">
												{Math.abs(d.threeFourths.specialDifference).toLocaleString()} fewer coins
												(~{d.threeFourths.amount.toLocaleString()}
												{d.threeFourths.type})
											</p>
										</div>
									{/if}
								</Accordion.Content>
							</Accordion.Item>
						</Accordion.Root>
					</div>

					<!-- Bazaar Profit -->
					<div class="bg-card rounded-lg border">
						<Accordion.Root type="single" value="open">
							<Accordion.Item value="open" class="border-b-0">
								<Accordion.Trigger class="px-4">
									<span class="font-semibold">Bazaar Profit</span>
									<span class="ml-auto pr-2">
										<CoinsBreakdown coins={d.bazaarProfit} small={true} />
									</span>
								</Accordion.Trigger>
								<Accordion.Content class="px-4 pb-4">
									{#if d.bzOptions.length > 0}
										<Table.Root>
											<Table.Header>
												<Table.Row>
													<Table.Head>Craft</Table.Head>
													<Table.Head class="text-right">Profit</Table.Head>
													<Table.Head class="text-right">Total</Table.Head>
												</Table.Row>
											</Table.Header>
											<Table.Body>
												{#each d.bzOptions as option, i (option.name)}
													<Table.Row>
														<Table.Cell>
															{#if i === 0}⭐{/if}
															{option.name}
															<span class="text-muted-foreground block text-xs">
																{Math.floor(option.items).toLocaleString()} × {option.per.toLocaleString()}
																= {option.profit.toLocaleString()} + other
															</span>
														</Table.Cell>
														<Table.Cell class="text-right">
															<CoinsBreakdown coins={option.profit} small={true} />
														</Table.Cell>
														<Table.Cell class="text-right">
															<CoinsBreakdown coins={option.total} small={true} />
														</Table.Cell>
													</Table.Row>
												{/each}
											</Table.Body>
										</Table.Root>
									{:else}
										<p class="text-muted-foreground text-sm">
											No bazaar crafts available for this crop.
										</p>
									{/if}
									{#if d.sellToBazaar.length > 0}
										<div class="mt-3">
											<p class="mb-1 text-sm font-medium">Sell these other drops to BZ</p>
											<Table.Root>
												<Table.Header>
													<Table.Row>
														<Table.Head>Item</Table.Head>
														<Table.Head class="text-right">BZ Coins</Table.Head>
														<Table.Head class="text-right">Gain vs NPC</Table.Head>
													</Table.Row>
												</Table.Header>
												<Table.Body>
													{#each d.sellToBazaar as item (item.itemId)}
														<Table.Row>
															<Table.Cell>
																{item.name}
																<span class="text-muted-foreground block text-xs">
																	{item.items % 1 === 0
																		? Math.floor(item.items).toLocaleString()
																		: item.items.toFixed(2)} items at {item.per.toLocaleString()}
																	instead of {item.npc.toLocaleString()} to NPC
																</span>
															</Table.Cell>
															<Table.Cell class="text-right">
																<CoinsBreakdown
																	coins={Math.floor(item.items * item.per)}
																	small={true}
																/>
															</Table.Cell>
															<Table.Cell class="text-right font-mono text-green-600">
																+{Math.floor(item.gain).toLocaleString()}
															</Table.Cell>
														</Table.Row>
													{/each}
												</Table.Body>
											</Table.Root>
										</div>
									{/if}
									<div
										class="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"
									>
										<span>
											Other items: <CoinsBreakdown coins={d.otherCoinsTotal} small={true} />
											<span class="ml-1">
												({d.otherCoinsNpcRemaining.toLocaleString()} to NPC, {d.sellToBazaarCoins.toLocaleString()}
												to BZ)
											</span>
										</span>
										<span>Prices: {bzMode === 'insta' ? 'insta-sell' : 'sell order'}</span>
									</div>
								</Accordion.Content>
							</Accordion.Item>
						</Accordion.Root>
					</div>

					<!-- Collection Gain -->
					<div class="bg-card rounded-lg border">
						<Accordion.Root type="single" value="open">
							<Accordion.Item value="open" class="border-b-0">
								<Accordion.Trigger class="px-4">
									<span class="font-semibold">Collection Gain</span>
									<span class="text-muted-foreground ml-auto pr-2 font-mono text-sm">
										{d.collection.toLocaleString()}
									</span>
								</Accordion.Trigger>
								<Accordion.Content class="px-4 pb-4">
									<Table.Root>
										<Table.Header>
											<Table.Row>
												<Table.Head>Source</Table.Head>
												<Table.Head class="text-right">Amount</Table.Head>
											</Table.Row>
										</Table.Header>
										<Table.Body>
											{#each d.otherCollection as [source, amount] (source)}
												<Table.Row>
													<Table.Cell>{source}</Table.Cell>
													<Table.Cell class="text-right font-mono"
														>{amount.toLocaleString()}</Table.Cell
													>
												</Table.Row>
											{/each}
										</Table.Body>
									</Table.Root>
								</Accordion.Content>
							</Accordion.Item>
						</Accordion.Root>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- FAQ -->
	<section id="rates-faq" class="w-full">
		<h2 class="mb-3 text-lg font-semibold">Frequently Asked Questions</h2>
		<Accordion.Root type="multiple">
			<Accordion.Item value="what-is">
				<Accordion.Trigger>What does this calculator do?</Accordion.Trigger>
				<Accordion.Content>
					It calculates expected crop collection and coin profits for a given amount of farming fortune,
					duration, and gear setup. Results include NPC sell prices and live Bazaar prices.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="fortune">
				<Accordion.Trigger>What does leaving fortune blank do?</Accordion.Trigger>
				<Accordion.Content>
					When fortune is blank, the calculator uses the theoretical maximum fortune for each crop. This
					includes maxed gear, enchantments, and equipment. Enter a custom value if you want to calculate for
					your own fortune.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="bps">
				<Accordion.Trigger>What is BPS?</Accordion.Trigger>
				<Accordion.Content>
					BPS stands for Blocks Per Second. The maximum is 20 BPS. Lower values simulate less efficient
					farming to give more realistic profit estimates.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="bazaar">
				<Accordion.Trigger>What's the difference between Sell Order and Insta-Sell?</Accordion.Trigger>
				<Accordion.Content>
					Sell Order uses the current buy order price (higher, but you have to wait for the order to fill).
					Insta-Sell uses the instant sell price (lower, but immediate coins). Bazaar prices update live.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="drill-down">
				<Accordion.Trigger>How do I see where the coins come from?</Accordion.Trigger>
				<Accordion.Content>
					Click any crop row in the results table to see a detailed breakdown of coin sources and collection
					sources for that crop.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="lower-rates">
				<Accordion.Trigger>Why am I getting less profit than this shows?</Accordion.Trigger>
				<Accordion.Content>
					This calculator uses the theoretical maximum fortune for each crop by default, including maxed gear,
					enchantments, equipment, and a level 100 Rose Dragon. Enter your own fortune in the settings to get
					a more accurate estimate for your setup. Keep in mind that fortune also varies by crop depending on
					your gear.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="pest-farming">
				<Accordion.Trigger>Can I use this for pest farming?</Accordion.Trigger>
				<Accordion.Content>
					This calculator does not account for pest farming mechanics, so the results won't reflect your
					actual pest-farming profits. However, you can still use the results to decide
					<strong>which crop to farm</strong> while pest farming — the crop with the highest rates is generally
					the best choice to maximise your coins and collection while handling pests.
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</section>
</div>

<Walkthrough steps={walkthroughSteps} bind:open={showWalkthrough} onComplete={completeWalkthrough} />
