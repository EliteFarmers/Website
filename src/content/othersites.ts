export const OTHER_SITES = [
	{
		name: 'SkyCrypt',
		url: ({ uuid, ign, profile }) => {
			return `https://sky.shiiyu.moe/stats/${uuid ?? ign}/${profile ?? ''}`;
		},
	},
	{
		name: 'Plancke',
		url: ({ ign }) => {
			return `https://plancke.io/hypixel/player/stats/${ign}`;
		},
	},
	{
		name: 'nadeshiko',
		url: ({ ign, uuid }) => {
			return `https://nadeshiko.io/player/${uuid ?? ign}`;
		},
	},
] as OtherSite[];

interface OtherSite {
	name: string;
	url: (opt: { uuid?: string; ign?: string; profile?: string }) => string;
}
