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
		name: 'Lumini',
		role: 'Custom art for the website (crop icons, medals, etc)',
		links: [
			{
				name: 'Etsy (Crop Stickers)',
				url: 'https://www.etsy.com/listing/1499421785/pixelated-crop-stickers',
			},
			{
				name: 'Ko-Fi',
				url: 'https://ko-fi.com/shoppelumini',
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
		name: 'ic22487',
		role: 'Hypixel+ texture pack author/artist, primarily seen here for farming tool textures',
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
		name: 'SkyHelper',
		role: 'Networth calculations and item prices',
		links: [
			{
				name: 'GitHub',
				url: 'https://github.com/Altpapier/SkyHelper-Networth',
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
		name: 'Shadcn-Svelte',
		role: 'UI Framework with Lucide icons',
		links: [
			{
				name: 'Website',
				url: 'https://www.shadcn-svelte.com/',
			},
			{
				name: 'Lucide',
				url: 'https://lucide.dev/',
			},
		],
	},
	{
		name: 'SkyCrypt',
		role: 'Some inspiration, but the website is not based on it',
		links: [
			{
				name: 'GitHub',
				url: 'https://github.com/SkyCryptWebsite/SkyCryptv2',
			},
			{
				name: 'Website',
				url: 'https://sky.shiiyu.moe/',
			},
			{
				name: 'Patreon',
				url: 'https://www.patreon.com/shiiyu',
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
