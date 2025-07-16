import type { Crop } from '../constants/crops.js';
import type { Rarity, RarityRecord, Reforge, ReforgeTarget, ReforgeTier } from '../constants/reforges.js';
import type { Stat, StatsRecord } from '../constants/stats.js';
import type { FortuneSourceProgress, FortuneUpgrade, Upgrade, UpgradeCost } from '../constants/upgrades.js';
import type { PlayerOptions } from '../player/playeroptions.js';
import type { EliteItemDto } from './item.js';

export type GemSlotCost = { type: 'ITEM'; item_id: string; amount: number } | { type: 'COINS'; coins: number };

export interface UpgradeableInfo {
	name: string;
	skyblockId: string;
	upgrade?: Upgrade;
	wiki?: string;
	gemSlots?: { slot_type: string; costs: GemSlotCost[] }[];
	maxRarity: Rarity;
	stats?: RarityRecord<StatsRecord>;
	baseStats?: Partial<Record<Stat, number>>;
	cost?: UpgradeCost;
	computedStats?: (opt: PlayerOptions) => Partial<Record<Stat, number>>;
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
	getUpgrades(): FortuneUpgrade[];
	getItemUpgrade(): Upgrade | undefined;
	getLastItemUpgrade(): { upgrade: Upgrade; info: UpgradeableInfo } | undefined;
	getProgress(zeroed: boolean): FortuneSourceProgress[];
}
