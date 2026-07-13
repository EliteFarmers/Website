export const OTHER_SITES = [
	{
		name: 'SkyCrypt',
		label: 'View more profile stats at SkyCrypt',
		url: ({ uuid, ign, profile }) => {
			return `https://sky.shiiyu.moe/stats/${uuid ?? ign}/${profile ?? ''}`;
		},
		rel: 'noopener',
	},
	{
		name: 'Plancke',
		label: 'General Hypixel player information at Plancke',
		url: ({ ign }) => {
			return `https://plancke.io/hypixel/player/stats/${ign}`;
		},
		rel: 'noopener noreferrer nofollow',
	},
	{
		name: 'nadeshiko',
		label: 'View more Hypixel stats at nadeshiko',
		url: ({ ign, uuid }) => {
			return `https://nadeshiko.io/player/${uuid ?? ign}`;
		},
		rel: 'noopener noreferrer nofollow',
	},
] as OtherSite[];

interface OtherSite {
	name: string;
	url: (opt: { uuid?: string; ign?: string; profile?: string }) => string;
	rel: string;
	label: string;
}
