import { Crop } from './crops.js';

export enum SpecialCrop {
	Cropie = 'Cropie',
	Squash = 'Squash',
	Fermento = 'Fermento',
	CondensedFermento = 'CondensedFermento',
	Helianthus = 'Helianthus',
	CondensedHelianthus = 'CondensedHelianthus',
}

export const SPECIAL_CROP_INFO = {
	[SpecialCrop.Cropie]: {
		id: 'CROPIE',
		name: 'Cropie',
		npc: 25_000,
		rates: [0.0003, 0.0003, 0.0004, 0.0005],
	},
	[SpecialCrop.Squash]: {
		id: 'SQUASH',
		name: 'Squash',
		npc: 75_000,
		rates: [0.0001, 0.0001, 0.0002, 0.0003],
	},
	[SpecialCrop.Fermento]: {
		id: 'FERMENTO',
		name: 'Fermento',
		npc: 250_000,
		rates: [0.00005, 0.00005, 0.00006, 0.00007],
	},
	[SpecialCrop.CondensedFermento]: {
		id: 'CONDENSED_FERMENTO',
		name: 'Condensed Fermento',
		npc: 2_250_000,
		rates: [0, 0, 0, 0],
	},
	[SpecialCrop.Helianthus]: {
		id: 'HELIANTHUS',
		name: 'Helianthus',
		npc: 275_000,
		rates: [0.00002, 0.00002, 0.00003, 0.00004],
	},
	[SpecialCrop.CondensedHelianthus]: {
		id: 'CONDENSED_HELIANTHUS',
		name: 'Condensed Helianthus',
		npc: 2_475_000,
		rates: [0, 0, 0, 0],
	},
};

export const MATCHING_SPECIAL_CROP: Record<Crop, SpecialCrop> = {
	[Crop.Wheat]: SpecialCrop.Cropie,
	[Crop.Carrot]: SpecialCrop.Cropie,
	[Crop.Potato]: SpecialCrop.Cropie,

	[Crop.CocoaBeans]: SpecialCrop.Squash,
	[Crop.Melon]: SpecialCrop.Squash,
	[Crop.Pumpkin]: SpecialCrop.Squash,

	[Crop.Cactus]: SpecialCrop.Fermento,
	[Crop.Mushroom]: SpecialCrop.Fermento,
	[Crop.NetherWart]: SpecialCrop.Fermento,
	[Crop.SugarCane]: SpecialCrop.Fermento,
	[Crop.Seeds]: SpecialCrop.Fermento,

	[Crop.Sunflower]: SpecialCrop.Helianthus,
	[Crop.Moonflower]: SpecialCrop.Helianthus,
	[Crop.WildRose]: SpecialCrop.Helianthus,
};
