/* eslint-disable svelte/prefer-svelte-reactivity */
import { browser } from '$app/environment';
import type { RatesItemPriceData } from '$lib/api/elite';
import type {
	FortuneUpgrade,
	PestFarmingPhase,
	PestFarmingRateCalculator,
	PestFarmingRateResult,
	PestFarmingUpgradeRateImpact,
	PestRatePriceBook,
} from 'farming-weight';

const FRAME_BUDGET_MS = 8;
const PRICE_CACHE_TTL_MS = 60_000;
const MAX_MEMO_ENTRIES = 1_000;

interface PestRateComparison {
	before: PestFarmingRateResult;
	after: PestFarmingRateResult;
}

export interface PestRateComparisonTask {
	key: string;
	type: 'gear' | 'pet';
	calculate: () => PestRateComparison;
}

interface RestartInput {
	calculator: PestFarmingRateCalculator;
	before: PestFarmingRateResult;
	phase: PestFarmingPhase;
	upgrades: FortuneUpgrade[];
	comparisons: PestRateComparisonTask[];
}

interface CachedPrice {
	expiresAt: number;
	value: RatesItemPriceData[string];
}

// Module lifetime intentionally spans child-route navigation within this browser session.
const priceCache = new Map<string, CachedPrice>();

export function getPestUpgradeIdentity(upgrade: FortuneUpgrade): string {
	return (
		upgrade.conflictKey ??
		`${upgrade.title}:${upgrade.action}:${upgrade.meta?.type ?? ''}:${upgrade.meta?.id ?? upgrade.meta?.key ?? ''}`
	);
}

export function readCachedPestPrices(itemIds: readonly string[]): {
	cached: RatesItemPriceData;
	missing: string[];
} {
	const now = Date.now();
	const cached: RatesItemPriceData = {};
	const missing: string[] = [];
	for (const itemId of itemIds) {
		const entry = priceCache.get(itemId);
		if (!entry || entry.expiresAt <= now) {
			if (entry) priceCache.delete(itemId);
			missing.push(itemId);
			continue;
		}
		cached[itemId] = entry.value;
	}
	return { cached, missing };
}

export function cachePestPrices(data: RatesItemPriceData): void {
	const expiresAt = Date.now() + PRICE_CACHE_TTL_MS;
	for (const [itemId, value] of Object.entries(data)) {
		priceCache.set(itemId, { expiresAt, value });
	}
}

export class PestRateImpactController {
	upgradeImpacts = $state<Map<string, PestFarmingUpgradeRateImpact>>(new Map());
	gearImpacts = $state<Map<string, number>>(new Map());
	petImpacts = $state<Map<string, number>>(new Map());
	requiredItemIds = $state<string[]>([]);
	ready = $state(false);
	mechanicsRevision = $state(0);
	displayRevision = $state(0);

	#generation = 0;
	#upgradeMemo = new Map<string, PestFarmingUpgradeRateImpact>();
	#comparisonMemo = new Map<string, PestRateComparison>();
	#activeUpgradeMechanics = new Map<string, PestFarmingUpgradeRateImpact>();
	#activeGearMechanics = new Map<string, PestRateComparison>();
	#activePetMechanics = new Map<string, PestRateComparison>();

	restart(input: RestartInput): void {
		const generation = ++this.#generation;
		this.ready = false;
		this.requiredItemIds = [];
		this.upgradeImpacts = new Map();
		this.gearImpacts = new Map();
		this.petImpacts = new Map();
		this.displayRevision++;
		if (!browser) return;

		requestAnimationFrame(() => {
			void this.#build(generation, input);
		});
	}

	cancel(): void {
		this.#generation++;
	}

