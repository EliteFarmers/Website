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
	await get('/api/Account', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetAccount = async (playerUuidOrIgn: string) =>
	await get('/api/Account/{playerUuidOrIgn}', {
		params: {
			path: {
				playerUuidOrIgn,
			},
		},
	});

export const GetAccountByDiscordId = async (discordId: number) =>
	await get('/api/Account/{discordId}', {
		params: {
			path: {
				discordId,
			},
		},
	});

export const GetPlayer = async (playerUuidOrIgn: string) =>
	await get('/api/Player/{playerUuidOrIgn}', {
		params: {
			path: {
				playerUuidOrIgn,
			},
		},
	});

export const GetPlayerByDiscordId = async (id: string) =>
	await get('/api/Player/{discordId}', {
		params: {
			path: {
				discordId: id as unknown as number,
			},
		},
	});

export const GetProfiles = async (playerUuid: string) =>
	await get('/api/Profiles/{playerUuid}', {
		params: {
			path: {
				playerUuid,
			},
		},
	});

export const GetProfile = async (profileUuid: string) =>
	await get('/api/Profile/{profileUuid}', {
		params: {
			path: {
				profileUuid,
			},
		},
	});

export const GetProfileMember = async (playerUuid: string, profileUuid: string) =>
	await get('/api/Profile/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
		},
	});

export const GetSelectedProfileMember = async (playerUuid: string) =>
	await get('/api/Profile/{uuid}/Selected', {
		params: {
			path: {
				uuid: playerUuid,
			},
		},
	});

export const GetPlayerRanks = async (playerUuid: string, profileUuid: string) =>
	await get('/api/Leaderboard/ranks/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
		},
	});

export const GetPlayerContests = async (playerUuid: string, profileUuid: string) =>
	await get('/api/Contests/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
		},
	});

export const GetContests = async (timestamp: number) =>
	await get('/api/Contests/{timestamp}', {
		params: {
			path: {
				timestamp,
			},
		},
	});

export const SetPrimaryAccount = async (playerUuidOrIgn: string, accessToken: string) =>
	await post('/api/Account/primary/{playerUuidOrIgn}', {
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
	await post('/api/Account/{playerUuidOrIgn}', {
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
	await del('/api/Account/{playerUuidOrIgn}', {
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
	await get('/api/Leaderboard/{id}', {
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
	await get('/api/Leaderboard/skill/{skillName}', {
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
	await get('/api/Leaderboard/collection/{collection}', {
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

export const GetPlayersRank = async (leaderboardId: string, playerUuid: string, profileUuid: string, upcoming = false) =>
	await get('/api/Leaderboard/rank/{leaderboardId}/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				leaderboardId,
				playerUuid,
				profileUuid,
			},
			query: {
				includeUpcoming: upcoming,
			}
		},
	});


export type AuthorizedUser = components['schemas']['AuthorizedAccountDto'];
export interface UserInfo {
	id: string;
	username: string;
	avatar: string;
	primaryUuid?: string;
	primaryName?: string;
}