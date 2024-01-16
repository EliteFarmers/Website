import {
	FARMING_PETS,
	FARMING_PET_ITEMS,
	FarmingPetInfo,
	FarmingPetItemInfo,
	FarmingPetType,
	FarmingPets,
	PET_LEVELS,
} from '../constants/pets';
import { Rarity, Stat } from '../constants/reforges';
import { Skill } from '../constants/skills';
import { getRarityFromLore } from '../util/itemstats';
import { EliteItemDto } from './item';
import { PlayerOptions } from './player';

export function createFarmingPet(pet: FarmingPetType) {
	return new FarmingPet(pet);
}

export class FarmingPet {
	public declare readonly pet: FarmingPetType;
	public declare readonly type: FarmingPets;
	public declare readonly info: FarmingPetInfo;
	public declare readonly rarity: Rarity;
	public declare readonly level: number;
	public declare readonly item: FarmingPetItemInfo | undefined;

	public declare fortune: number;
	public declare breakdown: Record<string, number>;

	private declare options?: PlayerOptions;

	constructor(pet: FarmingPetType, options?: PlayerOptions) {
		this.options = options;
		this.pet = pet;

		this.info = FARMING_PETS[pet.type as keyof typeof FARMING_PETS];
		if (!this.info) {
			throw new Error(`Invalid farming pet type: ${pet.type}`);
		}

		this.type = pet.type as FarmingPets;

		this.rarity = getRarityFromLore([pet.tier ?? '']) ?? Rarity.Common;
		this.level = getPetLevel(pet);

		this.item = pet.heldItem ? FARMING_PET_ITEMS[pet.heldItem as keyof typeof FARMING_PET_ITEMS] : undefined;

		this.fortune = this.getFortune();
	}

	setOptions(options: PlayerOptions) {
		this.options = options;
		this.fortune = this.getFortune();
	}

	getFortune() {
		let fortune = 0;
		const breakdown: Record<string, number> = {};

		// Base stats
		const stats = this.info.stats?.[Stat.FarmingFortune];
		if (stats) {
			fortune += stats;
			breakdown['Base Stats'] = stats;
		}

		// Per level/ability stats
		const perLevelStats = this.info.perLevelStats?.[Stat.FarmingFortune];
		if (perLevelStats) {
			const amount = perLevelStats.multiplier * this.level;
			fortune += amount;
			breakdown[perLevelStats.name] = amount;
		}

		// Mooshroom Cow Perk
		if (this.type === FarmingPets.MooshroomCow && this.options?.strength) {
			const strengthPer = 40 - this.level * 0.2;
			const strength = this.options.strength;

			const amount = Math.floor((strength / strengthPer) * 0.7);

			fortune += amount;
			breakdown['Farming Strength'] = amount;
		}

		// Pet item stats
		if (this.item) {
			const stats = this.item.stats?.[Stat.FarmingFortune];
			const perLevelStats = this.item.perLevelStats;

			if (stats) {
				fortune += stats;
				breakdown[this.item.name + ' Stats'] = stats;
			}

			if (perLevelStats && perLevelStats.skill === Skill.Garden) {
				const amount = (perLevelStats?.stats?.[Stat.FarmingFortune] ?? 0) * (this.options?.gardenLevel ?? 0);
				fortune += amount;
				breakdown[this.item.name] = amount;
			}
		}

		this.breakdown = breakdown;
		this.fortune = fortune;
		return fortune;
	}

	static isValid(pet: FarmingPetType) {
		return pet.type && pet.type in FARMING_PETS;
	}

	static fromArray(items: EliteItemDto[], options?: PlayerOptions): FarmingPet[] {
		return items
			.filter((item) => FarmingPet.isValid(item))
			.map((item) => new FarmingPet(item, options))
			.sort((a, b) => b.fortune - a.fortune);
	}
}

export function getPetLevel(pet: FarmingPetType, max = 100) {
	const levels = PET_LEVELS;
	const xp = pet.exp ?? 0;

	const levelIndex = levels.findIndex((level) => level > xp);

	if (levelIndex === -1 || levelIndex >= max) {
		return max;
	}

	return levelIndex + 1;
}
