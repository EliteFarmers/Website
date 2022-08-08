import { POSTGRES_URI } from "$env/static/private";
import type { Profiles, AccountInfo, PlayerInfo } from "$lib/skyblock";
import { Op, Sequelize } from "sequelize";
import { UsersInit, type DiscordUser, type UserUpdateOptions, type UserWhereOptions } from "./models/users";

export type DataUpdate = { 
	account: AccountInfo, 
	player: PlayerInfo,
	profiles: Profiles 
}

const User = UsersInit(new Sequelize(POSTGRES_URI, {
	dialect: 'postgres',
	logging: false,
}));

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

export function GetUser(uuid: string) {
	return User.findOne({ where: { uuid: uuid } });
}

export function GetUserByIGN(ign: string) {
	return User.findOne({ where: { ign: { [Op.iLike]: '%' + ign } } });
}

export function GetUserByDiscordID(id: string) {
	return User.findOne({ where: { id: id } });
}

export function CreateUser(uuid: string, ign: string) {
	return User.create({ uuid: uuid, ign: ign });
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

export function LinkDiscordUser(uuid: string, user: DiscordUser) {
	return UpdateUser({ uuid: uuid }, { id: user.id, user: user });
}

export function UnlinkDiscordUser(uuid: string) {
	return UpdateUser({ uuid: uuid }, { id: null, user: null });
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

export function UpdateProfilesData(uuid: string, data: Profiles) {
	return UpdateUser({ uuid: uuid }, { skyblock: data });
}