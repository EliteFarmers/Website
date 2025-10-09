export interface GemPackage {
	gems: {
		base: number;
		bonus?: number;
	};
	cost: number;
	url: string;
}

export const SKYBLOCK_GEM_PACKAGES: GemPackage[] = [
	{
		gems: {
			base: 675,
		},
		cost: 4.99,
		url: 'https://store.hypixel.net/checkout/packages/add/4086443/single',
	},
	{
		gems: {
			base: 1350,
			bonus: 40,
		},
		cost: 9.99,
		url: 'https://store.hypixel.net/checkout/packages/add/4086446/single',
	},
	{
		gems: {
			base: 3375,
			bonus: 225,
		},
		cost: 24.99,
		url: 'https://store.hypixel.net/checkout/packages/add/4086447/single',
	},
	{
		gems: {
			base: 6750,
			bonus: 550,
		},
		cost: 49.99,
		url: 'https://store.hypixel.net/checkout/packages/add/4086452/single',
	},
	{
		gems: {
			base: 13500,
			bonus: 2900,
		},
		cost: 99.99,
		url: 'https://store.hypixel.net/checkout/packages/add/4086454/single',
	},
];
