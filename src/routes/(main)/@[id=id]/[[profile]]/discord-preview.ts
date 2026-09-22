import type { ProfileMemberDto, LeaderboardRanksResponse, MinecraftAccountDto, ProfileDetailsDto } from '$lib/api';
import { env } from '$env/dynamic/public';
import { API_CROP_TO_CROP, CROP_DISCORD_EMOJIS, CROP_UNICODE_EMOJIS } from '$lib/constants/crops';
import {
	getDiscordPestEmoji,
	previewCrop,
	previewPest,
	previewNumber,
	previewText,
	type PreviewCard,
} from '$lib/discord-preview';
import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';

type RankLink = (category: string, rank: number, label?: string) => string;
type RankedStat = (label: string, value: number | bigint | null | undefined, category?: string) => string;

export function createPreview(
	data: {
		account: MinecraftAccountDto;
		profile?: ProfileDetailsDto;
		member?: ProfileMemberDto | null;
		ranks?: LeaderboardRanksResponse['ranks'] | null;
	},
	url: URL,
	statsDescription?: string
): PreviewCard | null {
	const profile = data.profile;
	if (!profile) return null;
	const member = data.member;
	const tab = url.pathname.split('/').at(-1) ?? '';
	const titles: Record<string, string> = {
		garden: 'Garden',
		contests: 'Contests',
		ranks: 'Rankings',
		charts: 'Progress',
		fortune: 'Farming Fortune',
		'pest-farming': 'Pest Farming',
	};
	const base = '/@' + data.account.id + '/' + profile.profileId;
	const weight = member?.farmingWeight;
	const ranks = data.ranks;

	const rankLink: RankLink = (category, rank, label = rank.toLocaleString()) => {
		if (!Number.isFinite(rank) || rank <= 0) return `#${label}`;
		const href = new URL(
			`/leaderboard/${encodeURIComponent(category)}/${data.account.id}-${profile.profileId}?fallback=${rank}`,
			env.PUBLIC_CANONICAL_URL || env.PUBLIC_HOST_URL || url.origin
		);
		return `[#${label}](<${href.href}>)`;
	};

	const rankedStat: RankedStat = (label, value, category) => {
		const formatted = previewNumber(value);
		if (formatted === undefined) return '';
		const rank = category ? ranks?.[category]?.rank : undefined;
		return `${label} - **${formatted}**${category && rank && rank > 0 ? ` (${rankLink(category, rank)})` : ''}`;
	};
	const totalWeight = weight?.totalWeight ?? profile.members.find((m) => m.uuid === data.account.id)?.farmingWeight;

	const headerLines = [
		rankedStat(
			'<:ff:1450022749631287330> Farming Weight',
			totalWeight == null ? undefined : Math.round(totalWeight),
			'farmingweight'
		),
		rankedStat('⭐ Skyblock Level', member ? member.skyblockXp / 100 : undefined, 'skyblockxp'),
	].filter(Boolean);

	const summary = statsDescription
		? formatStatsDescription(statsDescription, ranks, rankLink).split('\n')
		: undefined;
	const isHeaderStat = (line: string) => line.includes(' Farming Weight - ') || line.includes(' Skyblock Level - ');

	const lines = summary
		? [
				summary
					.filter((line) => !isHeaderStat(line))
					.join('\n')
					.replace(/\n{3,}/g, '\n\n')
					.trim(),
			]
		: subpageLines(tab, member, ranks, rankedStat, rankLink);

	return {
		title: `${data.account.name} (${profile.profileName}) `,
		headerLines,
		image: 'https://skins.mcstats.com/bust/' + data.account.id,
		lines,
		links: [
			{ label: 'View ' + (titles[tab] || 'profile'), path: url.pathname },
			{
				label: tab === 'fortune' ? 'Pest Farming' : 'Farming Fortune',
				path: base + (tab === 'fortune' ? '/pest-farming' : '/fortune'),
			},
		],
	};
}

