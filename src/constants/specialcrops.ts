import { Crop } from './crops.js';

export enum SpecialCrop {
	Cropie = 'Cropie',
	Squash = 'Squash',
	Fermento = 'Fermento',
}

export const SPECIAL_CROP_INFO = {
	[SpecialCrop.Cropie]: {
		name: 'Cropie',
		npc: 25_000,
		rates: [0.0003, 0.0003, 0.0004, 0.0005],
	},
	[SpecialCrop.Squash]: {
		name: 'Squash',
		npc: 75_000,
		rates: [0.0001, 0.0001, 0.0002, 0.0003],
	},
	[SpecialCrop.Fermento]: {
		name: 'Fermento',
		npc: 250_000,
		rates: [0.00005, 0.00005, 0.00006, 0.00007],
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
};
