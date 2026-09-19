import { Crop, Pest } from 'farming-weight';

export const PEST_DISCORD_EMOJIS: Record<Pest, string> = {
	[Pest.Beetle]: '<:beetle:1263608633846005913>',
	[Pest.Cricket]: '<:cricket:1263608648614285463>',
	[Pest.Fly]: '<:fly:1263608664573350008>',
	[Pest.Locust]: '<:locust:1263608676418064415>',
	[Pest.Mite]: '<:mite:1263608688405381210>',
	[Pest.Mosquito]: '<:mosquito:1263608701172973631>',
	[Pest.Moth]: '<:moth:1263608714338893916>',
	[Pest.Rat]: '<:rat:1263608728817635439>',
	[Pest.Slug]: '<:slug:1263608740700098691>',
	[Pest.Worm]: '<:worm:1263608767363158139>',
	[Pest.LunarMoth]: '<:lunar_moth:1550705939961745459>',
	[Pest.Mantis]: '<:mantis:1450016082541805588>',
	[Pest.Firefly]: '<:firefly:1450016081497423956>',
	[Pest.Dragonfly]: '<:dragonfly:1450016080444522518>',
	[Pest.Mouse]: '<:mouse:1550706387347046412>',
};

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
