import createClient from 'openapi-fetch';
import type { components, paths } from './api';
import { ELITE_API_URL } from '$env/static/private';

export const { GET, POST, DELETE, PATCH, PUT } = createClient<paths>({
	baseUrl: ELITE_API_URL,
	headers: {
		'User-Agent': 'EliteWebsite',
	},
});

export const GetUserSession = async (accessToken: string) =>
	await GET('/auth/me', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const LoginUser = async (body: components['schemas']['DiscordLoginDto']) =>
	await POST('/auth/login', {
		body: body,
	});

export const RefreshUserSession = async (body: components['schemas']['AuthResponseDto']) =>
	await POST('/auth/refresh', {
		body: body,
	});

export const GetAuthorizedAccount = async (accessToken: string) =>
	await GET('/account', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetAccount = async (playerUuidOrIgn: string) =>
	await GET('/account/{playerUuidOrIgn}', {
		params: {
			path: {
				playerUuidOrIgn,
			},
		},
	});

export const GetAccountByDiscordId = async (discordId: number) =>
	await GET('/account/{discordId}', {
		params: {
			path: {
				discordId,
			},
		},
	});

export const GetPlayer = async (playerUuidOrIgn: string) =>
	await GET('/player/{playerUuidOrIgn}', {
		params: {
			path: {
				playerUuidOrIgn,
			},
		},
	});

export const GetPlayerByDiscordId = async (id: string) =>
	await GET('/player/{discordId}', {
		params: {
			path: {
				discordId: id as unknown as number,
			},
		},
	});

export const GetProfiles = async (playerUuid: string) =>
	await GET('/profiles/{playerUuid}', {
		params: {
			path: {
				playerUuid,
			},
		},
	});

export const GetProfile = async (profileUuid: string) =>
	await GET('/profile/{profileUuid}', {
		params: {
			path: {
				profileUuid,
			},
		},
	});

export const GetProfileMember = async (playerUuid: string, profileUuid: string) =>
	await GET('/profile/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
		},
	});

export const GetSelectedProfileMember = async (playerUuid: string) =>
	await GET('/profile/{uuid}/selected', {
		params: {
			path: {
				uuid: playerUuid,
			},
		},
	});

export const GetPlayerRanks = async (playerUuid: string, profileUuid: string) =>
	await GET('/leaderboard/ranks/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
		},
	});

export const GetPlayerContests = async (playerUuid: string, profileUuid: string) =>
	await GET('/contests/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
		},
	});

export const GetContests = async (timestamp: number) =>
	await GET('/contests/{timestamp}', {
		params: {
			path: {
				timestamp,
			},
		},
	});

export const GetYearlyContests = async (year: number) =>
	await GET('/contests/at/{year}', {
		params: {
			path: {
				year,
			},
		},
	});

export const GetMonthlyContests = async (year: number, month: number) =>
	await GET('/contests/at/{year}/{month}', {
		params: {
			path: {
				year,
				month,
			},
		},
	});

export const GetCurrentYearContests = async () => await GET('/contests/at/now', {});

export const GetWeights = async () => await GET('/weights/all', {});

