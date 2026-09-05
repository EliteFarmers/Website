import { browser } from '$app/environment';
import type { RatesItemPriceData } from '$lib/api/elite';
import { calculateCropBazaarProfit } from '$lib/calc/crop-bazaar-profit';
import { sortCropRates, type CropProfitColumn, type CropProfitSortDirection } from '$lib/calc/crop-rate-sort';
import { collectBazaarItemIds } from '$lib/calc/fortune-sandbox-helpers';
import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
import { getItems } from '$lib/remote/items.remote';
import { DEFAULT_SELECTED_CROPS, getSelectedCrops } from '$lib/stores/selectedCrops';
import {
	calculateAverageSpecialCrops,
	calculateDetailedDropsFromEffects,
	createFarmingPlayer,
	Crop,
	CROP_INFO,
	FarmingPet,
	getCropDisplayName,
	getCropFromName,
	MAX_CROP_FORTUNE,
	type DetailedDropsFromEffectsResult,
	type FarmingPetType,
	type PlayerOptions,
} from 'farming-weight';
import { TIME_OPTIONS } from './rates-content';
import { onDestroy, untrack } from 'svelte';
import { fromStore } from 'svelte/store';
import { syncToolQuery } from '$lib/tools/query-state.svelte';
import { nonDefault, readNumber, readChoice, readBoolean, type ToolQueryValues } from '$lib/tools/query-params';

const ALL_CROPS = Object.values(Crop).filter((c) => c !== Crop.Seeds);

const ElephantFortuneDiff = 396.7 - 210;

const MooshroomFortuneDiff = 396.7 - 217;

export class RatesCalculator {
	fortuneInput = $state<number | undefined>(undefined);

	timeBlocks = $state(72_000);

	reforge = $state('bountiful');

	pet = $state('rose_dragon');

	bps = $state(20);

	useMaxTool = $state(true);

	useRarefinder = $state(true);

	useMechamind = $state(true);

	useCropeetle = $state(true);

	useWartyBug = $state(false);

	bzMode = $state<'order' | 'insta'>('order');

	bazaarData = $state<RatesItemPriceData | undefined>(undefined);

	bazaarStatus = $state<'idle' | 'loading' | 'ready' | 'error'>('idle');

	bazaarRequest = 0;

	profitColumn = $state<CropProfitColumn>('bazaarProfit');

	profitDirection = $state<CropProfitSortDirection>('descending');

	sortByProfit = (column: CropProfitColumn) => {
		this.profitDirection =
			column === this.profitColumn && this.profitDirection === 'descending' ? 'ascending' : 'descending';
		this.profitColumn = column;
	};

	private selection: ReturnType<typeof fromStore<Record<string, boolean>>>;
	private selectedCrops: ReturnType<typeof getSelectedCrops>;

	constructor(selectedCrops: ReturnType<typeof getSelectedCrops>) {
		this.selectedCrops = selectedCrops;
		this.selection = fromStore(selectedCrops);
	}

	selectedCrop = $derived.by(() => {
		const name = Object.entries(this.selection.current).find(([, v]) => v)?.[0] ?? null;
		return name ? (getCropFromName(name) ?? null) : null;
	});

	selectCrop = (crop: Crop) => {
		this.selectedCrops.set({ ...DEFAULT_SELECTED_CROPS, [getCropDisplayName(crop)]: true });
	};

	clearSelectedCrop = () => {
		this.selectedCrops.set({ ...DEFAULT_SELECTED_CROPS });
	};

	blocksBroken = $derived(Math.round(this.timeBlocks * (this.bps / 20)));

	timeName = $derived(TIME_OPTIONS.find((t) => t.value === this.timeBlocks)?.label ?? '1 Hour');

	isCustomFortune = $derived(this.fortuneInput !== undefined && this.fortuneInput >= 0);

	allResults = $derived.by(() => {
		const petType = (
			this.pet === 'rose_dragon' ? 'ROSE_DRAGON' : this.pet === 'mooshroom' ? 'MOOSHROOM_COW' : 'ELEPHANT'
		) as FarmingPetType['type'];
		const options: PlayerOptions = {
			chips: {
				rarefinder: this.useRarefinder ? 20 : 0,
				mechamind: this.useMechamind ? 20 : 0,
			},
			attributes: {
				crop_bug: this.useCropeetle ? 64 : 0,
				wart_eater: this.useWartyBug ? 24 : 0,
			},
		};
		const selectedPet = new FarmingPet(
			{
				type: petType,
				exp: 1_708_399_946,
				active: true,
				tier: 'LEGENDARY',
				heldItem: 'GREEN_BANDANA',
			},
			options
		);
		const player = createFarmingPlayer({ ...options, pets: [selectedPet], selectedPet });

		return Object.fromEntries(
			ALL_CROPS.map((crop) => {
				const env = player.buildEnvironment(crop);
				const maxFortune = MAX_CROP_FORTUNE[crop] ?? 0;
				const petDifference =
					this.pet === 'rose_dragon'
						? 0
						: this.pet === 'mooshroom'
							? MooshroomFortuneDiff
							: ElephantFortuneDiff;
				return [
					crop,
					calculateDetailedDropsFromEffects({
						crop,
						blocksBroken: this.blocksBroken,
						farmingFortune: this.isCustomFortune ? this.fortuneInput : maxFortune - petDifference,
						armorPieces: 4,
						bountiful: this.reforge === 'bountiful',
						mooshroom: this.pet === 'mooshroom',
						maxTool: this.useMaxTool,
						effects: player.collectEffects(env),
						env,
					}),
				];
			})
		) as Record<Crop, DetailedDropsFromEffectsResult>;
	});

