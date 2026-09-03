<script lang="ts">
	import { browser } from '$app/environment';
	import Head from '$comp/head.svelte';
	import PlayerProfilePicker from '$comp/tools/player-profile-picker.svelte';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import { calculateBestBazaarProfit, getWhatIfFields } from '$lib/calc/fortune-compare';
	import {
		collectBazaarItemIds,
		createDefaultOptions,
		createDefaultTool,
		createRuntimeSide,
		extractImportedOptions,
		mapToolsByCrop,
		optionsSnapshot,
		runtimeSideToData,
		toEliteItemDto,
	} from '$lib/calc/fortune-sandbox-helpers';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import { getProfileMember } from '$lib/remote';
	import { getItems } from '$lib/remote/items.remote';
	import type { FortuneSandboxSideData } from '$lib/schemas/tool-settings/fortune-sandbox';
	import * as Accordion from '$ui/accordion';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import { NumberInput } from '$ui/number-input';
	import * as Select from '$ui/select';
	import { Walkthrough } from '$ui/walkthrough';
	import type { Step } from '$ui/walkthrough/ctx';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import UserCheck from '@lucide/svelte/icons/user-check';
	import {
		ArmorSet,
		calculateDetailedAverageDrops,
		createFarmingPlayer,
		Crop,
		FarmingPet,
		FarmingPets,
		getCropDisplayName,
		type DetailedDropsResult,
		type EliteItemDto,
		type PlayerOptions,
	} from 'farming-weight';
	import { Area, Axis, Chart, Highlight, Layer, Tooltip } from 'layerchart';

	const cropKeys = Object.values(Crop).filter((value): value is Crop => typeof value === 'string');
	const cropOptions = cropKeys.map((crop) => ({
		value: crop,
		label: getCropDisplayName(crop),
		img: PROPER_CROP_TO_IMG[getCropDisplayName(crop)],
	}));
	const metricOptions: {
		value: 'npcProfit' | 'bazaarProfit';
		label: string;
		description: string;
	}[] = [
		{
			value: 'npcProfit',
			label: 'NPC Profit',
			description: 'Uses NPC sell prices only, so the result is stable and easy to compare.',
		},
		{
			value: 'bazaarProfit',
			label: 'Bazaar Profit (Sell Order)',
			description: 'Uses sell-order value for profitable drops and refreshes bazaar data when needed.',
		},
	];

	let selectedCrop = $state<Crop>(Crop.Wheat);
	let metric = $state<'npcProfit' | 'bazaarProfit'>('npcProfit');
	let selectedFieldId = $state('');
	let rangeStart = $state(0);
	let rangeEnd = $state(100);
	let rangeStep = $state(1);
	let scanning = $state(false);
	let chartData = $state<{ x: number; y: number }[]>([]);
	let bazaarData = $state<RatesItemPriceData | undefined>(undefined);
	let bazaarLoading = $state(false);

	// Player import state
	let playerUuid = $state('');
	let profileUuid = $state('');
	let playerName = $state('');
	let profileName = $state('');
	let profiles = $state<{ id: string; name: string; selected: boolean }[]>([]);
	let importLoading = $state(false);
	let importError = $state('');
	let importedSideData = $state<FortuneSandboxSideData | undefined>(undefined);
	let importMessage = $state('');

	const WALKTHROUGH_KEY = 'what-if-walkthrough-seen';
	let walkthroughOpen = $state(typeof localStorage !== 'undefined' ? !localStorage.getItem(WALKTHROUGH_KEY) : false);
	function completeWalkthrough() {
		if (typeof localStorage !== 'undefined') localStorage.setItem(WALKTHROUGH_KEY, '1');
	}
	const walkthroughSteps: Step[] = [
		{
			target: 'whatif-import',
			title: 'Import Your Setup',
			description: 'Search for your IGN to load your farming gear. This becomes the baseline for the analysis.',
			position: 'bottom',
		},
		{
			target: 'whatif-scan-setup',
			title: 'Configure the Scan',
			description: 'Pick the crop, metric, and stat to sweep. Set a range and step size, then run the scan.',
			position: 'bottom',
		},
		{
			target: 'whatif-sidebar',
			title: 'Read the Results',
			description:
				'The chart shows profit at each value. Top results and a comparison to your baseline are listed below.',
			position: 'left',
		},
	];

	const sideData = $derived.by(() => {
		if (importedSideData) return importedSideData;
		const side = createRuntimeSide();
		return runtimeSideToData(side, selectedCrop);
	});
	const whatIfFields = $derived(getWhatIfFields(sideData, selectedCrop));
	const fieldOptions = $derived(whatIfFields.map((field) => ({ value: field.id, label: field.label })));
	const currentField = $derived(whatIfFields.find((field) => field.id === selectedFieldId));
	const currentMetricOption = $derived.by(
		() => metricOptions.find((option) => option.value === metric) ?? metricOptions[0]
	);
	const baselineRuntime = $derived.by(() => createRuntimeSide(sideData));
	const baselineTool = $derived.by(
		() =>
			baselineRuntime.toolsByCrop[String(selectedCrop)] ??
			createDefaultTool(selectedCrop, baselineRuntime.options)
	);
	const baselineProfit = $derived.by(() => computeProfit(sideData, selectedCrop));
	const baselineFieldValue = $derived.by(() => (currentField ? currentField.getValue(sideData) : null));
	const estimatedPointCount = $derived.by(() => estimatePointCount(rangeStart, rangeEnd, rangeStep));
	const bestPoint = $derived.by(() =>
		chartData.length > 0
			? chartData.reduce((best, point) => (point.y > best.y ? point : best), chartData[0]!)
			: null
	);
	const worstPoint = $derived.by(() =>
		chartData.length > 0
			? chartData.reduce((worst, point) => (point.y < worst.y ? point : worst), chartData[0]!)
			: null
	);
	const profitSwing = $derived.by(() => (bestPoint && worstPoint ? bestPoint.y - worstPoint.y : null));
	const topPoints = $derived.by(() => [...chartData].sort((a, b) => b.y - a.y).slice(0, 5));

	$effect(() => {
		const fields = whatIfFields;
		if (fields.length > 0 && !fields.some((field) => field.id === selectedFieldId)) {
			selectedFieldId = fields[0].id;
		}
	});

	$effect(() => {
		if (currentField) {
			rangeStart = currentField.range.start;
			rangeEnd = currentField.range.end;
			rangeStep = currentField.range.step;
			chartData = [];
		}
	});

	function getUniqueTools(toolsByCrop: ReturnType<typeof createRuntimeSide>['toolsByCrop']) {
		const uniqueTools: Record<string, (typeof toolsByCrop)[string]> = {};

		for (const tool of Object.values(toolsByCrop)) {
			const key = tool.item.uuid ?? `${tool.type}-${tool.level}`;
			uniqueTools[key] = tool;
		}

		return Object.values(uniqueTools);
	}

	function computeProfit(data: FortuneSandboxSideData, crop: Crop): number {
		const runtime = createRuntimeSide(data);
		const tool = runtime.toolsByCrop[String(crop)] ?? createDefaultTool(crop, runtime.options);
		const snapshot = optionsSnapshot(runtime.options);
		const options = {
			...snapshot,
			tools: getUniqueTools(runtime.toolsByCrop),
			armor: new ArmorSet([...runtime.armor], [...runtime.equipment], snapshot),
			equipment: [...runtime.equipment],
			pets: [runtime.pet],
			selectedPet: runtime.pet,
			selectedTool: tool,
			selectedCrop: crop,
		} as PlayerOptions;
		const player = createFarmingPlayer(options);
		const cropFortune = player.getCropFortune(crop);
		const calcOptions = {
			farmingFortune: cropFortune.fortune,
			bountiful: tool.reforge?.name === 'Bountiful',
			mooshroom: runtime.pet.type === FarmingPets.MooshroomCow,
			blocksBroken: 20 * 93.6,
			armorPieces: player.armorSet.specialDropsCount(crop),
			infestedPlotProbability: runtime.options.infestedPlotProbability,
			attributes: runtime.options.attributes,
			maxTool: tool.level === 50,
			chips: runtime.options.chips,
			pet: runtime.pet,
		} as Parameters<typeof calculateDetailedAverageDrops>[0];
		const result = calculateDetailedAverageDrops(calcOptions)[crop] as DetailedDropsResult | undefined;
		if (!result) return 0;

		if (metric === 'bazaarProfit' && bazaarData) {
			return calculateBestBazaarProfit(result, crop, bazaarData, 'order') ?? result.npcCoins;
		}

		return result.npcCoins;
	}

	async function fetchBazaarIfNeeded() {
		if (metric !== 'bazaarProfit' || bazaarData) return;

		bazaarLoading = true;
		try {
			const runtime = createRuntimeSide(sideData);
			const tool = runtime.toolsByCrop[String(selectedCrop)] ?? createDefaultTool(selectedCrop, runtime.options);
			const snapshot = optionsSnapshot(runtime.options);
			const options = {
				...snapshot,
				tools: Object.values(runtime.toolsByCrop),
				armor: new ArmorSet([...runtime.armor], [...runtime.equipment], snapshot),
				equipment: [...runtime.equipment],
				pets: [runtime.pet],
				selectedPet: runtime.pet,
				selectedTool: tool,
				selectedCrop: selectedCrop,
			} as PlayerOptions;
			const player = createFarmingPlayer(options);
			const cropFortune = player.getCropFortune(selectedCrop);
			const calcResult = calculateDetailedAverageDrops({
				farmingFortune: cropFortune.fortune,
				bountiful: tool.reforge?.name === 'Bountiful',
				mooshroom: runtime.pet.type === FarmingPets.MooshroomCow,
				blocksBroken: 20 * 93.6,
				armorPieces: player.armorSet.specialDropsCount(selectedCrop),
				infestedPlotProbability: 0,
				attributes: {},
				maxTool: true,
				chips: {},
				pet: runtime.pet,
			} as Parameters<typeof calculateDetailedAverageDrops>[0])[selectedCrop] as DetailedDropsResult | undefined;

			const ids = collectBazaarItemIds([calcResult ?? null]);
			if (ids.length > 0) {
				const data = await getItems(ids.sort());
				bazaarData = data ?? undefined;
			}
		} catch {
			bazaarData = undefined;
		} finally {
			bazaarLoading = false;
		}
	}

	async function onPlayerLoaded() {
		if (!playerUuid || !profileUuid) return;
		importLoading = true;
		importMessage = '';
		importError = '';
		try {
			const member = await getProfileMember({ playerUuid, profileUuid });
			if (!member) {
				importError = 'Could not load profile data.';
				return;
			}

			const inventory = member.farmingWeight?.inventory;
			const farmingPets = FarmingPet.fromArray(member.pets ?? []);
			const bestPet = [...farmingPets].sort((a, b) => b.fortune - a.fortune)[0];
			const importedOptions = extractImportedOptions(member);
			const opts = { ...createDefaultOptions(), ...importedOptions } as PlayerOptions;
			const importedTools = (inventory?.tools ?? []).map((item) => toEliteItemDto(item));
			const importedArmor = (inventory?.armor ?? []).map((item) => toEliteItemDto(item));
			const importedEquipment = (inventory?.equipment ?? []).map((item) => toEliteItemDto(item));
			const importedToolsByCrop = mapToolsByCrop(importedTools, opts);

			const side = createRuntimeSide({
				options: importedOptions as FortuneSandboxSideData['options'],
				pet: bestPet?.pet,
				toolsByCrop: importedToolsByCrop as Record<string, EliteItemDto>,
				armor: importedArmor,
				equipment: importedEquipment,
			} as Partial<FortuneSandboxSideData>);

			importedSideData = runtimeSideToData(side, selectedCrop);
			importMessage = `Loaded ${playerName}${profileName ? ` (${profileName})` : ''}`;
			chartData = [];
			bazaarData = undefined;
		} catch {
			importError = 'Failed to load player data.';
		} finally {
			importLoading = false;
		}
	}

	async function runScan() {
		if (!currentField) return;

		scanning = true;
		chartData = [];

		if (metric === 'bazaarProfit') await fetchBazaarIfNeeded();

		await new Promise<void>((resolve) => {
			if (browser) requestAnimationFrame(() => resolve());
			else resolve();
		});

		const points: { x: number; y: number }[] = [];
		const direction = rangeStart <= rangeEnd ? 1 : -1;
		const step = Math.abs(rangeStep);
		if (step <= 0 || !Number.isFinite(step)) {
			scanning = false;
			return;
		}

		let current = rangeStart;
		const epsilon = 1e-9;
		while (direction === 1 ? current <= rangeEnd + epsilon : current >= rangeEnd - epsilon) {
			const cloned = JSON.parse(JSON.stringify(sideData)) as FortuneSandboxSideData;
			currentField.setValue(cloned, current);
			const profit = computeProfit(cloned, selectedCrop);
			points.push({ x: Math.round(current * 100) / 100, y: profit });
			current += direction * step;
		}

		chartData = points;
		scanning = false;
	}

	function formatCompact(num: number): string {
		if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
		if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
		return num.toFixed(0);
	}

	function formatFieldValue(value: number): string {
		if (!Number.isFinite(value)) return '0';
		return value.toLocaleString(undefined, {
			maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
		});
	}

	function formatSignedCompact(value: number): string {
		const sign = value >= 0 ? '+' : '-';
		return `${sign}${formatCompact(Math.abs(value))}`;
	}

	function estimatePointCount(start: number, end: number, step: number): number {
		const normalizedStep = Math.abs(step);
		if (
			!Number.isFinite(start) ||
			!Number.isFinite(end) ||
			!Number.isFinite(normalizedStep) ||
			normalizedStep <= 0
		) {
			return 0;
		}

		return Math.floor(Math.abs(end - start) / normalizedStep) + 1;
	}

	const pageCtx = getPageCtx();
	$effect.pre(() => {
		pageCtx.setBreadcrumbs([{ name: 'Tools', href: '/tools' }, { name: 'What-If Calculator' }]);
	});