export const SetPrimaryAccount = async (playerUuidOrIgn: string, accessToken: string) =>
	await POST('/account/primary/{playerUuidOrIgn}', {
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
	await POST('/account/{playerUuidOrIgn}', {
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
	await DELETE('/account/{playerUuidOrIgn}', {
		params: {
			path: {
				playerUuidOrIgn,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const UpdateUserBadges = async (
	accessToken: string,
	playerUuid: string,
	badges: components['schemas']['EditUserBadgeDto'][]
) =>
	await PATCH('/user/badges/{playerUuid}', {
		params: {
			path: {
				playerUuid,
			},
		},
		body: badges,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetAllBadges = async () => await GET('/badges', {});

export const GetUsersGuilds = async (accessToken: string) =>
	await GET('/user/guilds', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetGuild = async (guildId: string, accessToken: string) =>
	await GET('/user/guild/{guildId}', {
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
	await GET('/user/guild/{guildId}/jacob', {
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
	await PATCH('/user/guild/{guildId}/jacob', {
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
	await POST('/user/guild/{guildId}/jacob/leaderboard', {
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
	await PUT('/user/guild/{guildId}/jacob/{lbId}', {
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
	await DELETE('/user/guild/{guildId}/jacob/{lbId}', {
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
	await POST('/user/guild/{guildId}/jacob/{lbId}/send', {
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
	await PUT('/user/guild/{guildId}/invite', {
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

export const SetGuildAdminRole = async (guildId: string, accessToken: string, role: string) =>
	await PUT('/user/guild/{guildId}/adminrole', {
		params: {
			path: {
				guildId: guildId as unknown as number,
			},
		},
		body: role,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const SetGuildPublic = async (guildId: string, accessToken: string, enable: boolean) =>
	await POST('/guild/{guildId}/public', {
		params: {
			path: {
				guildId: guildId as unknown as number,
			},
			query: {
				enable,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetPublicGuild = async (guildId: string) =>
	await GET('/guild/{guildId}', {
		params: {
			path: {
				guildId: guildId as unknown as number,
			},
		},
	});

export const GetPublicGuilds = async () => await GET('/guilds', {});

export const GetProfilesWeights = async (playerUuid: string) =>
	await GET('/weight/{playerUuid}', {
		params: {
			path: {
				playerUuid,
			},
		},
	});

export const GetLeaderboardSlice = async (leaderboardId: string, offset: number, limit: number) =>
	await GET('/leaderboard/{id}', {
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
	await GET('/leaderboard/skill/{skillName}', {
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
	await GET('/leaderboard/collection/{collection}', {
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
	await GET('/leaderboard/rank/{leaderboardId}/{playerUuid}/{profileUuid}', {
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

export const GetUpcomingEvents = async () => await GET('/events', {});

export const GetGuildEvents = async (guildId: string) =>
	await GET('/guild/{guildId}/events', {
		params: {
			path: {
				guildId: guildId as unknown as number,
			},
		},
	});

export const GetEventDetails = async (eventId: string) =>
	await GET('/event/{eventId}', {
		params: {
			path: {
				eventId: eventId as unknown as number,
			},
		},
	});

export const GetEventMembers = async (eventId: string) =>
	await GET('/event/{eventId}/members', {
		params: {
			path: {
				eventId: eventId as unknown as number,
			},
		},
	});

export const GetEventMember = async (eventId: string, playerUuid: string) =>
	await GET('/event/{eventId}/member/{playerUuid}', {
		params: {
			path: {
				eventId: eventId as unknown as number,
				playerUuid,
			},
		},
	});

export const JoinEvent = async (eventId: string, accessToken: string, playerUuid?: string, profileId?: string) =>
	await POST('/event/{eventId}/join', {
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
	await POST('/event/{eventId}/leave', {
		params: {
			path: {
				eventId: eventId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const CreateWeightEvent = async (accessToken: string, event: components['schemas']['CreateWeightEventDto']) =>
	await POST('/guild/{guildId}/events/weight', {
		params: {
			path: {
				guildId: event.guildId as unknown as number,
			},
		},
		body: event,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const CreateMedalEvent = async (accessToken: string, event: components['schemas']['CreateMedalEventDto']) =>
	await POST('/guild/{guildId}/events/medals', {
		params: {
			path: {
				guildId: event.guildId as unknown as number,
			},
		},
		body: event,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const EditEvent = async (accessToken: string, eventId: string, event: components['schemas']['EditEventDto']) =>
	await PATCH('/guild/{guildId}/events/{eventId}', {
		body: event,
		params: {
			path: {
				guildId: event.guildId as unknown as number,
				eventId: eventId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetEventBans = async (accessToken: string, guildId: string, eventId: string) =>
	await GET('/guild/{guildId}/events/{eventId}/bans', {
		params: {
			path: {
				guildId: guildId as unknown as number,
				eventId: eventId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const BanEventMember = async (
	accessToken: string,
	guildId: string,
	eventId: string,
	playerUuid: string,
	reason?: string
) =>
	await POST('/guild/{guildId}/events/{eventId}/bans/{playerUuid}', {
		params: {
			path: {
				guildId: guildId as unknown as number,
				eventId: eventId as unknown as number,
				playerUuid,
			},
		},
		body: reason,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const UnbanEventMember = async (accessToken: string, guildId: string, eventId: string, playerUuid: string) =>
	await DELETE('/guild/{guildId}/events/{eventId}/bans/{playerUuid}', {
		params: {
			path: {
				guildId: guildId as unknown as number,
				eventId: eventId as unknown as number,
				playerUuid,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetYearlyContestRecords = async (year: number) =>
	await GET('/contests/records/{year}', {
		params: {
			path: {
				year,
			},
		},
	});

export const DisableUpcomingContestPings = async (accessToken: string, guildId: string, reason: string) =>
	await DELETE('/user/guild/{guildId}/contestpings', {
		params: {
			path: {
				guildId: guildId as unknown as number,
			},
			query: {
				reason,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const UpdateUpcomingContestPings = async (
	accessToken: string,
	guildId: string,
	body: components['schemas']['ContestPingsFeatureDto']
) =>
	await PUT('/user/guild/{guildId}/contestpings', {
		params: {
			path: {
				guildId: guildId as unknown as number,
			},
		},
		body,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const SearchPlayers = async (query: string) =>
	await GET('/account/search', {
		params: {
			query: {
				q: query,
			},
		},
	});

export const GetCropCollectionPoints = async (playerUuid: string, profileUuid: string, start?: string, days = 7) =>
	await GET('/graph/{playerUuid}/{profileUuid}/crops', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
			query: {
				from: start as unknown as number,
				days: days,
			},
		},
	});

export const GetSkillPoints = async (playerUuid: string, profileUuid: string, start?: string, days = 7) =>
	await GET('/graph/{playerUuid}/{profileUuid}/crops', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
			query: {
				from: start as unknown as number,
				days: days,
			},
		},
	});

export const GetAdminCropCollectionPoints = async (playerUuid: string, profileUuid: string, accessToken: string) =>
	await GET('/graph/admin/{playerUuid}/{profileUuid}/crops', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
			query: {
				days: 14,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetAdminCropCollectionPointsTimeSpan = async (
	playerUuid: string,
	profileUuid: string,
	accessToken: string,
	start: number,
	days: number
) =>
	await GET('/graph/admin/{playerUuid}/{profileUuid}/crops', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
			query: {
				from: start,
				days: days,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetAdminSkillPoints = async (playerUuid: string, profileUuid: string, accessToken: string) =>
	await GET('/graph/admin/{playerUuid}/{profileUuid}/skills', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
			query: {
				days: 14,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
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
