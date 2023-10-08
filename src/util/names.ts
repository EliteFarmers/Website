import { Crop } from '../constants/crops';

const CROP_DISPLAY_NAMES: Record<Crop, string> = {
	[Crop.Cactus]: 'Cactus',
	[Crop.Carrot]: 'Carrot',
	[Crop.CocoaBeans]: 'Cocoa Beans',
	[Crop.Melon]: 'Melon',
	[Crop.Mushroom]: 'Mushroom',
	[Crop.NetherWart]: 'Nether Wart',
	[Crop.Potato]: 'Potato',
	[Crop.Pumpkin]: 'Pumpkin',
	[Crop.SugarCane]: 'Sugar Cane',
	[Crop.Wheat]: 'Wheat',
	[Crop.Seeds]: 'Seeds',
};

export function CropDisplayName(crop: Crop) {
	return CROP_DISPLAY_NAMES[crop] ?? 'Unknown Crop';
}
