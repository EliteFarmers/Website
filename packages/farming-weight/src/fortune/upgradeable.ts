import type { Crop } from '../constants/crops.js';
import type { Rarity, RarityRecord, Reforge, ReforgeTarget, ReforgeTier } from '../constants/reforges.js';
import type { Stat, StatsRecord } from '../constants/stats.js';
import type { FortuneSourceProgress, FortuneUpgrade, Upgrade, UpgradeCost } from '../constants/upgrades.js';
import type { PlayerOptions } from '../player/playeroptions.js';
import type { EliteItemDto } from './item.js';

export type GemSlotCost =
	| { type: 'ITEM' | 'COINS'; item_id: string; amount: number; coins?: number }
	| { type: 'COINS'; coins: number };
export type GemSlotRequirement = { type: string; data_key: string; value: string; operator: string };

export interface UpgradeableInfo {
	name: string;
	skyblockId: string;
	upgrade?: Upgrade;
	wiki?: string;
	gemSlots?: { slot_type: string; costs: GemSlotCost[]; requirements?: GemSlotRequirement[] }[];
	maxRarity: Rarity;
	stats?: RarityRecord<StatsRecord>;
	baseStats?: Partial<Record<Stat, number>>;
	cost?: UpgradeCost;
	computedStats?: (opt: PlayerOptions) => Partial<Record<Stat, number>>;
	skillReq?: Partial<Record<string, number>>;
}

export interface Upgradeable {
	item: EliteItemDto;
	info: UpgradeableInfo;
	type?: ReforgeTarget;
	crop?: Crop;
	options?: PlayerOptions;

	recombobulated: boolean;
	rarity: Rarity;
	reforge?: Reforge | undefined;
	reforgeStats?: ReforgeTier | undefined;

	fortune: number;

	getFortune(): number;
	getStat(stat: Stat): number;
	getStats(): Partial<Record<Stat, number>>;
	getUpgrades(options?: { stat?: Stat }): FortuneUpgrade[];
	getItemUpgrade(): Upgrade | undefined;
	getLastItemUpgrade(): { upgrade: Upgrade; info: UpgradeableInfo } | undefined;
	getProgress(stats?: Stat[], zeroed?: boolean): FortuneSourceProgress[];
}
