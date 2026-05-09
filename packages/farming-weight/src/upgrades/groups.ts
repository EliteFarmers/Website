import { mergeCost, type FortuneUpgrade, type UpgradeCost } from '../constants/upgrades.js';

const SLOT_ORDER: Record<string, number> = {
	Helmet: 0,
	Chestplate: 1,
	Leggings: 2,
	Boots: 3,
	Necklace: 4,
	Cloak: 5,
	Belt: 6,
	Gloves: 7,
};

export function withGroupedUpgrades(upgrades: FortuneUpgrade[]): FortuneUpgrade[] {
	const groupedRows = buildGroupedUpgrades(upgrades);
	if (groupedRows.length === 0) return upgrades;

	const groupedMemberKeys = new Set(
		groupedRows.flatMap((group) => group.groupedUpgrades ?? []).map((upgrade) => getUpgradeKey(upgrade))
	);
	const ungroupedRows = upgrades.filter((upgrade) => !groupedMemberKeys.has(getUpgradeKey(upgrade)));

	return [...groupedRows, ...ungroupedRows];
}

export function buildGroupedUpgrades(upgrades: FortuneUpgrade[]): FortuneUpgrade[] {
	const grouped = new Map<string, FortuneUpgrade[]>();

	for (const upgrade of upgrades) {
		if (!upgrade.group?.id) continue;
		const members = grouped.get(upgrade.group.id) ?? [];
		members.push(upgrade);
		grouped.set(upgrade.group.id, members);
	}

	const result: FortuneUpgrade[] = [];
	for (const members of grouped.values()) {
		if (members.length < 2) continue;

		const sorted = [...members].sort(compareUpgradeGroupMembers);
		const first = sorted[0];
		const group = first?.group;
		if (!group) continue;

		const stats = sumStats(sorted);
		const cost = mergeUpgradeCosts(sorted);

		result.push({
			title: group.label,
			increase: sorted.reduce((sum, upgrade) => sum + (upgrade.increase ?? 0), 0),
			stats,
			action: first.action,
			category: first.category,
			cost,
			wiki: first.wiki,
			conflictKey: `upgrade_group:${group.id}:${sorted.map((upgrade) => upgrade.conflictKey ?? upgrade.title).join('|')}`,
			group: {
				...group,
				memberCount: sorted.length,
			},
			groupedUpgrades: sorted,
			meta: {
				type: 'upgrade_group',
				id: group.id,
			},
		});
	}

	return result.sort((a, b) => a.title.localeCompare(b.title));
}

function compareUpgradeGroupMembers(a: FortuneUpgrade, b: FortuneUpgrade): number {
	const slotA = a.onto?.slot ? (SLOT_ORDER[a.onto.slot] ?? 99) : 99;
	const slotB = b.onto?.slot ? (SLOT_ORDER[b.onto.slot] ?? 99) : 99;
	if (slotA !== slotB) return slotA - slotB;
	return a.title.localeCompare(b.title);
}

function sumStats(upgrades: FortuneUpgrade[]) {
	const stats: Partial<Record<string, number>> = {};
	for (const upgrade of upgrades) {
		for (const [stat, value] of Object.entries(upgrade.stats ?? {})) {
			stats[stat] = (stats[stat] ?? 0) + (value ?? 0);
		}
	}
	return Object.keys(stats).length > 0 ? (stats as FortuneUpgrade['stats']) : undefined;
}

function mergeUpgradeCosts(upgrades: FortuneUpgrade[]): UpgradeCost | undefined {
	const costs = upgrades.map((upgrade) => upgrade.cost).filter((cost): cost is UpgradeCost => cost !== undefined);
	return costs.length > 0 ? mergeCost(...costs) : undefined;
}

function getUpgradeKey(upgrade: FortuneUpgrade): string {
	return upgrade.conflictKey ?? `${upgrade.title}:${upgrade.action}:${upgrade.meta?.type ?? ''}:${upgrade.meta?.id ?? ''}`;
}
