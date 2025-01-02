import createClient from 'openapi-fetch';
import type { components, paths } from './api';
import { ELITE_API_URL } from '$env/static/private';

export const { GET, POST, DELETE, PATCH, PUT } = createClient<paths>({
	baseUrl: ELITE_API_URL,
	headers: {
		'User-Agent': 'EliteWebsite',
	},
});

export const formDataSerializer = (body: Record<string, string | number | boolean> | undefined) => {
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

export const UpdateUserSettings = async (accessToken: string, settings: components['schemas']['UserSettingsDto']) =>
	await PATCH('/account/settings', {
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

export const GetProfilesRank = async (leaderboardId: string, profileUuid: string, upcoming = false) =>
	await GET('/leaderboard/rank/{leaderboardId}/{profileUuid}', {
		params: {
			path: {
				leaderboardId,
				profileUuid,
			},
			query: {
				includeUpcoming: upcoming,
			},
		},
	});

export const GetUpcomingEvents = async () => await GET('/events', {});

export const GetAdminPendingEvents = async (token: string) =>
	await GET('/admin/events/pending', {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

export const GetGuildEvents = async (guildId: string) =>
	await GET('/guild/{guildId}/events', {
		params: {
			path: {
				guildId: guildId as unknown as number,
			},
		},
	});

export const GetAdminGuildEvents = async (token: string, guildId: string) =>
	await GET('/guild/{guildId}/events/admin', {
		params: {
			path: {
				guildId: guildId as unknown as number,
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

export const GetAdminEventDetails = async (token: string, guildId: string, eventId: string) =>
	await GET('/guild/{guildId}/events/{eventId}/admin', {
		params: {
			path: {
				eventId: eventId as unknown as number,
				guildId: guildId as unknown as number,
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

export const GetAdminEventMembers = async (token: string, guildId: string, eventId: string) =>
	await GET('/guild/{guildId}/events/{eventId}/members', {
		params: {
			path: {
				guildId: guildId as unknown as number,
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

export const SetEventBanner = async (accessToken: string, eventId: string, guildId: string, banner: string) =>
	await POST('/guild/{guildId}/events/{eventId}/banner', {
		params: {
			path: {
				guildId: guildId as unknown as number,
				eventId: eventId as unknown as number,
			},
		},
		body: {
			Image: banner,
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		bodySerializer: formDataSerializer,
	});

export const ClearEventBanner = async (accessToken: string, eventId: string, guildId: string) =>
	await DELETE('/guild/{guildId}/events/{eventId}/banner', {
		params: {
			path: {
				guildId: guildId as unknown as number,
				eventId: eventId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		bodySerializer: formDataSerializer,
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

export const ForceAddEventMember = async (
	accessToken: string,
	guildId: string,
	eventId: string,
	playerUuid: string,
	profileUuid: string
) =>
	await POST('/guild/{guildId}/events/{eventId}/members/{playerUuid}', {
		params: {
			path: {
				guildId: guildId as unknown as number,
				eventId: eventId as unknown as number,
				playerUuid,
			},
			query: {
				profileId: profileUuid,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const PermDeleteEventMember = async (
	accessToken: string,
	guildId: string,
	eventId: string,
	playerUuid: string
) =>
	await DELETE('/guild/{guildId}/events/{eventId}/members/{playerUuid}', {
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

export const EnableGuildLeaderboards = async (guildId: string, accessToken: string, max = 1, enable = true) =>
	await POST('/guild/{guildId}/jacob', {
		params: {
			path: {
				guildId: guildId as unknown as number,
			},
			query: {
				enable,
				max,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const EnableGuildEvents = async (guildId: string, accessToken: string, max = 1, enable = true) =>
	await POST('/guild/{guildId}/events', {
		params: {
			path: {
				guildId: guildId as unknown as number,
			},
			query: {
				enable,
				max,
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
	await DELETE('/event/{eventId}/team/{teamId}/member/{playerUuidOrIgn}', {
		params: {
			path: {
				eventId: data.eventId as unknown as number,
				teamId: data.teamId as unknown as number,
				playerUuidOrIgn: data.playerUuid,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const GetProducts = async () => await GET('/products', {});

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

export const CreateWeightStyle = async (accessToken: string, style: components['schemas']['WeightStyleWithDataDto']) =>
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
	await PATCH('/product/{productId}', {
		params: {
			path: {
				productId: productId as unknown as number,
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
	image: { Image: string; Title: string; Description: string },
	thumbnail?: boolean
) =>
	await POST('/product/{productId}/images', {
		params: {
			path: {
				productId: productId as unknown as number,
			},
			query: {
				thumbnail,
			},
		},
		body: image,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		bodySerializer: formDataSerializer,
	});

export const RemoveProductImage = async (accessToken: string, productId: string, imageUrl: string) =>
	await DELETE('/product/{productId}/images/{imagePath}', {
		params: {
			path: {
				productId: productId as unknown as number,
				imagePath: imageUrl,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const AddCosmeticToProduct = async (accessToken: string, productId: string, cosmeticId: string) =>
	await POST('/product/{productId}/styles/{styleId}', {
		params: {
			path: {
				productId: productId as unknown as number,
				styleId: cosmeticId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const RemoveCosmeticFromProduct = async (accessToken: string, productId: string, cosmeticId: string) =>
	await DELETE('/product/{productId}/styles/{styleId}', {
		params: {
			path: {
				productId: productId as unknown as number,
				styleId: cosmeticId as unknown as number,
			},
		},
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

export const AddCosmeticImage = async (
	accessToken: string,
	styleId: string,
	image: { Image: string; Title: string; Description: string },
	thumbnail?: boolean
) =>
	await POST('/product/style/{styleId}/images', {
		params: {
			path: {
				styleId: styleId as unknown as number,
			},
			query: {
				thumbnail,
			},
		},
		body: image,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
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
