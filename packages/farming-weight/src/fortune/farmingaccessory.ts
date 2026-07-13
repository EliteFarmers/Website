import type { Rarity } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import type { FortuneSourceProgress, StatQueryOptions } from '../constants/upgrades.js';
import type { Effect, EffectEnvironment } from '../effects/types.js';
import { FARMING_ACCESSORIES_INFO, type FarmingAccessoryInfo } from '../items/accessories.js';
import { statsToEffects } from '../items/sources/effects-util.js';
import { gemEffects } from '../items/sources/gems.js';
import type { PlayerOptions } from '../player/playeroptions.js';
import { getSourceProgress } from '../upgrades/getsourceprogress.js';
import { ACCESSORY_FORTUNE_SOURCES } from '../upgrades/sources/accessorysources.js';
import { getGemStat, getPeridotFortune } from '../util/gems.js';
import type { EliteItemDto } from './item.js';
import type { UpgradeableInfo } from './upgradeable.js';
import { UpgradeableBase } from './upgradeablebase.js';

export class FarmingAccessory extends UpgradeableBase {
	public declare readonly item: EliteItemDto;
	public declare readonly info: FarmingAccessoryInfo;

	public declare readonly rarity: Rarity;
	public declare readonly recombobulated: boolean;

	public declare fortune: number;
	public declare fortuneBreakdown: Record<string, number>;

	public declare options?: PlayerOptions;

	constructor(item: EliteItemDto, options?: PlayerOptions) {
		super({ item, options, items: FARMING_ACCESSORIES_INFO });
		this.getFortune();
	}

	getProgress(options?: Stat[] | StatQueryOptions, zeroed = false): FortuneSourceProgress[] {
		const query = Array.isArray(options) ? { stats: options } : options;
		return getSourceProgress<FarmingAccessory>(this, ACCESSORY_FORTUNE_SOURCES, zeroed, {
			...query,
			defaultSourceType: 'general',
		});
	}

	setOptions(options: PlayerOptions) {
		this.options = options;
		this.getFortune();
	}

	getStat(stat: Stat): number {
		let sum = 0;

		// Base fortune
		sum += this.info.baseStats?.[stat] ?? 0;
		sum += this.getCalculatedStats()[stat] ?? 0;

		// Gems
		const gemStat = getGemStat(this.item, stat, this.rarity);
		if (gemStat > 0) {
			sum += +(gemStat / 2).toFixed(2);
		}

		return sum;
	}

	/**
	 * Returns the declarative `Effect[]` representation of every contribution
	 * this accessory makes. Base stats, computed stats, and (halved) gem
	 * stats.
	 */
	getEffects(_env: EffectEnvironment): Effect[] {
		const sourceName = this.info.name;
		const effects: Effect[] = [];

		effects.push(...statsToEffects(this.info.baseStats, sourceName));
		effects.push(...statsToEffects(this.getCalculatedStats(), sourceName));

		effects.push(...gemEffects(this.item, this.rarity, `${sourceName} (Gems)`, 0.5));

		return effects;
	}

	getFortune() {
		this.fortuneBreakdown = {};
		let sum = 0;

		// Base fortune
		const base =
			(this.info.baseStats?.[Stat.FarmingFortune] ?? 0) + (this.getCalculatedStats()[Stat.FarmingFortune] ?? 0);
		if (base > 0) {
			this.fortuneBreakdown['Base Stats'] = base;
			sum += base;
		}

		// Gems
		let peridot = getPeridotFortune(this.rarity, this.item);
		if (peridot > 0) {
			peridot = +(peridot / 2).toFixed(2); // Only half the stats are applied on accessories

			this.fortuneBreakdown['Peridot Gems'] = peridot;
			sum += peridot;
		}

		this.fortune = sum;
		return sum;
	}

	static isValid(item: EliteItemDto): boolean {
		return FARMING_ACCESSORIES_INFO[item.skyblockId as keyof typeof FARMING_ACCESSORIES_INFO] !== undefined;
	}

	static fromArray(items: EliteItemDto[], options?: PlayerOptions): FarmingAccessory[] {
		return items
			.filter((item) => FarmingAccessory.isValid(item))
			.map((item) => new FarmingAccessory(item, options))
			.sort((a, b) => b.fortune - a.fortune);
	}

	static fakeItem(info: UpgradeableInfo, options?: PlayerOptions): FarmingAccessory | undefined {
		const fake: EliteItemDto = {
			name: info.name,
			skyblockId: info.skyblockId,
			uuid: crypto.randomUUID(),
			lore: ['This is a fake item used for upgrade calculations!'],
			attributes: {},
			enchantments: {},
		};

		if (!FarmingAccessory.isValid(fake)) return undefined;

		return new FarmingAccessory(fake, options);
	}
}
