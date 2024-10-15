export const OTHER_SITES = [
	{
		name: 'SkyCrypt',
		url: (player, profile) => {
			return `https://sky.shiiyu.moe/stats/${player}/${profile ?? ''}`;
		},
	},
	{
		name: 'Plancke',
		url: (player) => {
			return `https://plancke.io/hypixel/player/stats/${player}`;
		},
	},
	{
		name: 'nadeshiko',
		url: (player) => {
			return `https://nadeshiko.io/player/${player}`;
		},
	},
] as OtherSite[];

interface OtherSite {
	name: string;
	url: (player: string, profile?: string) => string;
}