import { Crop } from "../constants/crops.js";
import { Rarity, RarityRecord, Reforge, REFORGES, ReforgeTarget, ReforgeTier } from "../constants/reforges.js";
import { Stat, StatsRecord } from "../constants/stats.js";
import { FortuneSourceProgress, FortuneUpgrade, Upgrade } from "../constants/upgrades.js";
import { PlayerOptions } from "../player/playeroptions.js";
import { getItemUpgrades, getLastItemUpgradeableTo, getNextItemUpgradeableTo } from "../upgrades/upgrades.js";
import { getRarityFromLore, previousRarity } from "../util/itemstats.js";
import { EliteItemDto } from "./item.js";

export interface UpgradeableInfo {
	name: string;
	skyblockId: string;
	upgrade?: Upgrade;
	wiki?: string;
	gemSlots?: {
		peridot: number;
	};
	maxRarity: Rarity;
	stats?: RarityRecord<StatsRecord>;
	baseStats?: Partial<Record<Stat, number>>;
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
	getLastItemUpgrade(): { upgrade: Upgrade, info: UpgradeableInfo } | undefined;
	getProgress(zeroed: boolean): FortuneSourceProgress[];
}

export class UpgradeableBase implements Upgradeable {
	public item: EliteItemDto;
	public info: UpgradeableInfo;

	private _type?: ReforgeTarget | undefined;
	public get type(): ReforgeTarget | undefined {
		return this._type;
	}
	public set type(value: ReforgeTarget | undefined) {
		this._type = value;
	}

	public crop?: Crop;
	public options?: PlayerOptions;

	public recombobulated: boolean;
	public rarity: Rarity;
	public reforge?: Reforge | undefined;
	public reforgeStats?: ReforgeTier | undefined;

	public fortune: number;

	private items: Partial<Record<string, UpgradeableInfo>>;

	constructor(options: { 
		item: EliteItemDto,
		options?: PlayerOptions,
		items: Partial<Record<string, UpgradeableInfo>>,
	}) {
		this.item = options.item;
		const info = options.items[options.item.skyblockId as keyof typeof options.items];
		if (!info) {
			throw new Error(`Unknown item: ${options.item.name} (${options.item.skyblockId})`);
		}
		this.info = info;
		this.options = options.options;
		this.items = options.items;

		if (this.item.lore) {
			this.rarity = getRarityFromLore(this.item.lore);
		} else {
			this.rarity = previousRarity(this.info.maxRarity);
			this.rarity ??= Rarity.Common;
		}
		
		this.reforge = REFORGES[options.item.attributes?.modifier ?? ''] ?? undefined;
		this.reforgeStats = this.reforge?.tiers?.[this.rarity];

		this.recombobulated = this.item.attributes?.rarity_upgrades === '1';
		this.fortune = 0;
	}

	getFortune(): number {
		return this.fortune;
	}

	getCalculatedStats(): Partial<Record<Stat, number>> {
		if (!this.info.computedStats || !this.options) return {};
		return this.info.computedStats?.(this.options) ?? {};
	}

	getUpgrades(): FortuneUpgrade[] {
		return getItemUpgrades(this);
	}

	getProgress(): FortuneSourceProgress[] {
		return [];
	}

	getItemUpgrade(): Upgrade | undefined {
		return this.info.upgrade;
	}

	getNextItemUpgrade(): { upgrade: Upgrade, info: UpgradeableInfo } | undefined {
		return getNextItemUpgradeableTo(this, this.items);
	}

	getLastItemUpgrade(): { upgrade: Upgrade, info: UpgradeableInfo } | undefined {
		return getLastItemUpgradeableTo(this, this.items);
	}
}