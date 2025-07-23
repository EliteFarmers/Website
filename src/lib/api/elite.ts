import createClient, { type HeadersOptions, type Middleware } from 'openapi-fetch';
import type { components, paths } from './api';
import { ELITE_API_URL } from '$env/static/private';

const client = createClient<paths>({
	baseUrl: ELITE_API_URL,
});

const middleware: Middleware = {
	async onRequest({ request }) {
		request.headers.set('User-Agent', 'EliteWebsite');
		request.headers.delete('accept-encoding');
		return request;
	},
};

client.use(middleware);

export const { GET, POST, DELETE, PATCH, PUT } = client;

export const formDataSerializer = (body: Record<string, string | number | boolean>) => {
	if (!body) return;
	try {
		const fd = new FormData();

		for (const name in body) {
			const value = body[name];
			if (typeof value === 'boolean') {
				fd.append(name, value ? 'true' : 'false');
			} else if (typeof value === 'number') {
				fd.append(name, value.toString());
			} else {
				fd.append(name, body[name] as string);
			}
		}
		return fd;
	} catch (e) {
		console.error(e);
	}
};

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

export const RefreshUserSession = async (body: components['schemas']['AuthRefreshDto']) =>
	await POST('/auth/refresh', {
		body: body,
	});

export const GetAuthorizedAccount = async (accessToken: string) =>
	await GET('/account', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetAccount = async (player: string, headers: HeadersOptions) =>
	await GET('/account/{player}', {
		params: {
			path: {
				player: player,
			},
		},
		headers: headers,
	});

export const GetAccountByDiscordId = async (discordId: number, headers: HeadersOptions) =>
	await GET('/account/{discordId}', {
		params: {
			path: {
				discordId: discordId,
			},
		},
		headers: headers,
	});

export const GetPlayer = async (player: string, headers: HeadersOptions) =>
	await GET('/player/{player}', {
		params: {
			path: {
				player: player,
			},
		},
		headers: headers,
	});

export const GetPlayerByDiscordId = async (id: string, headers: HeadersOptions) =>
	await GET('/player/{discordId}', {
		params: {
			path: {
				discordId: id as unknown as number,
			},
		},
		headers: headers,
	});

export const GetProfiles = async (playerUuid: string, headers: HeadersOptions) =>
	await GET('/profiles/{playerUuid}', {
		params: {
			path: {
				playerUuid,
			},
		},
		headers: headers,
	});

export const GetProfile = async (profileUuid: string, headers: HeadersOptions) =>
	await GET('/profile/{profileUuid}', {
		params: {
			path: {
				profileUuid,
			},
		},
		headers: headers,
	});

export const GetProfileMember = async (playerUuid: string, profileUuid: string, headers: HeadersOptions) =>
	await GET('/profile/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
		},
		headers: headers,
	});

export const GetSelectedProfileMember = async (playerUuid: string, headers: HeadersOptions) =>
	await GET('/profile/{playerUuid}/selected', {
		params: {
			path: {
				playerUuid,
			},
		},
		headers: headers,
	});

export const GetPlayerRanks = async (playerUuid: string, profileUuid: string, max?: number, headers?: HeadersOptions) =>
	await GET('/leaderboards/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
			query: {
				max: max,
			},
		},
		headers: headers,
	});

export const GetPlayerContests = async (playerUuid: string, profileUuid: string, headers: HeadersOptions) =>
	await GET('/contests/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
		},
		headers: headers,
	});

export const GetContests = async (timestamp: number, headers: HeadersOptions) =>
	await GET('/contests/{timestamp}', {
		params: {
			path: {
				timestamp,
			},
		},
		headers: headers,
	});

export const GetYearlyContests = async (year: number, headers: HeadersOptions) =>
	await GET('/contests/at/{year}', {
		params: {
			path: {
				year,
			},
		},
		headers: headers,
	});

