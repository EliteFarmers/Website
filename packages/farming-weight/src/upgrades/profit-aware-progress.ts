import { Stat } from '../constants/stats.js';
import type { FortuneSourceProgress, FortuneUpgrade } from '../constants/upgrades.js';
import { getSourceCompletionUpgrades } from './getsourceprogress.js';

export interface ProfitComparisonResult {
	complete: boolean;
	coinsPerHour: number;
}

const PROFIT_SENSITIVE_STATS = new Set<Stat>([
	Stat.Strength,
	Stat.Damage,
	Stat.PetLuck,
	Stat.PestKillFortune,
	Stat.BonusPestChance,
	Stat.PestCooldownReduction,
	Stat.Overbloom,
]);

const PROFIT_EPSILON = 0.01;

export function getCompletionUpgradeKey(upgrade: FortuneUpgrade): string {
	return [
		upgrade.conflictKey ?? '',
		upgrade.meta?.type ?? '',
		upgrade.meta?.itemUuid ?? '',
		upgrade.meta?.id ?? upgrade.meta?.key ?? '',
		upgrade.title,
	].join('|');
}

export function getProfitCompletionUpgrades(progress: readonly FortuneSourceProgress[]): FortuneUpgrade[] {
	const result = new Map<string, FortuneUpgrade>();
	for (const entry of walkProgress(progress)) {
		for (const group of getProfitSensitiveGroups(getSourceCompletionUpgrades(entry))) {
			for (const upgrade of group) result.set(getCompletionUpgradeKey(upgrade), upgrade);
		}
	}
	return [...result.values()];
}

export function resolveProfitAwareProgress(
	progress: readonly FortuneSourceProgress[],
	compare: (upgrade: FortuneUpgrade) => ProfitComparisonResult | undefined
): FortuneSourceProgress[] {
	return progress.map((entry) => resolveEntry(entry, compare).progress);
}

function resolveEntry(
	entry: FortuneSourceProgress,
	compare: (upgrade: FortuneUpgrade) => ProfitComparisonResult | undefined
): {
	progress: FortuneSourceProgress;
	maxReduction: number;
	statReductions: Partial<Record<Stat, number>>;
} {
	const children = entry.progress?.map((child) => resolveEntry(child, compare));
	const childMaxReduction = children?.reduce((sum, child) => sum + child.maxReduction, 0) ?? 0;
	const childStatReductions: Partial<Record<Stat, number>> = {};
	for (const child of children ?? []) {
		for (const [stat, reduction] of Object.entries(child.statReductions) as [Stat, number][]) {
			childStatReductions[stat] = (childStatReductions[stat] ?? 0) + reduction;
		}
	}

	let max = childMaxReduction > 0 ? Math.max(entry.current, entry.max - childMaxReduction) : entry.max;
	const stats = entry.stats ? { ...entry.stats } : undefined;
	for (const [stat, value] of Object.entries(stats ?? {}) as [
		Stat,
		NonNullable<FortuneSourceProgress['stats']>[Stat],
	][]) {
		if (!value) continue;
		const reduction = childStatReductions[stat] ?? 0;
		const nextMax = reduction > 0 ? Math.max(value.current, value.max - reduction) : value.max;
		stats![stat] = {
			...value,
			max: nextMax,
			ratio: reduction === 0 ? value.ratio : nextMax === value.current ? 1 : getRatio(value.current, nextMax),
		};
	}

	const profitSensitiveGroups = getProfitSensitiveGroups(getSourceCompletionUpgrades(entry));
	const effectivelyComplete = profitSensitiveGroups.every((group) => {
		if (group.length === 0) return true;
		const comparisons = group.map(compare);
		return (
			comparisons.every((result) => result?.complete === true) &&
			comparisons.every((result) => (result?.coinsPerHour ?? Number.POSITIVE_INFINITY) <= PROFIT_EPSILON)
		);
	});
	const hasSensitiveGroup = profitSensitiveGroups.length > 0;
	if (hasSensitiveGroup && effectivelyComplete) {
		max = entry.current;
		for (const [stat, value] of Object.entries(stats ?? {}) as [
			Stat,
			NonNullable<FortuneSourceProgress['stats']>[Stat],
		][]) {
			if (!value) continue;
			stats![stat] = { ...value, max: value.current, ratio: 1 };
		}
	}

	const maxReduction = Math.max(0, entry.max - max);
	const statReductions: Partial<Record<Stat, number>> = {};
	for (const [stat, original] of Object.entries(entry.stats ?? {}) as [
		Stat,
		NonNullable<FortuneSourceProgress['stats']>[Stat],
	][]) {
		const resolved = stats?.[stat];
		if (!original || !resolved) continue;
		const reduction = original.max - resolved.max;
		if (reduction > 0) statReductions[stat] = reduction;
	}

	const changed = maxReduction > 0 || Object.keys(statReductions).length > 0;
	return {
		progress: {
			...entry,
			max,
			ratio: !changed ? entry.ratio : max === entry.current ? 1 : getRatio(entry.current, max),
			stats,
			progress: children?.map((child) => child.progress),
		},
		maxReduction,
		statReductions,
	};
}

function getProfitSensitiveGroups(upgrades: readonly FortuneUpgrade[]): FortuneUpgrade[][] {
	const groups = new Map<string, FortuneUpgrade[]>();
	for (const upgrade of upgrades) {
		if (!upgrade.conflictKey) continue;
		const group = groups.get(upgrade.conflictKey) ?? [];
		group.push(upgrade);
		groups.set(upgrade.conflictKey, group);
	}
	return [...groups.values()].filter((group) => group.some(isProfitSensitiveUpgrade));
}

function isProfitSensitiveUpgrade(upgrade: FortuneUpgrade): boolean {
	if ((upgrade.effects?.length ?? 0) > 0) return true;
	return Object.entries(upgrade.stats ?? {}).some(
		([stat, value]) => PROFIT_SENSITIVE_STATS.has(stat as Stat) && value !== 0
	);
}

function* walkProgress(progress: readonly FortuneSourceProgress[]): Generator<FortuneSourceProgress> {
	for (const entry of progress) {
		yield entry;
		if (entry.progress) yield* walkProgress(entry.progress);
	}
}

function getRatio(current: number, max: number): number {
	if (max === 0) return 0;
	return Math.min(current / max, 1);
}
