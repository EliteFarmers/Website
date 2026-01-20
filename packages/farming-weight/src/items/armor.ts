import { SpecialCrop } from '../constants/specialcrops.js';
import { Stat } from '../constants/stats.js';
import {
    BiohazardBoots,
    BiohazardChestplate,
    BiohazardHelmet,
    BiohazardLeggings,
    CropieBoots,
    CropieChestplate,
    CropieHelmet,
    CropieLeggings,
    FarmArmorBoots,
    FarmArmorChestplate,
    FarmArmorHelmet,
    FarmArmorLeggings,
    FarmerBoots,
    FermentoBoots,
    FermentoChestplate,
    FermentoHelmet,
    FermentoLeggings,
    HelianthusBoots,
    HelianthusChestplate,
    HelianthusHelmet,
    HelianthusLeggings,
    LanternHelmet,
    MelonBoots,
    MelonChestplate,
    MelonHelmet,
    MelonLeggings,
    MushroomBoots,
    MushroomChestplate,
    MushroomHelmet,
    MushroomLeggings,
    RabbitBoots,
    RabbitChestplate,
    RabbitHelmet,
    RabbitLeggings,
    RanchersBoots,
    SquashBoots,
    SquashChestplate,
    SquashHelmet,
    SquashLeggings,
} from './armor/index.js';
import { GEAR_SLOTS, GearSlot, type GearSlotInfo, type ItemDefinition } from './definitions.js';

export { GEAR_SLOTS, GearSlot, type ItemDefinition as FarmingArmorInfo, type GearSlotInfo };

type FarmingArmorInfo = ItemDefinition;

export const FARMING_ARMOR_INFO: Record<string, FarmingArmorInfo> = {
	FARMER_BOOTS: new FarmerBoots(),
	RANCHERS_BOOTS: new RanchersBoots(),
	ENCHANTED_JACK_O_LANTERN: new LanternHelmet(),
	FARM_ARMOR_HELMET: new FarmArmorHelmet(),
	FARM_ARMOR_CHESTPLATE: new FarmArmorChestplate(),
	FARM_ARMOR_LEGGINGS: new FarmArmorLeggings(),
	FARM_ARMOR_BOOTS: new FarmArmorBoots(),
	RABBIT_HELMET: new RabbitHelmet(),
	RABBIT_CHESTPLATE: new RabbitChestplate(),
	RABBIT_LEGGINGS: new RabbitLeggings(),
	RABBIT_BOOTS: new RabbitBoots(),
	MELON_HELMET: new MelonHelmet(),
	MELON_CHESTPLATE: new MelonChestplate(),
	MELON_LEGGINGS: new MelonLeggings(),
	MELON_BOOTS: new MelonBoots(),
	CROPIE_HELMET: new CropieHelmet(),
	CROPIE_CHESTPLATE: new CropieChestplate(),
	CROPIE_LEGGINGS: new CropieLeggings(),
	CROPIE_BOOTS: new CropieBoots(),
	SQUASH_HELMET: new SquashHelmet(),
	SQUASH_CHESTPLATE: new SquashChestplate(),
	SQUASH_LEGGINGS: new SquashLeggings(),
	SQUASH_BOOTS: new SquashBoots(),
	FERMENTO_HELMET: new FermentoHelmet(),
	FERMENTO_CHESTPLATE: new FermentoChestplate(),
	FERMENTO_LEGGINGS: new FermentoLeggings(),
	FERMENTO_BOOTS: new FermentoBoots(),
	HELIANTHUS_HELMET: new HelianthusHelmet(),
	HELIANTHUS_CHESTPLATE: new HelianthusChestplate(),
	HELIANTHUS_LEGGINGS: new HelianthusLeggings(),
	HELIANTHUS_BOOTS: new HelianthusBoots(),
	MUSHROOM_HELMET: new MushroomHelmet(),
	MUSHROOM_CHESTPLATE: new MushroomChestplate(),
	MUSHROOM_LEGGINGS: new MushroomLeggings(),
	MUSHROOM_BOOTS: new MushroomBoots(),
	BIOHAZARD_HELMET: new BiohazardHelmet(),
	BIOHAZARD_CHESTPLATE: new BiohazardChestplate(),
	BIOHAZARD_LEGGINGS: new BiohazardLeggings(),
	BIOHAZARD_BOOTS: new BiohazardBoots(),
};

export type ArmorSetBonusStats = Partial<Record<number, Partial<Record<Stat, number>>>>;

export interface ArmorSetBonus {
	name: string;
	piecePotential?: Partial<Record<Stat, number>>;
	stats: ArmorSetBonusStats;
	special?: SpecialCrop[];
}

export const ARMOR_SET_BONUS: Record<string, ArmorSetBonus> = {
	RABBIT: {
		name: 'Bonus Farming Fortune',
		stats: {
			4: {
				[Stat.FarmingFortune]: 10,
			},
		},
	},
	MELON: {
		name: 'Cropier Crops',
		piecePotential: {
			[Stat.FarmingFortune]: 10,
		},
		stats: {
			2: {
				[Stat.FarmingFortune]: 10,
			},
			3: {
				[Stat.FarmingFortune]: 20,
			},
			4: {
				[Stat.FarmingFortune]: 30,
			},
		},
		special: [SpecialCrop.Cropie],
	},
	CROPIE: {
		name: 'Squashbuckle',
		piecePotential: {
			[Stat.FarmingFortune]: 15,
		},
		stats: {
			2: {
				[Stat.FarmingFortune]: 15,
			},
			3: {
				[Stat.FarmingFortune]: 30,
			},
			4: {
				[Stat.FarmingFortune]: 45,
			},
		},
		special: [SpecialCrop.Squash],
	},
	SQUASH: {
		name: 'Mento Fermento',
		piecePotential: {
			[Stat.FarmingFortune]: 20,
		},
		stats: {
			2: {
				[Stat.FarmingFortune]: 20,
			},
			3: {
				[Stat.FarmingFortune]: 40,
			},
			4: {
				[Stat.FarmingFortune]: 60,
			},
		},
		special: [SpecialCrop.Fermento],
	},
	FERMENTO: {
		name: 'Feast',
		piecePotential: {
			[Stat.FarmingFortune]: 25,
		},
		stats: {
			2: {
				[Stat.FarmingFortune]: 25,
			},
			3: {
				[Stat.FarmingFortune]: 50,
			},
			4: {
				[Stat.FarmingFortune]: 75,
			},
		},
		special: [SpecialCrop.Cropie, SpecialCrop.Squash, SpecialCrop.Fermento, SpecialCrop.Helianthus],
	},
	HELIANTHUS: {
		name: 'Feast',
		piecePotential: {
			[Stat.FarmingFortune]: 25,
		},
		stats: {
			2: {
				[Stat.FarmingFortune]: 25,
			},
			3: {
				[Stat.FarmingFortune]: 50,
			},
			4: {
				[Stat.FarmingFortune]: 75,
			},
		},
		special: [SpecialCrop.Cropie, SpecialCrop.Squash, SpecialCrop.Fermento, SpecialCrop.Helianthus],
	},
	PESTHUNTERS: {
		name: 'Eradicator',
		stats: {
			2: {
				[Stat.PestKillFortune]: 50,
			},
			3: {
				[Stat.PestKillFortune]: 75,
			},
			4: {
				[Stat.PestKillFortune]: 100,
			},
		},
	},
};