</script>

<Head title="What-If Calculator | Elite" description="See how changing a stat affects your farming profit." />

<Walkthrough bind:open={walkthroughOpen} steps={walkthroughSteps} padding={4} onComplete={completeWalkthrough} />

<div class="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 py-8">
	<div class="flex flex-col items-center gap-2 text-center">
		<h1 class="text-3xl font-bold">What-If Calculator</h1>
		<p class="text-muted-foreground max-w-2xl text-sm">
			Import your setup, pick one stat to sweep, and see exactly how it changes your profit.
		</p>
		<Button variant="ghost" size="sm" class="gap-1.5" onclick={() => (walkthroughOpen = true)}>
			<BookOpen class="h-4 w-4" />
			How to use
		</Button>
	</div>

	<!-- Player Import -->
	<div id="whatif-import" class="bg-card w-full rounded-lg border p-4">
		<div class="mb-3 flex flex-col gap-1">
			<h2 class="text-base font-semibold">Import Your Setup</h2>
			<p class="text-muted-foreground text-sm">
				Load your farming gear to use as the baseline. Without an import, a default setup is used.
			</p>
		</div>
		<PlayerProfilePicker
			bind:playerUuid
			bind:profileUuid
			bind:playerName
			bind:profileName
			bind:profiles
			bind:loading={importLoading}
			bind:error={importError}
			onLoaded={onPlayerLoaded}
		/>
		{#if importMessage}
			<p class="text-muted-foreground mt-2 flex items-center gap-1.5 text-sm">
				<UserCheck class="h-4 w-4" />
				{importMessage}
			</p>
		{/if}
	</div>

	<div class="grid w-full gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
		<div id="whatif-scan-setup" class="bg-card w-full rounded-lg border p-6">
			<div class="mb-4 flex flex-col gap-1">
				<h2 class="text-lg font-semibold">Scan Setup</h2>
				<p class="text-muted-foreground text-sm">
					Choose the crop, metric, and stat you want to sweep. Only that one stat changes between points.
				</p>
			</div>

			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div class="flex flex-col gap-1.5">
					<Label class="text-xs font-medium">Crop</Label>
					<Select.Root type="single" bind:value={selectedCrop}>
						<Select.Trigger class="h-9">
							<span class="flex items-center gap-2">
								{#if PROPER_CROP_TO_IMG[getCropDisplayName(selectedCrop)]}
									<img
										src={PROPER_CROP_TO_IMG[getCropDisplayName(selectedCrop)]}
										alt=""
										class="pixelated h-4 w-4"
									/>
								{/if}
								{getCropDisplayName(selectedCrop)}
							</span>
						</Select.Trigger>
						<Select.Content>
							{#each cropOptions as option (option.value)}
								<Select.Item value={option.value}>
									<span class="flex items-center gap-2">
										{#if option.img}
											<img src={option.img} alt="" class="pixelated h-4 w-4" />
										{/if}
										{option.label}
									</span>
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="flex flex-col gap-1.5">
					<Label class="text-xs font-medium">Metric</Label>
					<Select.Simple class="w-full" options={metricOptions} bind:value={metric} />
				</div>

				<div class="flex flex-col gap-1.5">
					<Label class="text-xs font-medium">Stat to Adjust</Label>
					<Select.Simple
						class="w-full"
						options={fieldOptions}
						bind:value={selectedFieldId}
						placeholder="Choose a stat"
					/>
				</div>
			</div>

			<div class="mt-5 grid gap-4 sm:grid-cols-3">
				<div class="flex flex-col gap-1.5">
					<Label class="text-xs font-medium">Start</Label>
					<NumberInput bind:value={rangeStart} class="h-9" />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label class="text-xs font-medium">End</Label>
					<NumberInput bind:value={rangeEnd} class="h-9" />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label class="text-xs font-medium">Step</Label>
					<NumberInput bind:value={rangeStep} min={0.01} class="h-9" />
				</div>
			</div>

			<div class="mt-4 flex flex-wrap items-center gap-3">
				<Button onclick={runScan} disabled={scanning || !currentField}>
					{#if scanning}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Run What-If Analysis
				</Button>
				<p class="text-muted-foreground text-xs">
					{estimatedPointCount.toLocaleString()} scan point{estimatedPointCount === 1 ? '' : 's'}
					{#if baselineFieldValue !== null}
						. Default value: {formatFieldValue(baselineFieldValue)}
					{/if}
				</p>
				{#if bazaarLoading}
					<span class="text-muted-foreground text-xs">Loading bazaar data...</span>
				{/if}
			</div>
		</div>

		<div id="whatif-sidebar" class="bg-card flex flex-col gap-4 rounded-lg border p-6">
			<div class="flex flex-col gap-1">
				<p class="text-muted-foreground text-xs font-semibold tracking-wide uppercase">How to Read It</p>
				<h2 class="text-lg font-semibold">One stat moves. Everything else stays fixed.</h2>
				<p class="text-muted-foreground text-sm">
					Each point reruns {getCropDisplayName(selectedCrop)} with the same baseline setup and only changes
					{currentField?.label ?? 'the selected stat'}.
				</p>
			</div>

			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
				<div class="rounded-lg border p-3">
					<p class="text-muted-foreground text-xs uppercase">Baseline Setup</p>
					{#if importMessage}
						<p class="mt-1 text-sm font-medium">{importMessage}</p>
					{:else}
						<p class="mt-1 text-sm font-medium">Default Setup</p>
					{/if}
					<p class="text-muted-foreground text-xs">
						{baselineRuntime.pet.info.name} &bull; {baselineTool.info.name}
					</p>
				</div>
				<div class="rounded-lg border p-3">
					<p class="text-muted-foreground text-xs uppercase">Metric</p>
					<p class="mt-1 text-sm font-medium">{currentMetricOption.label}</p>
					<p class="text-muted-foreground text-xs">{currentMetricOption.description}</p>
				</div>
				<div class="rounded-lg border p-3">
					<p class="text-muted-foreground text-xs uppercase">Output</p>
					<p class="mt-1 text-sm font-medium">Per 93.6-second farming sample</p>
					<p class="text-muted-foreground text-xs">
						Higher values mean better profit for this exact scenario.
					</p>
				</div>
			</div>
		</div>
	</div>

	{#if chartData.length > 0}
		{@const minPoint = worstPoint!}
		{@const maxPoint = bestPoint!}
		<div class="bg-card w-full rounded-lg border p-6">
			<div class="mb-4 grid gap-3 md:grid-cols-4">
				<div class="rounded-lg border p-3">
					<p class="text-muted-foreground text-xs uppercase">Baseline</p>
					<p class="mt-1 text-lg font-semibold">{formatCompact(baselineProfit)}</p>
					<p class="text-muted-foreground text-xs">
						{currentField?.label}: {baselineFieldValue !== null
							? formatFieldValue(baselineFieldValue)
							: 'n/a'}
					</p>
				</div>
				<div class="rounded-lg border p-3">
					<p class="text-muted-foreground text-xs uppercase">Best In Range</p>
					<p class="mt-1 text-lg font-semibold">{formatCompact(maxPoint.y)}</p>
					<p class="text-muted-foreground text-xs">{formatFieldValue(maxPoint.x)}</p>
				</div>
				<div class="rounded-lg border p-3">
					<p class="text-muted-foreground text-xs uppercase">Worst In Range</p>
					<p class="mt-1 text-lg font-semibold">{formatCompact(minPoint.y)}</p>
					<p class="text-muted-foreground text-xs">{formatFieldValue(minPoint.x)}</p>
				</div>
				<div class="rounded-lg border p-3">
					<p class="text-muted-foreground text-xs uppercase">Profit Swing</p>
					<p class="mt-1 text-lg font-semibold">
						{profitSwing !== null ? formatSignedCompact(profitSwing) : '0'}
					</p>
					<p class="text-muted-foreground text-xs">{chartData.length} points scanned</p>
				</div>
			</div>

			<h2 class="mb-1 text-sm font-medium">{currentField?.label ?? 'Stat'} vs {currentMetricOption.label}</h2>
			<p class="text-muted-foreground mb-4 text-xs">
				{getCropDisplayName(selectedCrop)} per 93.6-second farming sample. Higher on the chart means better profit.
			</p>

			<div class="h-[300px]">
				<Chart data={chartData} x="x" y="y" yNice padding={{ left: 60, bottom: 24, top: 10, right: 10 }}>
					<Layer type="svg">
						<Axis placement="left" rule grid format={(value) => formatCompact(+value)} />
						<Axis placement="bottom" />
						<Area class="fill-primary/10" line={{ class: 'stroke-primary stroke-2' }} />
						<Highlight area lines />
						<Tooltip.Root>
							{#snippet children({ data })}
								<Tooltip.Header>{currentField?.label}: {data.x}</Tooltip.Header>
								<Tooltip.List>
									<Tooltip.Item label="Profit" value="{formatCompact(data.y)} coins" />
								</Tooltip.List>
							{/snippet}
						</Tooltip.Root>
					</Layer>
				</Chart>
			</div>

			<div class="mt-5 rounded-lg border">
				<div class="border-b px-4 py-3">
					<h3 class="text-sm font-semibold">Best Values In This Scan</h3>
					<p class="text-muted-foreground text-xs">
						Sorted by {currentMetricOption.label}. Use this list if you want the answer faster than reading
						the chart.
					</p>
				</div>
				<div class="divide-y">
					{#each topPoints as point, index (point.x)}
						<div class="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3">
							<span class="text-muted-foreground text-xs font-semibold">#{index + 1}</span>
							<div>
								<p class="text-sm font-medium">
									{currentField?.label ?? 'Value'}: {formatFieldValue(point.x)}
								</p>
								<p class="text-muted-foreground text-xs">
									{formatSignedCompact(point.y - baselineProfit)} vs baseline
								</p>
							</div>
							<p class="font-mono text-sm font-semibold">{formatCompact(point.y)}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{:else}
		<div class="bg-card w-full rounded-lg border p-6">
			<h2 class="text-lg font-semibold">Ready to Scan</h2>
			<p class="text-muted-foreground mt-1 text-sm">
				Run the scan to compare {estimatedPointCount.toLocaleString()} values of
				<strong>{currentField?.label ?? 'the selected stat'}</strong> for
				<strong>{getCropDisplayName(selectedCrop)}</strong>.
			</p>
			<p class="text-muted-foreground mt-3 text-xs">
				Current baseline: {formatCompact(baselineProfit)} with {currentMetricOption.label}.
				{#if baselineFieldValue !== null}
					Current {currentField?.label ?? 'value'}: {formatFieldValue(baselineFieldValue)}.
				{/if}
			</p>
		</div>
	{/if}

	<!-- FAQ -->
	<section class="w-full">
		<h2 class="mb-3 text-lg font-semibold">Frequently Asked Questions</h2>
		<Accordion.Root type="multiple" class="w-full">
			<Accordion.Item value="what-is">
				<Accordion.Trigger>What does this tool do?</Accordion.Trigger>
				<Accordion.Content>
					It takes your farming setup (imported or default), picks one stat like Farming Fortune or BPS, and
					sweeps it from a start value to an end value. At each point it recalculates your profit so you can
					see the exact impact of upgrading that stat.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="import">
				<Accordion.Trigger>Why should I import my account?</Accordion.Trigger>
				<Accordion.Content>
					Importing your gear loads your actual pet, tools, armor, equipment, and player stats. Without it the
					calculator uses a generic default setup which may not reflect your real profit curve.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="bazaar">
				<Accordion.Trigger>How does Bazaar profit work?</Accordion.Trigger>
				<Accordion.Content>
					When you select "Bazaar Profit", the calculator fetches current sell-order prices from the Bazaar
					and values each drop at its best sell price. NPC Profit uses fixed NPC sell values instead, which
					are more stable but usually lower.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="scan-points">
				<Accordion.Trigger>How many scan points should I use?</Accordion.Trigger>
				<Accordion.Content>
					The calculator runs each point synchronously. 50 to 200 points is typically enough to see the profit
					curve clearly. Very large scans (1000+) may take a few seconds.
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</section>
</div>
