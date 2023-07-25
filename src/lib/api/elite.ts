import createClient from 'openapi-fetch';
import type { components, paths } from './api';
import { ELITE_API_URL } from '$env/static/private';

if (process.env.NODE_ENV === 'development') {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// eslint-disable-next-line @typescript-eslint/unbound-method
const { GET, POST, DELETE, PATCH, PUT } = createClient<paths>({
	baseUrl: ELITE_API_URL,
});

export const GetAuthorizedAccount = async (accessToken: string) =>
	await GET('/Account', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetAccount = async (playerUuidOrIgn: string) =>
	await GET('/Account/{playerUuidOrIgn}', {
		params: {
			path: {
				playerUuidOrIgn,
			},
		},
	});

export const GetAccountByDiscordId = async (discordId: number) =>
	await GET('/Account/{discordId}', {
		params: {
			path: {
				discordId,
			},
		},
	});

export const GetPlayer = async (playerUuidOrIgn: string) =>
	await GET('/Player/{playerUuidOrIgn}', {
		params: {
			path: {
				playerUuidOrIgn,
			},
		},
	});

export const GetPlayerByDiscordId = async (id: string) =>
	await GET('/Player/{discordId}', {
		params: {
			path: {
				discordId: id as unknown as number,
			},
		},
	});

export const GetProfiles = async (playerUuid: string) =>
	await GET('/Profiles/{playerUuid}', {
		params: {
			path: {
				playerUuid,
			},
		},
	});

export const GetProfile = async (profileUuid: string) =>
	await GET('/Profile/{profileUuid}', {
		params: {
			path: {
				profileUuid,
			},
		},
	});

export const GetProfileMember = async (playerUuid: string, profileUuid: string) =>
	await GET('/Profile/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
		},
	});

export const GetSelectedProfileMember = async (playerUuid: string) =>
	await GET('/Profile/{uuid}/Selected', {
		params: {
			path: {
				uuid: playerUuid,
			},
		},
	});

export const GetPlayerRanks = async (playerUuid: string, profileUuid: string) =>
	await GET('/Leaderboard/ranks/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
		},
	});

export const GetPlayerContests = async (playerUuid: string, profileUuid: string) =>
	await GET('/Contests/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
		},
	});

export const GetContests = async (timestamp: number) =>
	await GET('/Contests/{timestamp}', {
		params: {
			path: {
				timestamp,
			},
		},
	});

export const GetYearlyContests = async (year: number) =>
	await GET('/Contests/at/{year}', {
		params: {
			path: {
				year,
			},
		},
	});

export const GetMonthlyContests = async (year: number, month: number) =>
	await GET('/Contests/at/{year}/{month}', {
		params: {
			path: {
				year,
				month,
			},
		},
	});

export const GetCurrentYearContests = async () => await GET('/Contests/at/now', {});

export const SetPrimaryAccount = async (playerUuidOrIgn: string, accessToken: string) =>
	await POST('/Account/primary/{playerUuidOrIgn}', {
		params: {
			path: {
				playerUuidOrIgn,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const LinkAccount = async (playerUuidOrIgn: string, accessToken: string) =>
	await POST('/Account/{playerUuidOrIgn}', {
		params: {
			path: {
				playerUuidOrIgn,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const UnlinkAccount = async (playerUuidOrIgn: string, accessToken: string) =>
	await DELETE('/Account/{playerUuidOrIgn}', {
		params: {
			path: {
				playerUuidOrIgn,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetUsersGuilds = async (accessToken: string) =>
	await GET('/User/Guilds', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetGuild = async (guildId: string, accessToken: string) =>
	await GET('/User/Guild/{guildId}', {
		params: {
			path: {
				guildId: guildId as unknown as number
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetGuildJacob = async (guildId: string, accessToken: string) =>
	await GET('/User/Guild/{guildId}/Jacob', {
		params: {
			path: {
				guildId: guildId as unknown as number
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const PatchGuildJacob = async (guildId: string, accessToken: string, jacob: components['schemas']['GuildJacobLeaderboardFeature']) =>
	await PATCH('/User/Guild/{guildId}/Jacob', {
		params: {
			path: {
				guildId: guildId as unknown as number
			},
		},
		body: jacob,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const AddGuildJacobLeadeboard = async (guildId: string, accessToken: string, leaderboard: components['schemas']['GuildJacobLeaderboard']) =>
	await POST('/User/Guild/{guildId}/Jacob/Leaderboard', {
		params: {
			path: {
				guildId: guildId as unknown as number
			},
		},
		body: leaderboard,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const UpdateGuildJacobLeadeboard = async (guildId: string, accessToken: string, leaderboard: components['schemas']['GuildJacobLeaderboard']) =>
	await PUT('/User/Guild/{guildId}/Jacob/{lbId}', {
		params: {
			path: {
				guildId: guildId as unknown as number,
				lbId: leaderboard.id ?? '' 
			},
		},
		body: leaderboard,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const DeleteGuildJacobLeadeboard = async (guildId: string, accessToken: string, leaderboardId: string) =>
	await DELETE('/User/Guild/{guildId}/Jacob/{lbId}', {
		params: {
			path: {
				guildId: guildId as unknown as number,
				lbId: leaderboardId
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetProfilesWeights = async (playerUuid: string) =>
	await GET('/Weight/{playerUuid}', {
		params: {
			path: {
				playerUuid,
			},
		},
	});

export const GetLeaderboardSlice = async (leaderboardId: string, offset: number, limit: number) =>
	await GET('/Leaderboard/{id}', {
		params: {
			path: {
				id: leaderboardId,
			},
			query: {
				offset,
				limit,
			},
		},
	});

export const GetSkillLeaderboardSlice = async (skillName: string, offset: number, limit: number) =>
	await GET('/Leaderboard/skill/{skillName}', {
		params: {
			path: {
				skillName,
			},
			query: {
				offset,
				limit,
			},
		},
	});

export const GetCollectionLeaderboardSlice = async (collection: string, offset: number, limit: number) =>
	await GET('/Leaderboard/collection/{collection}', {
		params: {
			path: {
				collection,
			},
			query: {
				offset,
				limit,
			},
		},
	});

export const GetPlayersRank = async (
	leaderboardId: string,
	playerUuid: string,
	profileUuid: string,
	upcoming = false
) =>
	await GET('/Leaderboard/rank/{leaderboardId}/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				leaderboardId,
				playerUuid,
				profileUuid,
			},
			query: {
				includeUpcoming: upcoming,
			},
		},
	});

export type AuthorizedUser = components['schemas']['AuthorizedAccountDto'];
export type LeaderboardEntry = components['schemas']['LeaderboardEntryDto'];
export interface UserInfo {
	id: string;
	username: string;
	avatar: string;
	primaryUuid?: string;
	primaryName?: string;
}
