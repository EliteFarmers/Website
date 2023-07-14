import createClient from 'openapi-fetch';
import type { components, paths } from './api';
import { ELITE_API_URL, NODE_ENV } from '$env/static/private';

if (NODE_ENV === 'development') {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// eslint-disable-next-line @typescript-eslint/unbound-method
const { get, post, del } = createClient<paths>({
	baseUrl: ELITE_API_URL,
});

export const GetAuthorizedAccount = async (accessToken: string) =>
	await get('/Account', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetAccount = async (playerUuidOrIgn: string) =>
	await get('/Account/{playerUuidOrIgn}', {
		params: {
			path: {
				playerUuidOrIgn,
			},
		},
	});

export const GetAccountByDiscordId = async (discordId: number) =>
	await get('/Account/{discordId}', {
		params: {
			path: {
				discordId,
			},
		},
	});

export const GetPlayer = async (playerUuidOrIgn: string) =>
	await get('/Player/{playerUuidOrIgn}', {
		params: {
			path: {
				playerUuidOrIgn,
			},
		},
	});

export const GetPlayerByDiscordId = async (id: string) =>
	await get('/Player/{discordId}', {
		params: {
			path: {
				discordId: id as unknown as number,
			},
		},
	});

export const GetProfiles = async (playerUuid: string) =>
	await get('/Profiles/{playerUuid}', {
		params: {
			path: {
				playerUuid,
			},
		},
	});

export const GetProfile = async (profileUuid: string) =>
	await get('/Profile/{profileUuid}', {
		params: {
			path: {
				profileUuid,
			},
		},
	});

export const GetProfileMember = async (playerUuid: string, profileUuid: string) =>
	await get('/Profile/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
		},
	});

export const GetSelectedProfileMember = async (playerUuid: string) =>
	await get('/Profile/{uuid}/Selected', {
		params: {
			path: {
				uuid: playerUuid,
			},
		},
	});

export const GetPlayerRanks = async (playerUuid: string, profileUuid: string) =>
	await get('/Leaderboard/ranks/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
		},
	});

export const GetPlayerContests = async (playerUuid: string, profileUuid: string) =>
	await get('/Contests/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
		},
	});

export const GetContests = async (timestamp: number) =>
	await get('/Contests/{timestamp}', {
		params: {
			path: {
				timestamp,
			},
		},
	});

export const GetYearlyContests = async (year: number) =>
	await get('/Contests/at/{year}', {
		params: {
			path: {
				year,
			},
		},
	});

export const GetMonthlyContests = async (year: number, month: number) =>
	await get('/Contests/at/{year}/{month}', {
		params: {
			path: {
				year,
				month,
			},
		},
	});

export const GetCurrentYearContests = async () => await get('/Contests/at/now', {});

export const SetPrimaryAccount = async (playerUuidOrIgn: string, accessToken: string) =>
	await post('/Account/primary/{playerUuidOrIgn}', {
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
	await post('/Account/{playerUuidOrIgn}', {
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
	await del('/Account/{playerUuidOrIgn}', {
		params: {
			path: {
				playerUuidOrIgn,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetLeaderboardSlice = async (leaderboardId: string, offset: number, limit: number) =>
	await get('/Leaderboard/{id}', {
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
	await get('/Leaderboard/skill/{skillName}', {
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
	await get('/Leaderboard/collection/{collection}', {
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
	await get('/Leaderboard/rank/{leaderboardId}/{playerUuid}/{profileUuid}', {
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
export type LeaderboardEntry = components['schemas']['LeaderboardEntry'];
export interface UserInfo {
	id: string;
	username: string;
	avatar: string;
	primaryUuid?: string;
	primaryName?: string;
}
