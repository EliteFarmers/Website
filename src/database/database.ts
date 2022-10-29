import { POSTGRES_URI } from '$env/static/private';
import { LEADERBOARD_UPDATE_INTERVAL } from '$lib/constants/data';
import type { Profiles, AccountInfo, PlayerInfo } from '$lib/skyblock';
import { Op, Sequelize } from 'sequelize';
import {
	UsersInit,
	type DiscordUser,
	type UserInfo,
	type UserUpdateOptions,
	type UserWhereOptions,
} from './models/users';

export interface DataUpdate {
	account: AccountInfo;
	player: PlayerInfo;
	profiles: Profiles;
}

const sequelize = new Sequelize(POSTGRES_URI, {
	dialect: 'postgres',
	logging: false,
});

const User = UsersInit(sequelize);

let CachedLeaderboardUpdated = 0;
let CachedLeaderboard: LeaderboardEntry[] = [];
let CachedLeaderboardMap: Map<string, LeaderboardEntry> = new Map<string, LeaderboardEntry>();
export let DBReady = false;

export async function SyncTables() {
	if (DBReady) return;
	DBReady = true;

	try {
		await sequelize.authenticate();

		await User.sync({ force: false });
		await FetchWeightLeaderboard();
		console.log('Connected to database.');
	} catch (error) {
		DBReady = false;
		console.log('Unable to connect to the database!');
	}
}

// Runs once on startup
await SyncTables();
// ==================== //

export async function GetUser(uuid: string) {
	return await findOne({ uuid: uuid });
}

export async function GetUserByIGN(ign: string) {
	return await findOne({
		ign: { [Op.iLike]: '%' + ign },
	});
}

export async function GetUserByDiscordID(id: string) {
	return await findOne({ id: id });
}

async function findOne(options: UserWhereOptions) {
	const user = await User.findOne({ where: options, raw: true, nest: true });
	if (!user) return null;

	// Hopefully a new version of SvelteKit will fix this.
	user.createdAt = (user.createdAt as Date).toISOString();
	user.updatedAt = (user.updatedAt as Date).toISOString();

	return user;
}

export async function FindUserToLink(discordUser: DiscordUser) {
	const user = await findOne({
		'player.player.social.links.DISCORD': {
			[Op.iLike]: `${discordUser.username}#${discordUser.discriminator}`,
		},
	});

	return user;
}

const infoDefaults: UserInfo = {
	linked: false,
	id: null,
	cheating: false,
	times_fetched: 0,
	highest: {
		farming: {
			weight: 0,
			profile: 'N/A',
		},
	},
	profiles: {},
};

export function CreateUser(uuid: string, ign: string) {
	return User.create({ uuid: uuid, ign: ign, info: infoDefaults });
}

export function UpdateUserData({ account, player, profiles }: DataUpdate) {
	return UpdateUser(
		{
			ign: account.account.name,
			skyblock: profiles,
			account: account,
			player: player,
		},
		{ uuid: account.account.id }
	);
}

export function UpdateUser(where: UserWhereOptions, data: UserUpdateOptions) {
	return User.update(data, {
		where: where,
	});
}

export async function LinkDiscordUser(uuid: string, user: DiscordUser) {
	const oldUser = await GetUser(uuid);
	const oldInfo = oldUser?.info ?? infoDefaults;
	const newInfo = { ...oldInfo, linked: true, id: user.id };

	return UpdateUser({ uuid: uuid }, { id: user.id, user: user, info: newInfo });
}

export async function UnlinkDiscordUser(uuid: string) {
	const oldUser = await GetUser(uuid);
	const oldInfo = oldUser?.info ?? infoDefaults;
	const newInfo = { ...oldInfo, linked: false, id: null };

	return UpdateUser({ uuid: uuid }, { id: null, user: null, info: newInfo });
}

export function UpdateDiscordUser(id: string, user: DiscordUser) {
	return UpdateUser({ id: id }, { user: user });
}

export async function GetAccountData(uuid: string) {
	const user = await GetUser(uuid);
	return user?.account ?? null;
}

export async function GetPlayerData(uuid: string) {
	const user = await GetUser(uuid);
	return user?.player ?? null;
}

