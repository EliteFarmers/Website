import {
	FARMING_PETS,
	FARMING_PET_ITEMS,
	FarmingPetInfo,
	FarmingPetItemInfo,
	FarmingPetStatType,
	FarmingPetType,
	FarmingPets,
	PET_LEVELS,
} from '../items/pets';
import { Rarity, RARITY_COLORS } from '../constants/reforges';
import { getStatValue, Stat } from "../constants/stats";
import { getRarityFromLore } from '../util/itemstats';
import { EliteItemDto } from './item';
import { PlayerOptions } from '../player/player';

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

		if (!this.pet.uuid) {
			// Generate a UUID for the pet
			this.pet.uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		}

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
		const stats = getStatValue(this.info.stats?.[Stat.FarmingFortune], this.options);
		if (stats) {
			fortune += stats;
			breakdown['Base Stats'] = stats;
		}

		// Per level stats
		const perLevelStats = this.info.perLevelStats?.[Stat.FarmingFortune];
		if (perLevelStats) {
			const amount = getStatValue(perLevelStats, this.options) * this.level;
			fortune += amount;
			breakdown[perLevelStats.name ?? 'Unknown'] = amount;
		}

		// Per rarity fortune stats
		const perRarityStats = this.info.perRarityLevelStats?.[this.rarity]?.[Stat.FarmingFortune];
		if (perRarityStats) {
			const amount = getStatValue(perRarityStats, this.options) * this.level;
			fortune += amount;
			breakdown[perRarityStats.name ?? 'Rarity Stat'] = amount;
		}

		// Pet abilities
		if (this.info.abilities) {
			for (const ability of this.info.abilities) {
				if (ability.exists && !ability.exists(this.options ?? {}, this)) {
					continue;
				}

				const stats = ability.computed(this.options ?? {}, this);
				const fortuneStat = stats[Stat.FarmingFortune];

				const value = getStatValue(fortuneStat, this.options);
				if (!value || !fortuneStat) continue;

				fortune += value;
				breakdown[fortuneStat.name ?? ability.name] = value;
			}
		}

		// Pet item stats
		if (this.item) {
			const fortuneStat = this.item.stats?.[Stat.FarmingFortune];

			const value = getStatValue(fortuneStat, this.options);
			if (value && fortuneStat) {
				fortune += value;
				breakdown[this.item.name] = value;
			}
		}

		this.breakdown = breakdown;
		this.fortune = fortune;
		return fortune;
	}

	getFormattedName() {
		return '[' + this.level + '] ' + RARITY_COLORS[this.rarity] + this.info.name;
	}

	getChimeraAffectedStats(multiplier: number): Record<Stat, number> {
		const result: Record<string, number> = {};

		// Item stats
		for (const [key, stat] of Object.entries(this.item?.stats ?? {})) {
			const value = getStatValue(stat, this.options);
			if (result[key]) {
				result[key] += value * multiplier;
			} else {
				result[key] = value * multiplier;
			}
		}

		// Base stats
		for (const [key, stat] of Object.entries(this.info.stats ?? {})) {
			if (stat.type !== FarmingPetStatType.Base) continue;
			const value = getStatValue(stat, this.options);
			if (result[key]) {
				result[key] += value * multiplier;
			} else {
				result[key] = value * multiplier;
			}
		}

		// Per level stats
		for (const [key, stat] of Object.entries(this.info.perLevelStats ?? {})) {
			if (stat.type !== FarmingPetStatType.Base) continue;
			const value = getStatValue(stat, this.options);
			if (result[key]) {
				result[key] += value * this.level * multiplier;
			} else {
				result[key] = value * this.level * multiplier;
			}
		}

		return result;
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