	formattedCrops = $derived.by(() => {
		return ALL_CROPS.map((crop) => {
			const details = this.allResults[crop];
			if (!details) return null;

			const npcProfit = details.npcCoins ?? 0;
			const displayName = getCropDisplayName(crop);
			const img = PROPER_CROP_TO_IMG[displayName];

			return {
				...calculateCropBazaarProfit(details, crop, this.bazaarData, this.bzMode),
				crop,
				displayName,
				img,
				fortune: details.fortune,
				collection: details.collection,
				npcProfit,
				coinSources: Object.entries(details.coinSources).sort(([, a], [, b]) => b - a),
				otherCollection: Object.entries(details.otherCollection).sort(([, a], [, b]) => b - a),
				items: details.items,
			};
		}).filter((row): row is NonNullable<typeof row> => row !== null);
	});

	sortedCrops = $derived(sortCropRates(this.formattedCrops, this.profitColumn, this.profitDirection));

	selectedCropDetail = $derived.by(() => {
		if (!this.selectedCrop) return null;
		const row = this.formattedCrops.find((r) => r.crop === this.selectedCrop);
		if (!row) return null;
		const details = this.allResults[this.selectedCrop];
		if (!details) return null;

		const threeFourths = calculateAverageSpecialCrops(this.blocksBroken, this.selectedCrop, 3);
		const fromSpecial = details.coinSources[threeFourths.type] ?? 0;
		const specialDifference = fromSpecial - threeFourths.npc;
		const threeFourthsTotal = Math.floor(details.npcCoins - specialDifference);

		return {
			...row,
			threeFourths: {
				total: threeFourthsTotal,
				specialDifference: Math.floor(specialDifference),
				amount: Math.round(threeFourths.amount),
				type: threeFourths.type,
			},
		};
	});

	connect(getUrl: () => URL) {
		syncToolQuery(getUrl, this.readQuery, this.writeQuery);
		$effect(() => {
			void this.allResults;
			untrack(() => {
				if (!browser) return;
				const requestId = ++this.bazaarRequest;
				const items = collectBazaarItemIds(Object.values(this.allResults).filter(Boolean));
				const craftIds = ALL_CROPS.flatMap((crop) => CROP_INFO[crop]?.crafts?.map((c) => c.item) ?? []);
				const allIds = [...new Set([...items, ...craftIds])];
				if (!allIds.length) {
					this.bazaarData = undefined;
					this.bazaarStatus = 'idle';
					return;
				}

				this.bazaarStatus = 'loading';
				getItems(allIds)
					.then((data) => {
						if (requestId !== this.bazaarRequest) return;
						const hasBazaarPrices = Boolean(data && Object.values(data).some((entry) => entry.bazaar));
						this.bazaarData = hasBazaarPrices ? data : undefined;
						this.bazaarStatus = hasBazaarPrices ? 'ready' : 'error';
					})
					.catch(() => {
						if (requestId !== this.bazaarRequest) return;
						this.bazaarData = undefined;
						this.bazaarStatus = 'error';
					});
			});
		});
		onDestroy(() => {
			this.bazaarRequest++;
		});
	}

	readQuery = (params: URLSearchParams) => {
		const fortune = readNumber(params, 'fortune', -1, 0, 5000);
		this.fortuneInput = fortune < 0 ? undefined : fortune;
		this.timeBlocks =
			readChoice(
				params,
				'duration',
				TIME_OPTIONS.map((option) => option.value / 1200),
				60
			) * 1200;
		this.reforge = readChoice(params, 'reforge', ['bountiful', 'blessed'], 'bountiful');
		this.pet = readChoice(params, 'pet', ['rose_dragon', 'mooshroom', 'elephant'], 'rose_dragon');
		this.bps = readNumber(params, 'bps', 20, 10, 20, 0.5);
		this.useMaxTool = readBoolean(params, 'maxTool', true);
		this.useRarefinder = readBoolean(params, 'rarefinder', true);
		this.useMechamind = readBoolean(params, 'mechamind', true);
		this.useCropeetle = readBoolean(params, 'cropeetle', true);
		this.useWartyBug = readBoolean(params, 'wartyBug', false);
		this.bzMode = readChoice(params, 'sell', ['order', 'insta'] as const, 'order');
		this.profitColumn =
			readChoice(params, 'sort', ['npc', 'bazaar'], 'bazaar') === 'npc' ? 'npcProfit' : 'bazaarProfit';
		this.profitDirection =
			readChoice(params, 'direction', ['asc', 'desc'], 'desc') === 'asc' ? 'ascending' : 'descending';
		const crop = getCropFromName(params.get('crop') ?? '');
		if (crop && crop !== Crop.Seeds) this.selectCrop(crop);
		else this.clearSelectedCrop();
	};
	writeQuery = (): ToolQueryValues => ({
		fortune: this.fortuneInput,
		duration: nonDefault(this.timeBlocks / 1200, 60),
		reforge: nonDefault(this.reforge, 'bountiful'),
		pet: nonDefault(this.pet, 'rose_dragon'),
		bps: nonDefault(this.bps, 20),
		maxTool: nonDefault(this.useMaxTool, true),
		rarefinder: nonDefault(this.useRarefinder, true),
		mechamind: nonDefault(this.useMechamind, true),
		cropeetle: nonDefault(this.useCropeetle, true),
		wartyBug: nonDefault(this.useWartyBug, false),
		sell: nonDefault(this.bzMode, 'order'),
		crop: this.selectedCrop ?? undefined,
		sort: this.profitColumn === 'npcProfit' ? 'npc' : undefined,
		direction: this.profitDirection === 'ascending' ? 'asc' : undefined,
	});
}
