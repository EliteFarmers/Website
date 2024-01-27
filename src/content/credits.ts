interface Credit {
	name: string;
	role: string;
	links: {
		name: string;
		url: string;
	}[];
}

export const CREDITS: Credit[] = [
	{
		name: 'Kaeso',
		role: 'Main developer of the Website/Bot/API',
		links: [
			{
				name: 'GitHub',
				url: 'https://github.com/ptlthg',
			},
			{
				name: 'Ko-Fi',
				url: 'https://ko-fi.com/kaeso',
			},
			{
				name: 'Profile',
				url: '/@7da0c47581dc42b4962118f8049147b7',
			},
		],
	},
	{
		name: 'Bankhier',
		role: 'Help with original weight calculations and max farming fortune rates',
		links: [
			{
				name: 'Profile',
				url: '/@ac01147ed01a47d1b5777b31ccf5e616',
			},
		],
	},
	{
		name: 'Lumini',
		role: 'Custom art for the website (crop icons, medals, etc)',
		links: [
			{
				name: 'Etsy (Crop Stickers)',
				url: 'https://www.etsy.com/listing/1499421785/pixelated-crop-stickers',
			},
		],
	},
	{
		name: 'ic22487',
		role: 'Hypixel+ texture pack author/artist, primary seen here for farming tool textures',
		links: [
			{
				name: 'Ko-Fi',
				url: 'https://ko-fi.com/ic22487',
			},
			{
				name: 'Hypixel+',
				url: 'https://modrinth.com/resourcepack/hypixel-plus',
			},
		],
	},
	{
		name: 'MelonKingDe',
		role: 'Website Logo',
		links: [
			{
				name: 'Profile',
				url: '/@bd082a55373e4305bee348b9060e16c9',
			},
		],
	},
	{
		name: 'Hypixel',
		role: "Player data comes from Hypixel's API, as well as the minion icons",
		links: [
			{
				name: 'Website',
				url: 'https://hypixel.net/',
			},
		],
	},
	{
		name: 'MCHeads',
		role: 'Player model images',
		links: [
			{
				name: 'Website',
				url: 'https://mc-heads.net/',
			},
		],
	},
	{
		name: 'Flowbite',
		role: 'UI Framework and Icons',
		links: [
			{
				name: 'Website',
				url: 'https://flowbite-svelte.com/',
			},
		],
	},
	{
		name: 'SkyCrypt',
		role: 'Some inspiration, but the website is not based on it',
		links: [
			{
				name: 'GitHub',
				url: 'https://github.com/SkyCryptWebsite/SkyCrypt',
			},
			{
				name: 'Website',
				url: 'https://sky.shiiyu.moe/',
			},
		],
	},
	{
		name: 'Elite Skyblock Farmers',
		role: 'Feedback and support',
		links: [
			{
				name: 'Discord',
				url: '/discord',
			},
		],
	},
];