	revalue(calculator: PestFarmingRateCalculator, priceBook: PestRatePriceBook): void {
		if (!this.ready) return;
		this.upgradeImpacts = new Map(
			[...this.#activeUpgradeMechanics].map(([key, impact]) => [
				key,
				calculator.revalueUpgradeImpact(impact, priceBook),
			])
		);
		this.gearImpacts = this.#valueComparisons(calculator, priceBook, this.#activeGearMechanics);
		this.petImpacts = this.#valueComparisons(calculator, priceBook, this.#activePetMechanics);
		this.displayRevision++;
	}

	async #build(generation: number, input: RestartInput): Promise<void> {
		await nextFrame();
		if (generation !== this.#generation) return;

		const upgrades = dedupeUpgrades(input.upgrades);
		const comparisons = dedupeComparisons(input.comparisons);
		const upgradeMechanics = new Map<string, PestFarmingUpgradeRateImpact>();
		const gearMechanics = new Map<string, PestRateComparison>();
		const petMechanics = new Map<string, PestRateComparison>();
		const requiredItemIds = new Set<string>();
		let chunkStarted = performance.now();

		for (const upgrade of upgrades) {
			const upgradeKey = getPestUpgradeIdentity(upgrade);
			const memoKey = `${input.before.mechanicsKey}:${input.phase}:${upgradeKey}`;
			let impact = this.#upgradeMemo.get(memoKey);
			if (!impact) {
				impact = input.calculator.calculateUpgradeImpact({
					phase: input.phase,
					upgrade,
					before: input.before,
				});
				this.#upgradeMemo.set(memoKey, impact);
			}
			upgradeMechanics.set(upgradeKey, impact);
			collectImpactItemIds(requiredItemIds, impact);
			if (performance.now() - chunkStarted >= FRAME_BUDGET_MS) {
				await nextFrame();
				if (generation !== this.#generation) return;
				chunkStarted = performance.now();
			}
		}

		for (const task of comparisons) {
			const memoKey = `${input.before.mechanicsKey}:${task.key}`;
			let comparison = this.#comparisonMemo.get(memoKey);
			if (!comparison) {
				comparison = task.calculate();
				this.#comparisonMemo.set(memoKey, comparison);
			}
			(task.type === 'gear' ? gearMechanics : petMechanics).set(task.key, comparison);
			for (const itemId of input.calculator.getRequiredPriceItems(comparison.after)) requiredItemIds.add(itemId);
			if (performance.now() - chunkStarted >= FRAME_BUDGET_MS) {
				await nextFrame();
				if (generation !== this.#generation) return;
				chunkStarted = performance.now();
			}
		}

		if (generation !== this.#generation) return;
		this.#activeUpgradeMechanics = upgradeMechanics;
		this.#activeGearMechanics = gearMechanics;
		this.#activePetMechanics = petMechanics;
		this.requiredItemIds = [...requiredItemIds];
		this.ready = true;
		this.mechanicsRevision++;
		this.#pruneMemos();
	}

	#valueComparisons(
		calculator: PestFarmingRateCalculator,
		priceBook: PestRatePriceBook,
		comparisons: Map<string, PestRateComparison>
	): Map<string, number> {
		return new Map(
			[...comparisons].map(([key, comparison]) => {
				const before = calculator.revalueResult(comparison.before, priceBook).valuation.coinsPerHour;
				const after = calculator.revalueResult(comparison.after, priceBook).valuation.coinsPerHour;
				const delta = after - before;
				return [key, Number.isFinite(delta) ? delta : 0];
			})
		);
	}

	#pruneMemos(): void {
		if (this.#upgradeMemo.size > MAX_MEMO_ENTRIES) {
			this.#upgradeMemo = new Map(
				[...this.#upgradeMemo].filter(([, value]) => this.#activeUpgradeMechanics.has(value.upgradeKey))
			);
		}
		if (this.#comparisonMemo.size > MAX_MEMO_ENTRIES) this.#comparisonMemo.clear();
	}
}

function dedupeUpgrades(upgrades: readonly FortuneUpgrade[]): FortuneUpgrade[] {
	const unique = new Map<string, FortuneUpgrade>();
	for (const upgrade of upgrades) {
		const key = getPestUpgradeIdentity(upgrade);
		if (!unique.has(key)) unique.set(key, upgrade);
	}
	return [...unique.values()];
}

function dedupeComparisons(comparisons: readonly PestRateComparisonTask[]): PestRateComparisonTask[] {
	return [...new Map(comparisons.map((comparison) => [comparison.key, comparison])).values()];
}

function collectImpactItemIds(items: Set<string>, impact: PestFarmingUpgradeRateImpact): void {
	for (const itemId of Object.keys(impact.delta.items)) items.add(itemId);
	for (const itemId of Object.keys(impact.delta.rngItems)) items.add(itemId);
}

function nextFrame(): Promise<void> {
	return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
