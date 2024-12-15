import { Rarity } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import { FortuneSourceProgress } from '../constants/upgrades.js';
import { FARMING_ACCESSORIES_INFO, FarmingAccessoryInfo } from '../items/accessories.js';
import { PlayerOptions } from '../player/playeroptions.js';
import { ACCESSORY_FORTUNE_SOURCES } from '../upgrades/sources/accessorysources.js';
import { getSourceProgress } from '../upgrades/upgrades.js';
import { getPeridotFortune } from '../util/gems.js';
import { EliteItemDto } from './item.js';
import { UpgradeableBase, UpgradeableInfo } from './upgradeable.js';

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

	getProgress(zereod = false): FortuneSourceProgress[] {
		return getSourceProgress<FarmingAccessory>(this, ACCESSORY_FORTUNE_SOURCES, zereod);
	}

	getFortune() {
		this.fortuneBreakdown = {};
		let sum = 0;

		// Base fortune
		const base = this.info.baseStats?.[Stat.FarmingFortune] ?? 0;
		if (base > 0) {
			this.fortuneBreakdown['Base Stats'] = base;
			sum += base;
		}

		// Gems
		let peridot = getPeridotFortune(this.rarity, this.item);
		if (peridot > 0) {
			peridot = +(peridot / 2).toFixed(2); // Only half the fortune is applied on accessories

			this.fortuneBreakdown['Peridot Gems'] = peridot;
			sum += peridot;
		}

		this.fortune = sum;
		return sum;
	}

	static isValid(item: EliteItemDto): boolean {
		return FARMING_ACCESSORIES_INFO[item.skyblockId as keyof typeof FARMING_ACCESSORIES_INFO] !== undefined;
	}

	static fromArray(items: EliteItemDto[]): FarmingAccessory[] {
		return items
			.filter((item) => FarmingAccessory.isValid(item))
			.map((item) => new FarmingAccessory(item))
			.sort((a, b) => b.fortune - a.fortune);
	}

	static fakeItem(info: UpgradeableInfo, options?: PlayerOptions): FarmingAccessory | undefined {
		const fake: EliteItemDto = {
			name: 'Fake Item',
			skyblockId: info.skyblockId,
			lore: [],
			attributes: {},
			enchantments: {},
		};

		if (!FarmingAccessory.isValid(fake)) return undefined;

		return new FarmingAccessory(fake, options);
	}
}