function subpageLines(
	tab: string,
	member: ProfileMemberDto | null | undefined,
	ranks: LeaderboardRanksResponse['ranks'] | null | undefined,
	stat: RankedStat,
	rankLink: RankLink
): string[] {
	if (tab === 'ranks') {
		const entries = Object.entries(ranks ?? {}).filter(([, rank]) => Number.isFinite(rank.rank) && rank.rank > 0);
		entries.sort((a, b) => a[1].rank - b[1].rank || a[0].localeCompare(b[0]));
		return [
			'### Best Leaderboard Positions',
			entries.length
				? `**${previewNumber(entries.length)}** ranked leaderboards · **${previewNumber(entries.filter(([, rank]) => rank.rank <= 1_000).length)}** top 1,000 positions`
				: 'No leaderboard positions available.',
			entries
				.slice(0, 5)
				.map(
					([key, rank]) =>
						`${rankLink(key, rank.rank)} · ${getDiscordPestEmoji(key) ? previewPest(key, rank.title) : key === 'pests' ? previewPest('beetle', rank.title) : previewCrop(key.split('-')[0], rank.title)}`
				)
				.join('\n'),
		];
	}
	if (tab === 'fortune') return ['### Farming Fortune', 'View your rates and cheapest fortune upgrades here!'];
	if (!member) return [];
	const garden = member.garden;
	const jacob = member.jacob;
	const farmingLevel = member.api.skills ? member.stats?.skills?.levels?.farming?.level : undefined;
	const cropLevels = (values: Record<string, number>, label: string) =>
		Object.entries(values)
			.filter(([, value]) => value > 0)
			.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
			.slice(0, 3)
			.map(([crop, value]) => `${previewCrop(crop)} · ${label} **${previewNumber(value)}**`)
			.join('\n');

	switch (tab) {
		case 'garden': {
			if (!garden) return ['### Garden', 'No Garden data recorded for this profile.'];
			const milestones = cropLevels({ ...garden.cropMilestoneLevels }, 'Milestone');
			return [
				'### Garden',
				[
					stat('Garden Level', garden.gardenLevel, 'garden'),
					`-# ${previewNumber(garden.experience)} Garden XP`,
				].join('\n'),
				[
					stat('Visitors served', garden.completedVisitors, 'visitors-accepted'),
					`**${previewNumber(garden.uniqueVisitors)}** unique visitors · **${garden.plots.length}** plots unlocked`,
				].join('\n'),
				milestones ? `\n**Highest Crop Milestones**\n${milestones}` : '',
				`\n**${previewNumber(member.unparsed.copper)}** Copper · **${Object.values(garden.composter?.upgrades ?? {}).reduce((total, value) => total + value, 0)}** Composter upgrade levels`,
			];
		}
		case 'contests': {
			const medals = jacob.earnedMedals;
			const latest = jacob.contests.reduce<(typeof jacob.contests)[number] | undefined>(
				(last, contest) => (!last || contest.timestamp > last.timestamp ? contest : last),
				undefined
			);
			const latestResult = latest
				? [
						latest.medal === 'ghost'
							? 'Not claimable'
							: latest.position >= 0
								? `#${previewNumber(latest.position + 1)} of ${previewNumber(latest.participants)}`
								: 'Unclaimed',
						latest.medal &&
						['diamond', 'platinum', 'gold', 'silver', 'bronze'].includes(latest.medal.toLowerCase())
							? `${previewText(latest.medal)} medal`
							: '',
					]
						.filter(Boolean)
						.join(' · ')
				: '';
			return [
				'### Jacob’s Contests',
				[
					stat('Contests entered', jacob.participations, 'participations'),
					stat('First place finishes', jacob.firstPlaceScores, 'firstplace'),
				].join('\n'),
				`\n**Medals Earned**\n${previewNumber(medals.diamond)} Diamond · ${previewNumber(medals.platinum)} Platinum · ${previewNumber(medals.gold)} Gold\n${previewNumber(medals.silver)} Silver · ${previewNumber(medals.bronze)} Bronze`,
				`**${jacob.uniqueGoldMedals}** crops with a gold medal`,
				latest
					? `\n**Latest Contest** · <t:${latest.timestamp}:R>\n${previewCrop(latest.crop)} · **${previewNumber(latest.collected)}** collected\n${latestResult}`
					: '',
			];
		}
		case 'pest-farming': {
			const pests = Object.entries(member.farmingWeight.pests);
			const topPests = pests
				.filter(([, kills]) => kills > 0)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 3);
			return [
				'### Pest Farming',
				stat(
					previewPest('beetle', 'Total pest kills'),
					pests.reduce((total, [, kills]) => total + kills, 0)
				),
				topPests.length
					? `\n**Most Hunted Pests**\n${topPests.map(([pest, kills]) => stat(previewPest(pest), kills, pest === 'lunarMoth' ? 'lunar-moth' : pest.toLowerCase())).join('\n')}`
					: '',
				'\nCompare Farm, Spawn, and Kill loadouts and upgrades on the full page.',
			];
		}
		case 'charts': {
			const crops = Object.entries(member.collections)
				.filter(([crop]) => API_CROP_TO_CROP[crop])
				.sort(
					(a, b) =>
						(member.farmingWeight.cropWeight[getCropDisplayName(getCropFromName(b[0]))] ?? 0) -
						(member.farmingWeight.cropWeight[getCropDisplayName(getCropFromName(a[0]))] ?? 0)
				)
				.slice(0, 3);
			return [
				'### Collection & Skill Progress',
				member.api.skills ? stat('📜 Total Farming XP', Math.round(member.skills.farming), 'farming') : '',
				member.api.collections && crops.length
					? `\n**Current Top Collections**\n${crops.map(([crop, amount]) => stat(previewCrop(crop), amount, API_CROP_TO_CROP[crop])).join('\n')}`
					: '',
				'\nExplore collection, pest, and skill history across different date ranges.',
			];
		}
		default:
			return ['### Farming Stats', stat('📜 Farming Level', farmingLevel, 'farming')];
	}
}

function formatStatsDescription(
	description: string,
	ranks: LeaderboardRanksResponse['ranks'] | null | undefined,
	rankLink: RankLink
): string {
	let summary = description.replace('🌾', '<:ff:1450022749631287330>');
	const categories: Record<string, string> = {
		'Farming Weight': 'farmingweight',
		'Farming Level': 'farming',
		'Skyblock Level': 'skyblockxp',
	};
	for (const crop of Object.values(Crop)) {
		const name = getCropDisplayName(crop);
		summary = summary.replaceAll(`${CROP_UNICODE_EMOJIS[crop]} ${name}`, `${CROP_DISCORD_EMOJIS[crop]} ${name}`);
		if (API_CROP_TO_CROP[crop]) categories[name] = API_CROP_TO_CROP[crop];
	}
	return summary
		.split('\n')
		.map((line) => {
			const category = Object.entries(categories).find(([label]) => line.includes(` ${label} - `))?.[1];
			const rank = category ? ranks?.[category]?.rank : undefined;
			if (!category || rank == null || rank <= 0) return line;
			return line.replace(/\(#([^)]*)\)$/, (_, label: string) => `(${rankLink(category, rank, label)})`);
		})
		.join('\n');
}
