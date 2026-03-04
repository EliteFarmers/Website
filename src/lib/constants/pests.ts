import { Crop } from 'farming-weight';

export const CROP_TO_PEST: Record<Crop, string> = {
	[Crop.Cactus]: 'mite',
	[Crop.Carrot]: 'cricket',
	[Crop.CocoaBeans]: 'moth',
	[Crop.Melon]: 'earthworm',
	[Crop.Mushroom]: 'slug',
	[Crop.NetherWart]: 'beetle',
	[Crop.Potato]: 'locust',
	[Crop.Pumpkin]: 'rat',
	[Crop.SugarCane]: 'mosquito',
	[Crop.Wheat]: 'fly',
	[Crop.Seeds]: 'fly',
	[Crop.Sunflower]: 'dragonfly',
	[Crop.Moonflower]: 'firefly',
	[Crop.WildRose]: 'mantis',
};
