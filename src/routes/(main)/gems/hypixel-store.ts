export interface GemPackage {
	gems: {
		base: number;
		bonus?: number;
	};
	cost: number;
	url: string;
}

export const STORE_CODE = {
	code: 'SWEET',
	youtube: 'https://www.youtube.com/@SweetBootieee',
	uuid: '13e823891b29408f8b8ea3272001a4e6',
};

export const SKYBLOCK_GEM_PACKAGES: GemPackage[] = [
	{
		gems: {
			base: 700,
		},
		cost: 5.99,
		url: 'https://store.hypixel.net/checkout/packages/add/7395187/single',
	},
	{
		gems: {
			base: 1750,
			bonus: 50,
		},
		cost: 14.99,
		url: 'https://store.hypixel.net/checkout/packages/add/7395189/single',
	},
	{
		gems: {
			base: 3500,
			bonus: 250,
		},
		cost: 29.99,
		url: 'https://store.hypixel.net/checkout/packages/add/7395191/single',
	},
	{
		gems: {
			base: 7000,
			bonus: 600,
		},
		cost: 59.99,
		url: 'https://store.hypixel.net/checkout/packages/add/7395193/single',
	},
	{
		gems: {
			base: 14000,
			bonus: 3000,
		},
		cost: 119.99,
		url: 'https://store.hypixel.net/checkout/packages/add/7395194/single',
	},
];