export const GetMonthlyContests = async (year: number, month: number, headers: HeadersOptions) =>
	await GET('/contests/at/{year}/{month}', {
		params: {
			path: {
				year,
				month,
			},
		},
		headers: headers,
	});

export const GetCurrentYearContests = async () => await GET('/contests/at/now', {});

export const GetWeights = async () => await GET('/weights/all', {});

export const SetPrimaryAccount = async (player: string, accessToken: string) =>
	await POST('/account/primary/{player}', {
		params: {
			path: {
				player,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const LinkAccount = async (player: string, accessToken: string) =>
	await POST('/account/{player}', {
		params: {
			path: {
				player,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const UnlinkAccount = async (player: string, accessToken: string) =>
	await DELETE('/account/{player}', {
		params: {
			path: {
				player,
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
	await POST('/account/{playerUuid}/badges', {
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

export const UpdateUserSettings = async (accessToken: string, settings: components['schemas']['UserSettingsDto']) =>
	await PATCH('/account/settings', {
		body: settings,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const SetUserFortuneSettings = async (
	accessToken: string,
	playerUuid: string,
	profileUuid: string,
	settings: components['schemas']['MemberFortuneSettingsDto']
) =>
	await POST('/account/{playerUuid}/{profileUuid}/fortune', {
		params: {
			path: {
				playerUuid,
				profileUuid,
			},
		},
		body: settings,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const RefreshPurchases = async (accessToken: string) =>
	await POST('/account/purchases', {
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

export const GetGuild = async (discordId: string, accessToken: string) =>
	await GET('/user/guild/{discordId}', {
		params: {
			path: {
				discordId: discordId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetGuildJacob = async (discordId: string, accessToken: string) =>
	await GET('/user/guild/{discordId}/jacob', {
		params: {
			path: {
				discordId: discordId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const PatchGuildJacob = async (
	discordId: string,
	accessToken: string,
	jacob: components['schemas']['UpdateJacobFeatureRequest_UpdateJacobFeature']
) =>
	await PATCH('/user/guild/{discordId}/jacob', {
		params: {
			path: {
				discordId: discordId as unknown as number,
			},
		},
		body: jacob,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const AddGuildJacobLeadeboard = async (
	discordId: string,
	accessToken: string,
	leaderboard: components['schemas']['CreateJacobLeaderboardRequest_CreateJacobLeaderboard']
) =>
	await POST('/user/guild/{discordId}/jacob/leaderboard', {
		params: {
			path: {
				discordId: discordId as unknown as number,
			},
		},
		body: leaderboard,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const UpdateGuildJacobLeadeboard = async (
	discordId: string,
	accessToken: string,
	leaderboard: components['schemas']['GuildJacobLeaderboard']
) =>
	await PATCH('/user/guild/{discordId}/jacob/{leaderboardId}', {
		params: {
			path: {
				discordId: discordId as unknown as number,
				leaderboardId: leaderboard.id ?? '',
			},
		},
		body: leaderboard,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const DeleteGuildJacobLeadeboard = async (discordId: string, accessToken: string, leaderboardId: string) =>
	await DELETE('/user/guild/{discordId}/jacob/{leaderboardId}', {
		params: {
			path: {
				discordId: discordId as unknown as number,
				leaderboardId: leaderboardId,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const SendGuildJacobLeadeboard = async (discordId: string, accessToken: string, leaderboardId: string) =>
	await POST('/user/guild/{discordId}/jacob/{leaderboardId}/send', {
		params: {
			path: {
				discordId: discordId as unknown as number,
				leaderboardId: leaderboardId,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const SetGuildInvite = async (discordId: string, accessToken: string, invite: string) =>
	await PUT('/user/guild/{discordId}/invite', {
		params: {
			path: {
				discordId: discordId as unknown as number,
			},
		},
		body: invite,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const SetGuildAdminRole = async (discordId: string, accessToken: string, role: string) =>
	await PUT('/user/guild/{discordId}/adminrole', {
		params: {
			path: {
				discordId: discordId as unknown as number,
			},
		},
		body: role,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const SetGuildPublic = async (discordId: string, accessToken: string, enable: boolean) =>
	await POST('/guild/{discordId}/public', {
		params: {
			path: {
				discordId: discordId as unknown as number,
			},
			query: {
				public: enable,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetPublicGuild = async (discordId: string) =>
	await GET('/guild/{discordId}', {
		params: {
			path: {
				discordId: discordId as unknown as number,
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

export const GetLeaderboards = async () => await GET('/leaderboards', {});

export enum LeaderboardRemovedFilter {
	NotRemoved = 0,
	Removed = 1,
	All = 2,
}

interface BaseLeaderboardQuery {
	interval?: string;
	mode?: string;
	removed?: LeaderboardRemovedFilter;
}

export const GetLeaderboardSlice = async (
	leaderboardId: string,
	query: { limit: number; offset: number } & BaseLeaderboardQuery
) =>
	await GET('/leaderboard/{leaderboard}', {
		params: {
			path: {
				leaderboard: leaderboardId,
			},
			query: query,
		},
	});

export const GetPlayersRank = async (
	leaderboardId: string,
	playerUuid: string,
	profileUuid: string,
	upcoming = false,
	query: BaseLeaderboardQuery = {}
) =>
	await GET('/leaderboard/{leaderboard}/{playerUuid}/{profileUuid}', {
		params: {
			path: {
				leaderboard: leaderboardId,
				playerUuid,
				profileUuid,
			},
			query: {
				includeUpcoming: upcoming,
				new: true,
				...query,
			},
		},
	});

export const GetProfilesRank = async (
	leaderboardId: string,
	profileUuid: string,
	upcoming = false,
	query: BaseLeaderboardQuery = {}
) =>
	await GET('/leaderboard/{leaderboard}/{profileUuid}', {
		params: {
			path: {
				leaderboard: leaderboardId,
				profileUuid,
			},
			query: {
				includeUpcoming: upcoming,
				new: true,
				...query,
			},
		},
	});

export const GetUpcomingEvents = async () =>
	await GET('/events', {
		params: {
			query: {
				offset: 2,
			},
		},
	});

export const GetAdminPendingEvents = async (token: string) =>
	await GET('/admin/events/pending', {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

export const GetGuildEvents = async (discordId: string) =>
	await GET('/guild/{discordId}/events', {
		params: {
			path: {
				discordId: discordId as unknown as number,
			},
		},
	});

export const GetAdminGuildEvents = async (token: string, discordId: string) =>
	await GET('/guild/{discordId}/events/admin', {
		params: {
			path: {
				discordId: discordId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${token}`,
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

export const GetEventDefaults = async () => await GET('/event/defaults', {});

export const GetAdminEventDetails = async (token: string, discordId: string, eventId: string) =>
	await GET('/guild/{discordId}/event/{eventId}/admin', {
		params: {
			path: {
				eventId: eventId as unknown as number,
				discordId: discordId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${token}`,
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

export const GetAdminEventMembers = async (token: string, discordId: string, eventId: string) =>
	await GET('/guild/{discordId}/event/{eventId}/members', {
		params: {
			path: {
				discordId: discordId as unknown as number,
				eventId: eventId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

export const GetAdminEventTeams = async (token: string, discordId: string, eventId: string) =>
	await GET('/guild/{discordId}/event/{eventId}/teams', {
		params: {
			path: {
				discordId: discordId as unknown as number,
				eventId: eventId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

export const GetEventMember = async (eventId: string, playerUuid: string, token?: string) =>
	await GET('/event/{eventId}/member/{playerUuid}', {
		params: {
			path: {
				eventId: eventId as unknown as number,
				playerUuid,
			},
		},
		headers: {
			Authorization: token ? `Bearer ${token}` : undefined,
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
				profileUuid: profileId,
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

export const CreateEvent = async (
	accessToken: string,
	guildId: string,
	event: components['schemas']['CreateEventDto']
) =>
	await POST('/guild/{discordId}/events/weight', {
		params: {
			path: {
				discordId: guildId as unknown as number,
			},
		},
		body: event,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const EditEvent = async (
	accessToken: string,
	eventId: string,
	guildId: string,
	event: components['schemas']['EditEventDto']
) =>
	await PATCH('/guild/{discordId}/events/{eventId}', {
		body: event,
		params: {
			path: {
				discordId: guildId as unknown as number,
				eventId: eventId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const SetEventBanner = async (accessToken: string, eventId: string, discordId: string, banner: string) =>
	await POST('/guild/{discordId}/events/{eventId}/banner', {
		params: {
			path: {
				discordId: discordId as unknown as number,
				eventId: eventId as unknown as number,
			},
		},
		body: {
			image: banner,
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		// @ts-expect-error FormData is not typed correctly
		bodySerializer: formDataSerializer,
	});

export const ClearEventBanner = async (accessToken: string, eventId: string, discordId: string) =>
	await DELETE('/guild/{discordId}/events/{eventId}/banner', {
		params: {
			path: {
				discordId: discordId as unknown as number,
				eventId: eventId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		// @ts-expect-error FormData is not typed correctly
		bodySerializer: formDataSerializer,
	});

export const GetEventBans = async (accessToken: string, discordId: string, eventId: string) =>
	await GET('/guild/{discordId}/event/{eventId}/bans', {
		params: {
			path: {
				discordId: discordId as unknown as number,
				eventId: eventId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const BanEventMember = async (
	accessToken: string,
	discordId: string,
	eventId: string,
	playerUuid: string,
	reason?: string
) =>
	await POST('/guild/{discordId}/events/{eventId}/bans/{playerUuid}', {
		params: {
			path: {
				discordId: discordId as unknown as number,
				eventId: eventId as unknown as number,
				playerUuid,
			},
		},
		body: reason ?? 'Reason not provided',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const AdminKickTeamMember = async (
	accessToken: string,
	discordId: string,
	eventId: string,
	playerUuid: string,
	teamId: string
) =>
	await DELETE('/guild/{discordId}/events/{eventId}/teams/{teamId}/members/{player}', {
		params: {
			path: {
				discordId: discordId as unknown as number,
				eventId: eventId as unknown as number,
				player: playerUuid,
				teamId: teamId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const AdminDeleteTeam = async (accessToken: string, discordId: string, eventId: string, teamId: string) =>
	await DELETE('/guild/{discordId}/events/{eventId}/teams/{teamId}', {
		params: {
			path: {
				discordId: discordId as unknown as number,
				eventId: eventId as unknown as number,
				teamId: teamId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const UnbanEventMember = async (accessToken: string, discordId: string, eventId: string, playerUuid: string) =>
	await DELETE('/guild/{discordId}/events/{eventId}/bans/{playerUuid}', {
		params: {
			path: {
				discordId: discordId as unknown as number,
				eventId: eventId as unknown as number,
				playerUuid,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const ForceAddEventMember = async (
	accessToken: string,
	discordId: string,
	eventId: string,
	playerUuid: string,
	profileUuid: string
) =>
	await POST('/guild/{discordId}/events/{eventId}/members/{playerUuid}', {
		params: {
			path: {
				discordId: discordId as unknown as number,
				eventId: eventId as unknown as number,
				playerUuid,
			},
			query: {
				profileUuid,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const PermDeleteEventMember = async (
	accessToken: string,
	discordId: string,
	eventId: string,
	playerUuid: string
) =>
	await DELETE('/guild/{discordId}/events/{eventId}/members/{playerUuid}', {
		params: {
			path: {
				discordId: discordId as unknown as number,
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
				year: year,
			},
		},
	});

export const DisableUpcomingContestPings = async (accessToken: string, discordId: string, reason: string) =>
	await DELETE('/user/guild/{discordId}/contestpings', {
		params: {
			path: {
				discordId: discordId as unknown as number,
			},
			query: {
				reason: reason,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const UpdateUpcomingContestPings = async (
	accessToken: string,
	discordId: string,
	body: components['schemas']['UpdateContestPingsRequest_UpdateContestPings']
) =>
	await PUT('/user/guild/{discordId}/contestpings', {
		params: {
			path: {
				discordId: discordId as unknown as number,
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

export const EnableGuildLeaderboards = async (discordId: string, accessToken: string, max = 1, enable = true) =>
	await POST('/guild/{discordId}/jacob', {
		params: {
			path: {
				discordId: discordId as unknown as number,
			},
			query: {
				enable: enable,
				max: max,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const EnableGuildEvents = async (discordId: string, accessToken: string, max = 1, enable = true) =>
	await POST('/guild/{discordId}/events', {
		params: {
			path: {
				discordId: discordId as unknown as number,
			},
			query: {
				enable: enable,
				max: max,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const CreateEventTeam = async (
	accessToken: string,
	eventId: string,
	team: components['schemas']['CreateEventTeamDto']
) =>
	await POST('/event/{eventId}/teams', {
		params: {
			path: {
				eventId: eventId as unknown as number,
			},
		},
		body: team,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const UpdateEventTeam = async (
	accessToken: string,
	eventId: string,
	teamId: string,
	team: components['schemas']['UpdateEventTeamDto']
) =>
	await PATCH('/event/{eventId}/team/{teamId}', {
		params: {
			path: {
				eventId: eventId as unknown as number,
				teamId: teamId as unknown as number,
			},
		},
		body: team,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const RegenerateEventTeamCode = async (accessToken: string, eventId: string, teamId: string) =>
	await POST('/event/{eventId}/team/{teamId}/code', {
		params: {
			path: {
				eventId: eventId as unknown as number,
				teamId: teamId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetEventTeam = async (accessToken: string, eventId: string, teamId: string) =>
	await GET('/event/{eventId}/team/{teamId}', {
		params: {
			path: {
				eventId: eventId as unknown as number,
				teamId: teamId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetEventTeams = async (eventId: string) =>
	await GET('/event/{eventId}/teams', {
		params: {
			path: {
				eventId: eventId as unknown as number,
			},
		},
	});

export const GetEventTeamWords = async () => await GET('/event/teams/words', {});

export const JoinEventTeam = async (accessToken: string, eventId: string, teamId: string, code: string) =>
	await POST('/event/{eventId}/team/{teamId}/join', {
		params: {
			path: {
				eventId: eventId as unknown as number,
				teamId: teamId as unknown as number,
			},
		},
		body: code,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const LeaveEventTeam = async (accessToken: string, eventId: string, teamId: string) =>
	await POST('/event/{eventId}/team/{teamId}/leave', {
		params: {
			path: {
				eventId: eventId as unknown as number,
				teamId: teamId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const KickEventTeamMember = async (
	accessToken: string,
	data: { eventId: string; teamId: string; playerUuid: string }
) =>
	await DELETE('/event/{eventId}/team/{teamId}/member/{player}', {
		params: {
			path: {
				eventId: data.eventId as unknown as number,
				teamId: data.teamId as unknown as number,
				player: data.playerUuid,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const TransferEventTeamOwnership = async (
	accessToken: string,
	data: { eventId: string; teamId: string; playerUuid: string }
) =>
	await PUT('/event/{eventId}/team/{teamId}/owner', {
		params: {
			path: {
				eventId: data.eventId as unknown as number,
				teamId: data.teamId as unknown as number,
			},
		},
		body: {
			player: data.playerUuid,
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const AdminTransferEventTeamOwnership = async (
	accessToken: string,
	data: { guildId: string; eventId: string; teamId: string; playerUuid: string }
) =>
	await PUT('/guild/{discordId}/events/{eventId}/teams/{teamId}/owner', {
		params: {
			path: {
				discordId: data.guildId as unknown as number,
				eventId: data.eventId as unknown as number,
				teamId: data.teamId as unknown as number,
			},
		},
		body: {
			player: data.playerUuid,
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const AddMemberToTeam = async (
	accessToken: string,
	discordId: string,
	eventId: string,
	teamId: string,
	playerUuid: string
) =>
	await POST('/guild/{discordId}/events/{eventId}/teams/{teamId}/members/{player}', {
		params: {
			path: {
				discordId: discordId as unknown as number,
				eventId: eventId as unknown as number,
				teamId: teamId as unknown as number,
				player: playerUuid,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const AdminCreateEventTeam = async (
	accessToken: string,
	discordId: string,
	eventId: string,
	userId: string,
	team: components['schemas']['CreateEventTeamDto']
) =>
	await POST('/guild/{discordId}/events/{eventId}/teams', {
		params: {
			path: {
				discordId: discordId as unknown as number,
				eventId: eventId as unknown as number,
			},
			query: {
				userId: userId,
			},
		},
		body: team,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetProducts = async () => await GET('/products', {});

export const ClaimFreeProduct = async (accessToken: string, productId: string) =>
	await POST('/product/{discordId}/claim', {
		params: {
			path: {
				discordId: productId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetAdminProducts = async (token: string) =>
	await GET('/products/admin', {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

export const GetWeightStyles = async () => await GET('/product/styles', {});

export const GetWeightStyle = async (styleId: number | string) =>
	await GET('/product/style/{styleId}', {
		params: {
			path: {
				styleId: styleId as unknown as number,
			},
		},
	});

export const UpdateWeightStyle = async (
	accessToken: string,
	styleId: string,
	style: components['schemas']['WeightStyleWithDataDto']
) =>
	await POST('/product/style/{styleId}', {
		params: {
			path: {
				styleId: styleId as unknown as number,
			},
		},
		body: style,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const DeleteWeightStyle = async (accessToken: string, styleId: string) =>
	await DELETE('/product/style/{styleId}', {
		params: {
			path: {
				styleId: styleId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const CreateWeightStyle = async (accessToken: string, style: components['schemas']['CreateStyleRequest']) =>
	await POST('/product/style', {
		body: style,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const UpdateProduct = async (
	accessToken: string,
	productId: string,
	product: components['schemas']['EditProductDto']
) =>
	await PATCH('/product/{discordId}', {
		params: {
			path: {
				discordId: productId as unknown as number,
			},
		},
		body: product,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const AddProductImage = async (
	accessToken: string,
	productId: string,
	image: components['schemas']['UploadImageDto'],
	thumbnail?: boolean
) =>
	await POST('/product/{discordId}/images', {
		params: {
			path: {
				discordId: productId as unknown as number,
			},
			query: {
				thumbnail: thumbnail,
			},
		},
		body: image,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		// @ts-expect-error FormData is not typed correctly
		bodySerializer: formDataSerializer,
	});

export const RemoveProductImage = async (accessToken: string, productId: string, imageUrl: string) =>
	await DELETE('/product/{discordId}/images/{imagePath}', {
		params: {
			path: {
				discordId: productId as unknown as number,
				imagePath: imageUrl,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const AddCosmeticToProduct = async (accessToken: string, productId: string, cosmeticId: string) =>
	await POST('/product/{productId}/cosmetics/{cosmeticId}', {
		params: {
			path: {
				productId: productId as unknown as number,
				cosmeticId: cosmeticId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const RemoveCosmeticFromProduct = async (accessToken: string, productId: string, cosmeticId: string) =>
	await DELETE('/product/{productId}/cosmetics/{cosmeticId}', {
		params: {
			path: {
				productId: productId as unknown as number,
				cosmeticId: cosmeticId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const AddCosmeticImage = async (
	accessToken: string,
	styleId: string,
	image: components['schemas']['UploadImageDto'],
	thumbnail?: boolean
) =>
	await POST('/product/style/{styleId}/images', {
		params: {
			path: {
				styleId: styleId as unknown as number,
			},
			query: {
				thumbnail: thumbnail,
			},
		},
		body: image,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		// @ts-expect-error FormData is not assignable to Record<string, string | number
		bodySerializer: formDataSerializer,
	});

export const RemoveCosmeticImage = async (accessToken: string, cosmeticId: string, imageUrl: string) =>
	await DELETE('/product/style/{styleId}/images/{imagePath}', {
		params: {
			path: {
				styleId: cosmeticId as unknown as number,
				imagePath: imageUrl,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const RefreshProducts = async (accessToken: string) =>
	await POST('/products/refresh', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetShopCategories = async (includeProducts = false, token?: string) =>
	await GET('/shop/categories', {
		params: {
			query: {
				includeProducts: includeProducts,
			},
		},
		headers: {
			Authorization: token ? `Bearer ${token}` : undefined,
		},
	});

export const GetShopCategory = async (categoryId: string, token?: string) =>
	await GET('/shop/category/{category}', {
		params: {
			path: {
				category: categoryId,
			},
		},
		headers: {
			Authorization: token ? `Bearer ${token}` : undefined,
		},
	});

export const CreateShopCategory = async (token: string, category: components['schemas']['CreateCategoryDto']) =>
	await POST('/shop/category', {
		body: category,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

export const UpdateShopCategory = async (
	token: string,
	categoryId: string | number,
	category: components['schemas']['EditCategoryDto']
) =>
	await PATCH('/shop/category/{categoryId}', {
		params: {
			path: {
				categoryId: categoryId as unknown as number,
			},
		},
		body: category,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

export const UpdateCategoryOrder = async (token: string, order: components['schemas']['ReorderIntRequest']) =>
	await POST('/shop/categories/reorder', {
		body: order,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

export const DeleteShopCategory = async (token: string, categoryId: string) =>
	await DELETE('/shop/category/{categoryId}', {
		params: {
			path: {
				categoryId: categoryId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

export const AddProductToCategory = async (token: string, categoryId: string, productId: string) =>
	await POST('/shop/category/{categoryId}/product/{productId}', {
		params: {
			path: {
				categoryId: categoryId as unknown as number,
				productId: productId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

export const RemoveProductFromCategory = async (token: string, categoryId: string, productId: string) =>
	await DELETE('/shop/category/{categoryId}/product/{productId}', {
		params: {
			path: {
				categoryId: categoryId as unknown as number,
				productId: productId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

export const UpdateCategoryProductOrder = async (
	token: string,
	categoryId: string,
	order: components['schemas']['ReorderCategoryProductsRequest']
) =>
	await POST('/shop/category/{categoryId}/reorder', {
		params: {
			path: {
				categoryId: categoryId as unknown as number,
			},
		},
		body: order,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

export const GetBazaarData = async () => await GET('/resources/bazaar');
export const GetAuctionHouse = async () => await GET('/resources/auctions');
export const GetSkyblockItems = async () => await GET('/resources/items');

export const GetItemPrices = async (items: string[]) =>
	await POST('/resources/items', {
		body: {
			items: items,
		},
	});

export const GetAnnouncements = async () => await GET('/announcements', {});
export const DismissAnnouncement = async (accessToken: string, announcementId: string) =>
	await POST('/announcements/{announcementId}/dismiss', {
		params: {
			path: {
				announcementId,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const CreateAnnouncement = async (
	accessToken: string,
	announcement: components['schemas']['CreateAnnouncementDto']
) =>
	await POST('/announcements/create', {
		body: announcement,
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

export type RatesItemPriceData = Record<
	string,
	{
		auctions?: components['schemas']['AuctionItemDto'][];
		bazaar?: components['schemas']['BazaarProductSummaryDto'];
		item?: components['schemas']['ItemResponse'];
	}
>;
