import { POSTGRES_URI } from "$env/static/private";
import type { Profiles, AccountInfo, PlayerInfo } from "$lib/skyblock";
import { Op, Sequelize } from "sequelize";
import { UsersInit, type DiscordUser, type UserInfo, type UserUpdateOptions, type UserWhereOptions } from "./models/users";

export type DataUpdate = { 
	account: AccountInfo, 
	player: PlayerInfo,
	profiles: Profiles 
}

const sequelize = new Sequelize(POSTGRES_URI, {
	dialect: 'postgres',
	logging: false,
})

const User = UsersInit(sequelize);

let isReady = false;

export async function SyncTables() {
	if (isReady) return;
	isReady = true;
	await User.sync({ force: false });
}

(async () => {
	await SyncTables();
	console.log('Connected to database.');
})();

export async function GetUser(uuid: string) {
	return await findOne({ uuid: uuid });
}

export async function GetUserByIGN(ign: string) {
	return await findOne({ 
		ign: { [Op.iLike]: '%' + ign } 
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
		"player.player.social.links.DISCORD": { 
			[Op.iLike]: `${discordUser.username}#${discordUser.discriminator}` 
		} 
	});

	return user;
}

const infoDefaults: UserInfo = {
	linked: false,
	id: null,
	cheating: false,
	times_fetched: 0
};

export function CreateUser(uuid: string, ign: string) {
	return User.create({ uuid: uuid, ign: ign, info: infoDefaults });
}

export function UpdateUserData({ account, player, profiles }: DataUpdate) {
	return UpdateUser({
		ign: account.account.name,
		skyblock: profiles,
		account: account,
		player: player,
	}, { uuid: account.account.id });
}

export function UpdateUser(where: UserWhereOptions, data: UserUpdateOptions) {
	return User.update(data, {
		where: where
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

	return user?.info ?? null;
}



export async function UpdateCheating(uuid: string, cheating: boolean) {
	const user = await GetUser(uuid);
	const oldInfo = user?.info ?? infoDefaults;
	const newInfo = { ...oldInfo, cheating: cheating };

	return UpdateUser({ uuid: uuid }, { info: newInfo });
}

export async function GetViewLeaderboard(limit = 20) {
	const list = await User.findAll({ 
		limit: limit,
		attributes:	{ 
			exclude: ['account', 'player', 'skyblock', 'createdAt', 'updatedAt', 'user'],
		},
		where: { ['info.cheating']: { [Op.not]: true }, ['info.times_fetched']: { [Op.gt]: 0 } },
		order: [['info.times_fetched', 'DESC']], 
	});

	return list.sort((prev, next) => {
		return (next.info?.times_fetched ?? 0) - (prev.info?.times_fetched ?? 0);
	});
}
