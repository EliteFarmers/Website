import { FARMING_ACCESSORIES_INFO, FarmingAccessoryInfo } from '../constants/accessories';
import { Rarity, Stat } from '../constants/reforges';
import { getRarityFromLore } from '../util/itemstats';
import { EliteItemDto } from './item';

export class FarmingAccessory {
	public readonly item: EliteItemDto;
	public readonly info: FarmingAccessoryInfo;

	public declare readonly rarity: Rarity;
	public declare readonly recombobulated: boolean;

	public declare fortune: number;
	public declare fortuneBreakdown: Record<string, number>;

	constructor(item: EliteItemDto) {
		this.item = item;

		const info = FARMING_ACCESSORIES_INFO[item.skyblockId as keyof typeof FARMING_ACCESSORIES_INFO];
		if (!info) {
			throw new Error(`Unknown lotus gear: ${item.name} (${item.skyblockId})`);
		}
		this.info = info;

		if (item.lore) {
			this.rarity = getRarityFromLore(item.lore);
		}

		this.recombobulated = this.item.attributes?.rarity_upgrades === '1';

		this.sumFortune();
	}

	private sumFortune() {
		this.fortuneBreakdown = {};
		let sum = 0;

		// Base fortune
		const base = this.info.stats?.[Stat.FarmingFortune] ?? 0;
		if (base > 0) {
			this.fortuneBreakdown['Base Stats'] = base;
			sum += base;
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
}
