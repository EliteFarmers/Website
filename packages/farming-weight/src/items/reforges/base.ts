import type { Rarity, Reforge, ReforgeTarget, ReforgeTier, ReforgeTiers } from '../../constants/reforge-types.js';
import { Stat } from '../../constants/stats.js';
import type { Effect } from '../../effects/types.js';

type ReforgeDefinition = Omit<Reforge, 'id'>;

export abstract class BaseReforge implements Reforge {
	readonly id: string;
	readonly name: string;
	readonly wiki: string;
	readonly stone?: Reforge['stone'];
	readonly appliesTo: ReforgeTarget[];
	readonly tiers: Partial<ReforgeTiers>;
	readonly priority?: boolean;

	protected constructor(id: string, definition: ReforgeDefinition) {
		this.id = id;
		this.name = definition.name;
		this.wiki = definition.wiki;
		this.stone = definition.stone;
		this.appliesTo = definition.appliesTo;
		this.tiers = definition.tiers;
		this.priority = definition.priority;
	}

	getTier(rarity: Rarity): ReforgeTier | undefined {
		return this.tiers[rarity];
	}

	getEffects(rarity: Rarity, sourceName?: string): Effect[] {
		const tier = this.getTier(rarity);
		if (!tier) return [];
		return this.statsToEffects(tier.stats, sourceName);
	}

	protected statsToEffects(stats: Partial<Record<Stat, number>>, sourceName?: string): Effect[] {
		const source = sourceName ?? `Reforge: ${this.name}`;
		const out: Effect[] = [];

		for (const [statKey, value] of Object.entries(stats) as [Stat, number][]) {
			if (!value) continue;
			if (statKey === Stat.Overbloom) {
				out.push({
					source,
					op: 'add-rare-pct',
					value,
					scope: { tags: ['overbloom'] },
					relatedStats: [Stat.Overbloom],
					meta: {
						description: 'Normal Overbloom',
						valueDisplay: 'stat',
						valueStat: Stat.Overbloom,
					},
				});
				continue;
			}
			out.push({ source, op: 'add-stat', stat: statKey, value });
		}

		return out;
	}
}
