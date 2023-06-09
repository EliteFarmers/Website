import { fetchProfiles } from '$lib/data';
import { RateLimiter } from '$lib/limiter/RateLimiter';
import type { Profiles, AccountInfo, PlayerInfo } from '$lib/skyblock';
import { Op, Sequelize } from 'sequelize';
import {
	UsersInit,
	type DiscordUser,
	type UserInfo,
	type UserUpdateOptions,
	type UserWhereOptions,
} from './models/users';
import { client } from './redis';
import dbConfig from './database.json';
import { building } from '$app/environment';

export interface DataUpdate {
	account: AccountInfo;
	player: PlayerInfo;
	profiles: Profiles;
}

const mode = (process.env.NODE_ENV ?? 'development') as 'development' | 'production' | 'test';
const settings = dbConfig[mode] as typeof dbConfig.development;

export const sequelize = new Sequelize(settings.database, settings.username, settings.password, {
	port: settings.port,
	host: settings.host,
	dialect: 'postgres',
	logging: false,
});

export const User = UsersInit(sequelize);
// export const Server = ServersInit(sequelize);
// export const Event = EventsInit(sequelize);

let limiter: RateLimiter;

export let DBReady = false;

export async function SyncTables() {
	if (DBReady || building) return;
	DBReady = true;

	try {
		await sequelize.authenticate();
		if (!client.isOpen) {
			await client.connect();
		}

		await User.sync({ force: false });
		//await Server.sync({ force: false });
		//await Event.sync({ force: false });

		limiter = new RateLimiter({ tokensPerInterval: 4, interval: 'minute' });
		void RefreshDataTask();

		console.log('Connected to database.');
	} catch (error) {
		console.log(error);
		DBReady = false;
		console.log('Unable to connect to the database!');
	}
}

// Runs once on startup
await SyncTables();
// ==================== //

export async function GetUser(uuid: string) {
	if (!uuid) return null;
	return await findOne({ uuid: uuid });
}

export async function GetUserByIGN(ign: string) {
	return await findOne({
		ign: { [Op.iLike]: ign.replace(/_/g, '\\_') },
	});
}

export async function GetUserByDiscordID(id: string) {
	if (!id) return null;
	return await findOne({ id: id });
}

export async function FindSimilarUsers(input: string, limit = 5) {
	const users = (await sequelize.query(
		`
		SELECT ign, uuid, similarity
		FROM (
			SELECT ign, uuid, player->'success' as played, LEVENSHTEIN(ign, '${input.replace(/_/g, '\\_')}') as similarity
			FROM users
			ORDER BY similarity ASC
		) sub
		WHERE played is not null
		LIMIT ${limit};
	`,
		{
			raw: true,
			nest: true,
		}
	)) as { ign: string; similarity: number }[];

	return users;
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
	const username =
		discordUser.discriminator && discordUser.discriminator !== '0'
			? `${discordUser.username}#${discordUser.discriminator}`
			: discordUser.username;

	const user = await findOne({
		'player.player.social.links.DISCORD': {
			[Op.eq]: username,
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
			crop: 'N/A',
		},
	},
	profiles: {},
};

export function CreateUser(uuid: string, ign: string) {
	try {
		return User.create({
			uuid: uuid,
			ign: ign,
			info: infoDefaults,
		});
	} catch (e) {
		if (e && (e as Error).name === 'SequelizeUniqueConstraintError') {
			return GetUser(uuid);
		}
	}
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

export async function GetAccountFromDiscord(id: string) {
	const user = await GetUserByDiscordID(id);
	if (!user) return null;

	return user.account;
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
	return UpdateUser({ uuid: uuid }, { account: data, ign: data.account.name });
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

export async function UpdateFaceData(uuid: string, data: { base: string; overlay: string }) {
	const user = await GetUser(uuid);
	const oldAccount = user?.account ?? null;
	if (!oldAccount) return null;

	const newAccount = { ...oldAccount, account: { ...oldAccount.account, face: data } };
	return UpdateUser({ uuid: uuid }, { account: newAccount });
}

export async function UpdateCheating(uuid: string, cheating: boolean) {
	const user = await GetUser(uuid);
	const oldInfo = user?.info ?? infoDefaults;
	const newInfo = { ...oldInfo, cheating: cheating };

	return UpdateUser({ uuid: uuid }, { info: newInfo });
}

export async function RefreshDataTask(limit = 250) {
	const leaderboard = await client.ZRANGE(`weight:farming`, 0, limit, { REV: true });

	// Refresh all users, one user per 15 seconds
	for (const entry of leaderboard) {
		await limiter.removeTokens(1);

		const uuid = entry.split(':')[0];

		Promise.allSettled([
			// Room for more tasks here if ever needed
			fetchProfiles(uuid, true),
		]).catch(() => undefined);
	}

	void RefreshDataTask();
}