export async function GetProfilesData(uuid: string) {
	const user = await GetUser(uuid);
	return user?.skyblock ?? null;
}

export function UpdateAccountData(uuid: string, data: AccountInfo) {
	return UpdateUser({ uuid: uuid }, { account: data });
}

export function UpdatePlayerData(uuid: string, data: PlayerInfo) {
	return UpdateUser({ uuid: uuid }, { player: data });
}

export async function UpdateProfilesData(uuid: string, data: Profiles) {
	const user = await GetUser(uuid);
	const oldInfo = user?.info ?? infoDefaults;
	const newInfo = { ...oldInfo, times_fetched: data.times_fetched };

	return UpdateUser({ uuid: uuid }, { skyblock: data, info: newInfo });
}

export async function UpdateUserInfo(uuid: string, data: Partial<UserInfo>) {
	const user = await GetUser(uuid);
	const oldInfo = user?.info ?? infoDefaults;
	const newInfo = { ...oldInfo, ...data };

	return UpdateUser({ uuid: uuid }, { info: newInfo });
}

export async function GetUserInfo(uuid: string) {
	const user = await GetUser(uuid);
	if (!user) return null;

	if (!user.info) {
		await UpdateUser({ uuid: uuid }, { info: infoDefaults });
	}

	return user.info ?? null;
}

export async function UpdateCheating(uuid: string, cheating: boolean) {
	const user = await GetUser(uuid);
	const oldInfo = user?.info ?? infoDefaults;
	const newInfo = { ...oldInfo, cheating: cheating };

	return UpdateUser({ uuid: uuid }, { info: newInfo });
}

export interface LeaderboardEntry {
	uuid: string;
	ign: string;
	rank: number;
	farming: {
		weight: number;
		profile: string;
	};
}

export async function GetPlayerRank(uuid: string) {
	const user = await GetUser(uuid);
	if (!user || !user.skyblock?.profiles) return -1;

	const now = Date.now();
	if (now - CachedLeaderboardUpdated < LEADERBOARD_UPDATE_INTERVAL) {
		return CachedLeaderboardMap.get(uuid)?.rank ?? -1;
	}

	await FetchWeightLeaderboard();
	return CachedLeaderboardMap.get(uuid)?.rank ?? -1;
}

export async function GetWeightLeaderboard(offset = 0, limit = 20) {
	limit = Math.min(limit, 1000);
	offset = Math.min(offset, 1000 - limit);

	const now = Date.now();
	if (now - CachedLeaderboardUpdated < LEADERBOARD_UPDATE_INTERVAL) {
		return CachedLeaderboard.slice(offset, offset + limit);
	}

	await FetchWeightLeaderboard();

	return CachedLeaderboard.slice(offset, offset + limit);
}

export async function FetchWeightLeaderboard() {
	const list = await User.findAll({
		limit: 1_000,
		attributes: {
			exclude: ['id', 'account', 'player', 'skyblock', 'user', 'createdAt', 'updatedAt', 'info'],
			include: [[sequelize.fn('jsonb_extract_path', sequelize.col('info'), 'highest', 'farming'), 'farming']],
		},
		where: { ['info.cheating']: { [Op.not]: true }, ['info.highest.farming.weight']: { [Op.gt]: 0 } },
		order: [[sequelize.literal('farming'), 'DESC']],
		raw: true,
		nest: true,
	});

	CachedLeaderboard = list.map((user, i) => ({ ...user, rank: i + 1 })) as unknown as LeaderboardEntry[];
	CachedLeaderboardUpdated = Date.now();

	CachedLeaderboardMap = new Map(CachedLeaderboard.map((user) => [user.uuid, user]));
}

export async function GetViewLeaderboard(limit = 10) {
	const list = await User.findAll({
		limit: limit,
		attributes: {
			exclude: ['id', 'account', 'player', 'skyblock', 'user', 'createdAt', 'updatedAt', 'info'],
			include: [[sequelize.fn('jsonb_extract_path', sequelize.col('info'), 'times_fetched'), 'views']],
		},
		where: { ['info.cheating']: { [Op.not]: true }, ['info.times_fetched']: { [Op.gt]: 0 } },
		order: [[sequelize.literal('views'), 'DESC']],
		raw: true,
		nest: true,
	});

	return list;
}
