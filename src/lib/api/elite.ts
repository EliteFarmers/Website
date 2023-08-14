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
				guildId: guildId as unknown as number,
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
				guildId: guildId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const PatchGuildJacob = async (
	guildId: string,
	accessToken: string,
	jacob: components['schemas']['GuildJacobLeaderboardFeature']
) =>
	await PATCH('/User/Guild/{guildId}/Jacob', {
		params: {
			path: {
				guildId: guildId as unknown as number,
			},
		},
		body: jacob,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const AddGuildJacobLeadeboard = async (
	guildId: string,
	accessToken: string,
	leaderboard: components['schemas']['GuildJacobLeaderboard']
) =>
	await POST('/User/Guild/{guildId}/Jacob/Leaderboard', {
		params: {
			path: {
				guildId: guildId as unknown as number,
			},
		},
		body: leaderboard,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const UpdateGuildJacobLeadeboard = async (
	guildId: string,
	accessToken: string,
	leaderboard: components['schemas']['GuildJacobLeaderboard']
) =>
	await PUT('/User/Guild/{guildId}/Jacob/{lbId}', {
		params: {
			path: {
				guildId: guildId as unknown as number,
				lbId: leaderboard.id ?? '',
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
				lbId: leaderboardId,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const SendGuildJacobLeadeboard = async (guildId: string, accessToken: string, leaderboardId: string) =>
	await POST('/User/Guild/{guildId}/Jacob/{lbId}/Send', {
		params: {
			path: {
				guildId: guildId as unknown as number,
				lbId: leaderboardId,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const SetGuildInvite = async (guildId: string, accessToken: string, invite: string) =>
	await PUT('/User/Guild/{guildId}/Invite', {
		params: {
			path: {
				guildId: guildId as unknown as number,
			},
		},
		body: invite,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetPublicGuild = async (guildId: string) =>
	await GET('/Guild/{guildId}', {
		params: {
			path: {
				guildId: guildId as unknown as number,
			},
		},
	});

export const GetPublicGuilds = async () => await GET('/Guilds', {});

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

export const GetUpcomingEvents = async () => await GET('/Events', {});

export const GetGuildEvents = async (guildId: string) =>
	await GET('/Guild/{guildId}/Events', {
		params: {
			path: {
				guildId: guildId as unknown as number,
			},
		},
	});

export const GetEventDetails = async (eventId: string) =>
	await GET('/Event/{eventId}', {
		params: {
			path: {
				eventId: eventId as unknown as number,
			},
		},
	});

export const GetEventMembers = async (eventId: string) =>
	await GET('/Event/{eventId}/members', {
		params: {
			path: {
				eventId: eventId as unknown as number,
			},
		},
	});

export const GetEventMember = async (eventId: string, playerUuid: string) =>
	await GET('/Event/{eventId}/member/{playerUuid}', {
		params: {
			path: {
				eventId: eventId as unknown as number,
				playerUuid,
			},
		},
	});

export const JoinEvent = async (eventId: string, accessToken: string, playerUuid?: string, profileId?: string) =>
	await POST('/Event/{eventId}/join', {
		params: {
			path: {
				eventId: eventId as unknown as number,
			},
			query: {
				playerUuid,
				profileId,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const LeaveEvent = async (eventId: string, accessToken: string) =>
	await POST('/Event/{eventId}/leave', {
		params: {
			path: {
				eventId: eventId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const CreateEvent = async (accessToken: string, event: components['schemas']['EditEventDto']) =>
	await POST('/Event/create', {
		body: event,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const EditEvent = async (accessToken: string, eventId: string, event: components['schemas']['EditEventDto']) =>
	await POST('/Event/{eventId}/edit', {
		body: event,
		params: {
			path: {
				eventId: eventId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetEventBans = async (accessToken: string, eventId: string) =>
	await GET('/Event/{eventId}/bans', {
		params: {
			path: {
				eventId: eventId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const BanEventMember = async (accessToken: string, eventId: string, playerUuid: string, reason?: string) =>
	await POST('/Event/{eventId}/bans/{playerUuid}', {
		params: {
			path: {
				eventId: eventId as unknown as number,
				playerUuid,
			},
		},
		body: reason,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const UnbanEventMember = async (accessToken: string, eventId: string, playerUuid: string) =>
	await DELETE('/Event/{eventId}/bans/{playerUuid}', {
		params: {
			path: {
				eventId: eventId as unknown as number,
				playerUuid,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetYearlyContestRecords = async (year: number) =>
	await GET('/Contests/Records/{year}', {
		params: {
			path: {
				year,
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

export type ProfileGameMode = 'island' | 'bingo' | 'ironman' | 'classic';

export interface ProfileDetails {
	id: string;
	name: string;
	selected: boolean;
	gameMode?: ProfileGameMode;
	weight: number;
}
