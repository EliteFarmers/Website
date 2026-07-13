export const GUIDE_TYPE_OPTIONS: { label: string; value: string; description: string }[] = [
	{
		label: 'General',
		value: '0',
		description: 'Guides that do not fit one specific category',
	},
	{
		label: 'Farming',
		value: '1',
		description: 'Crop, pest, fortune, and garden progression guides',
	},
	{
		label: 'Greenhouse',
		value: '2',
		description: 'Greenhouse layouts, routing, and build setup guides',
	},
	{
		label: 'Contest',
		value: '3',
		description: 'Jacob contest strategies and preparation guides',
	},
	{
		label: 'Money Making',
		value: '4',
		description: 'Coins, market, and profit method guides',
	},
	{
		label: 'Builds',
		value: '5',
		description: 'Farm, island, and utility build guides',
	},
	{
		label: 'Tools',
		value: '6',
		description: 'Mod, calculator, resource pack, and utility guides',
	},
	{
		label: 'Events',
		value: '7',
		description: 'Limited-time event and seasonal activity guides',
	},
];

export const ALL_GUIDE_TYPE_OPTIONS: { label: string; value: string }[] = [
	{ label: 'All Types', value: '' },
	...GUIDE_TYPE_OPTIONS.map(({ label, value }) => ({ label, value })),
];
