import type { ContestBracketsDto } from '$lib/api';
import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
import { getReadableSkyblockDate, getSkyblockDate, getTimeStamp } from '$lib/format';
import { getJacobMedalBrackets } from '$lib/remote/jacob.remote';
import { getCropDisplayName, getCropFromName, getFortuneRequiredForCollection } from 'farming-weight';
import { MONTHS_OPTIONS, MEDAL_BRACKETS } from './jacob-fortune-content';
import { onDestroy, untrack } from 'svelte';
import { syncToolQuery } from '$lib/tools/query-state.svelte';
import { nonDefault, readNumber, readChoice, readBoolean, type ToolQueryValues } from '$lib/tools/query-params';

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

interface ContestBracketsDetails {
	brackets: Record<string, ContestBracketsDto>;
	contestCount: number;
	monthsLoaded: number;
}

export class JacobCalculator {
	bps = $state(20);

	useMooshroom = $state(true);

	monthsIndex = $state(1);

	loading = $state(true);

	error = $state('');

	brackets = $state<ContestBracketsDetails | null>(null);

	bracketRequest = 0;

	selectedMonths = $derived(MONTHS_OPTIONS[this.monthsIndex]?.value ?? MONTHS_OPTIONS[0].value);

	ratio = $derived(this.bps / 20);

	blocksBroken = $derived(Math.round(24_000 * this.ratio));

	lookbackStartLabel = $derived.by(() => {
		const now = getSkyblockDate(Date.now() / 1000);
		const totalMonths = now.year * 12 + now.month - (this.selectedMonths - 1);
		const clampedTotalMonths = Math.max(totalMonths, 0);
		const year = Math.floor(clampedTotalMonths / 12);
		const month = clampedTotalMonths % 12;
		return getReadableSkyblockDate(getTimeStamp(year, month, 0));
	});

	bracketRows = $derived.by(() => {
		if (!this.brackets) return [] as BracketRow[];
		return Object.entries(this.brackets.brackets)
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
							blocksBroken: this.blocksBroken,
							useMooshroom: this.useMooshroom,
						}),
						0
					);
					return { collection, fortune, ...medal };
				});
				return [{ cropName: displayName, crop, img, entries }];
			})
			.sort((a, b) => a.cropName.localeCompare(b.cropName));
	});

	hasBracketRows = $derived(this.bracketRows.length > 0);

	fetchBrackets = async () => {
		const requestId = ++this.bracketRequest;
		this.loading = true;
		this.error = '';
		try {
			const result = await getJacobMedalBrackets({ months: this.selectedMonths });
			if (requestId !== this.bracketRequest) return;
			this.brackets = result.data ?? null;
			this.error = result.error ?? (result.data ? '' : 'No bracket data is available for this range yet.');
		} catch {
			if (requestId !== this.bracketRequest) return;
			this.brackets = null;
			this.error = 'Failed to fetch bracket data. Please try again later.';
		} finally {
			if (requestId === this.bracketRequest) this.loading = false;
		}
	};

	formatCollection = (amount: number): string => {
		if (amount < 1_000) return amount.toString();
		if (amount < 1_000_000) return `${(amount / 1_000).toFixed(1)}K`;
		if (amount < 1_000_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
		return `${(amount / 1_000_000_000).toFixed(3)}B`;
	};

	connect(getUrl: () => URL) {
		syncToolQuery(getUrl, this.readQuery, this.writeQuery);
		$effect(() => {
			// Re-fetch when months changes
			void this.selectedMonths;
			untrack(this.fetchBrackets);
		});
		onDestroy(() => {
			this.bracketRequest++;
		});
	}

	activeMedal = $state('diamond');
	readQuery = (params: URLSearchParams) => {
		this.bps = readNumber(params, 'bps', 20, 10, 20, 0.5);
		this.useMooshroom = readBoolean(params, 'mooshroom', true);
		const months = readChoice(
			params,
			'months',
			MONTHS_OPTIONS.map((option) => option.value),
			4
		);
		this.monthsIndex = MONTHS_OPTIONS.findIndex((option) => option.value === months);
		this.activeMedal = readChoice(
			params,
			'medal',
			MEDAL_BRACKETS.map((medal) => medal.key),
			'diamond'
		);
	};
	writeQuery = (): ToolQueryValues => ({
		bps: nonDefault(this.bps, 20),
		mooshroom: nonDefault(this.useMooshroom, true),
		months: nonDefault(this.selectedMonths, 4),
		medal: nonDefault(this.activeMedal, 'diamond'),
	});
}
