import type { AccountInfo, APISettings, CommunityUpgrades, ContestData, CraftedMinions, CropName, Inventories, JacobData, MemberData, PlayerData, ProfileData, ProfileMember, Profiles, RawProfileData, RawProfileMember, RawProfileMembers } from './skyblock.d';
import { ACCOUNT_UPDATE_INTERVAL, API_CROP_TO_CROP, EXCLUDED_FIELDS, INVENTORY_FIELDS_RENAME, KEPT_PLAYER_FIELDS, MOVE_TO_STATS, PLAYER_UPDATE_INTERVAL, PROFILE_UPDATE_INTERVAL } from './constants/data';
import { CreateUser, GetUser, GetUserByIGN, UpdateAccountData, UpdatePlayerData, UpdateProfilesData } from '$db/database';
import { parse, simplify } from 'prismarine-nbt';
import { getContestTimeStamp } from './format';
import type { User } from '$db/models/users';

const RESPONSE_VERSION = 1;

export async function accountFromIGN(ign: string) {

	// First check if the account is cached.
	const user = await GetUserByIGN(ign);
	// If the account is cached and newer than the interval, return it.
	if (user) return accountFromUUID(user.uuid, user);

	// If the account is not cached, get it from the API.
	const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${ign}`).catch(() => undefined);

	if (!response) return undefined;

	if (response.status !== 200) {
		return undefined;
	}

	const data = await response.json();

	return accountFromUUID(data.id);
}

export async function accountFromUUID(uuid: string, user?: User) {

	if (!user) {
		user = await GetUser(uuid) ?? undefined;
	}

	// If user account data is older than the interval, get the latest data from the API.
	if (user && user?.account?.success && (Date.now() - user.account.last_fetched) < ACCOUNT_UPDATE_INTERVAL) {
		return user.account;
	}

	const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`).catch(() => undefined);

	if (!response) return user?.account ?? undefined;

	if (response.status !== 200) {
		return user?.account ?? undefined;
	}

	const data = await response.json();

	const result: AccountInfo = {
		success: true,
		last_fetched: Date.now(),
		version: RESPONSE_VERSION,
		account: data
	}

	if (user) {
		await UpdateAccountData(uuid, result);
	} else {
		if (!await GetUser(uuid)) {
			await CreateUser(uuid, result.account.name).then(() => UpdateAccountData(uuid, result));
		} else {
			await UpdateAccountData(uuid, result);
		}
	}

	return result;
}

export async function fetchProfiles(uuid: string, key: string): Promise<Profiles | undefined> {

	// First check if the profiles are cached.
	const user = await GetUser(uuid);
	// If the profiles are cached, return it.
	if (user && user.skyblock?.success) {
		// If the profiles are older than the interval, get them from the API.
		if ((Date.now() - user.skyblock.last_fetched) > PROFILE_UPDATE_INTERVAL) {
			fetchNewProfiles(user, uuid, key);
		}
		return user.skyblock;
	}

	return await fetchNewProfiles(user, uuid, key);
}

async function fetchNewProfiles(user: User | null, uuid: string, key: string) {
	if (!user) {
		await accountFromUUID(uuid);
	}

	const response = await fetch(`https://api.hypixel.net/skyblock/profiles?uuid=${uuid}&key=${key}`);

	if (!response) return user?.skyblock ?? undefined;

	if (response.status !== 200) {
		return user?.skyblock ?? undefined;
	}

	try {
		const data = await response.json();
		const parsed = await GetProfiles(data.profiles, uuid, user ?? undefined);

		if (user) {
			await UpdateProfilesData(uuid, parsed);
		}
	
		return parsed;
	} catch (error) {
		console.log(error);
		return user?.skyblock ?? undefined;
	}
}

export async function fetchPlayer(uuid: string, key: string) {

	// First check if the player is cached.
	const user = await GetUser(uuid);
	// If the player is cached and newer than the interval, return it.
	if (user && user.player?.success && (Date.now() - user.player.last_fetched) < PLAYER_UPDATE_INTERVAL) {
		return user.player;
	}

	if (!user) {
		await accountFromUUID(uuid);
	}

	const response = await fetch(`https://api.hypixel.net/player?uuid=${uuid}&key=${key}`);

	if (!response) return user?.player ?? undefined;

	if (response.status !== 200) {
		return user?.player ?? undefined;
	}

	try {
		const data = await response.json();
		if (!data.player) return user?.player ?? undefined;

		const player = formatPlayer(data.player);

		const result = {
			success: true,
			last_fetched: Date.now(),
			version: RESPONSE_VERSION,
			player: player
		}

		if (user) {
			await UpdatePlayerData(uuid, result);
		}
	
		return result;
	} catch (error) {
		return undefined;
	}
}

function formatPlayer(player: PlayerData) {
	for (const key in player) {
		let keep = false;
		for (const field of KEPT_PLAYER_FIELDS) {
			if (key.startsWith(field)) keep = true;
		}
		if (!keep) delete player[key];
	}
	return player;
}

export async function GetProfiles(profiles: RawProfileData[], uuid: string, user?: User) {
	const data: Profiles = {
		success: profiles ? profiles.length > 0 : false,
		last_fetched: Date.now(),
		times_fetched: user?.skyblock?.times_fetched ?? 0,
		version: RESPONSE_VERSION,
		profiles: [],
	};

	if (!user || !user.skyblock?.success) {
		data.last_fetched = user?.skyblock?.last_fetched ?? Date.now();

		data.profiles = await formatProfiles(profiles, uuid);
		await loadNBTData(data.profiles);
		
		return data;
	}

	data.times_fetched++;

	const oldProfiles = user.skyblock.profiles;
	const newProfiles = await formatProfiles(profiles, uuid);

	for (const profile of newProfiles) {
		const oldProfile = oldProfiles.find((p: ProfileData) => p.profile_id === profile.profile_id);
		
		if (!oldProfile) {
			data.profiles.push(profile);
			continue;
		}

		const member = profile.member;
		const oldMember = oldProfile.member;

		const apiSettings = profile.api;
		let key: keyof APISettings;
		for (key in apiSettings) {
			apiSettings[key].history = oldProfile.api?.[key]?.history ?? [];

			const oldState = oldProfile.api?.[key];
			const newState = profile.api?.[key];

			if (oldState?.enabled !== newState?.enabled) {
				apiSettings[key].history.push({
					enabled: oldProfile.api?.[key]?.enabled ?? false,
					fetched: oldState.last_fetched,
				});
			}
		}

		const newInv = member.inventories;
		const oldInv = oldMember.inventories;

		const collected: ProfileMember = {
			...member,
			skills: member.skills ?? oldMember.skills,
			inventories: {
				armor: newInv.armor,
				player: newInv.player ?? oldInv.player,
				ender_chest: newInv.ender_chest ?? oldInv.ender_chest,
				backpacks: newInv.backpacks ?? oldInv.backpacks,
				talismans: newInv.talismans ?? oldInv.talismans,
				equipment: newInv.equipment ?? oldInv.equipment,
				wardrobe: newInv.wardrobe ?? oldInv.wardrobe,
				vault: newInv.vault ?? oldInv.vault,
				potions: newInv.potions ?? oldInv.potions,
				quiver: newInv.quiver ?? oldInv.quiver,
			},
			collection: member.collection ?? oldMember.collection,
			collection_tiers: member.collection_tiers ?? oldMember.collection_tiers,
		};


		data.profiles.push({
			...profile,
			member: collected,
			api: apiSettings,
		});
	}

	await loadNBTData(data.profiles);

	return data;
}



export async function formatProfiles(profiles: RawProfileData[], uuid: string) {
	const data: ProfileData[] = [];
	if (!profiles) return data;

	for (const profile of profiles) {

		// Crafted minions are spread amongst profile members.
		let allMinions: string[] = [];

		const { members, minions } = await formatMembers(profile.members, uuid);
		allMinions = allMinions.concat(minions ?? []);

		// Add the other members' minions to their own profile.
		profile.members[uuid].crafted_generators?.push(...allMinions);

		const memberData = formatMemberData(profile.members[uuid]);
		
		data.push({
			profile_id: profile.profile_id,
			member: memberData,
			members: members,
			cute_name: profile.cute_name,
			coop: Object.keys(profile.members).length > 1,
			community_upgrades: getCommunityUpgradeData(profile),
			game_mode: profile.game_mode, 
			banking: getBankingData(profile),
			last_save: profile.last_save,
			api: getAPISettings(memberData),
		});
	}

	await loadNBTData(data);

	return data;
}

async function loadNBTData(profiles: ProfileData[]) {
	const queue = [];

	for (const profile of profiles) {
		const data = profile.member;
	
		for (const key in data.inventories) {
			if (key === 'backpacks') continue;
	
			queue.push(hydrateNBT(data.inventories, key));
		}
	
		if (data.inventories?.backpacks) {
			for (const key in data.inventories.backpacks) {
				queue.push(hydrateNBT(data.inventories.backpacks, key));
			}
		}
	}

	await Promise.allSettled(queue);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function hydrateNBT(element: any, key: string) {
	if (!element?.[key]?.data) return;

	const nbt = await parse(Buffer.from(element[key].data, 'base64'));
	element[key] = simplify(nbt.parsed)?.i ?? false;
}

async function formatMembers(members: RawProfileMembers, uuid: string) {

	const data: MemberData[] = [];
	const minions: string[] = [];

	const uuids = Object.keys(members).filter((key) => key !== uuid);

	for (const memberUUID of uuids) {
		const member = members[memberUUID];
		minions.push(...(member.crafted_generators ?? []));
		
		const memberUser = await GetUser(memberUUID);
		let memberName = memberUser?.ign;
		if (!memberName) {
			const account = await accountFromUUID(memberUUID);
			memberName = account?.account?.name ?? 'Unknown';
		}

		data.push({ uuid: memberUUID, last_seen: member.last_save, ign: memberName });
	};

	data.sort((a, b) => b.last_seen - a.last_seen);
	
	return { members: data, minions };
}

function getBankingData(profile: ProfileData | RawProfileData) {
	return profile.banking ? {
		balance: profile.banking.balance,
		// Transactions aren't included in the API response.
	} : undefined;
}

function getCommunityUpgradeData(profile: RawProfileData) {
	if (!profile.community_upgrades) return undefined;

	const upgrades = profile.community_upgrades.upgrade_states;

	if (!upgrades || upgrades.length < 1) return undefined;

	const data: CommunityUpgrades = {
		minion_slots: 0,
		island_size: 0,
		guests_count: 0,
		coins_allowance: 0,
		coop_slots: 0
	};

	for (const upgrade of upgrades) {
		if (data[upgrade.upgrade] > upgrade.tier) continue;
		data[upgrade.upgrade] = upgrade.tier;
	}

	return data;
}

const excludedFields = EXCLUDED_FIELDS;

function formatMemberData(member: RawProfileMember): ProfileMember {

	// Remove ignored fields.
	for (const field of excludedFields) {
		delete member[field];
	}

	const inventories = condenseInventories(member);

	const data: ProfileMember = {
		skills: condenseGroup(member, 'experience_skill_', (a) => a.replace('social2', 'social')),
		jacob: formatContests(member),
		minions: condenseMinions(member),
		collection_tiers: condenseCollTiers(member),
		fairy: condenseGroup(member, 'fairy_'),
		essence: condenseGroup(member, 'essence_', undefined, ['soulflow']),
		inventories: inventories,
		...member,
	}

	// Remove a few fields that are not needed.
	if (data.dungeons?.dungeon_types?.catacombs?.best_runs) {
		delete data.dungeons.dungeon_types.catacombs.best_runs;
	}

	const moveToStats = MOVE_TO_STATS;
	for (const field of moveToStats) {
		if (!data[field]) continue;

		data.stats[field] = data[field];
		delete data[field];
	}

	return data;
}

function getAPISettings(member: ProfileMember) {
	const settings: APISettings = {
		skills: {
			enabled: (member.skills) ? true : false,
			last_fetched: Date.now(), history: []
		},
		collections: {
			enabled: (member.collection) ? true : false,
			last_fetched: Date.now(), history: []
		},
		inventory: {
			enabled: (member.inventories?.player) ? true : false,
			last_fetched: Date.now(), history: []
		},
		vault: {
			enabled: (member.inventories?.vault) ? true : false,
			last_fetched: Date.now(), history: []
		}
	}
	return settings;
}

function formatContests(member: RawProfileMember) {
	const jacob2 = member.jacob2;

	const contests: ContestData = {
		nether_wart: [], potato: [], carrot: [], wheat: [], pumpkin: [],
		melon: [], sugar_cane: [], cactus: [], cocoa: [], mushroom: [] 
	};

	const jacob: JacobData = {
		medals: jacob2?.medals_inv ?? { bronze: 0, silver: 0, gold: 0 },
		perks: jacob2?.perks ?? { double_drops: 0, farming_level_cap: 0 },
		participations: 0,
		contests: contests
	};

	if (!jacob2) return jacob;

	for (const contestKey in jacob2.contests) {
		const contest = jacob2.contests[contestKey];

		const split = contestKey.split(':');
		const cropName = getCropName(split[2]);
		if (!cropName) continue;
		if (contest.collected >= 100) jacob.participations++;

		contests[cropName].push({
			collected: contest.collected,
			timestamp: getContestTimeStamp(contestKey),
			position: contest.claimed_position,
			participants: contest.claimed_participants
		});
	}

	delete member.jacob2;

	return jacob;
}

function getCropName(crop: string) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const name = (API_CROP_TO_CROP as any)[crop];

	if (!name) return undefined;

	return name as CropName;
}

function condenseMinions(member: RawProfileMember) {
	const minions: CraftedMinions = {};

	if (!member.crafted_generators) {
		delete member.crafted_generators;
		return minions;
	}

	for (const key of member.crafted_generators) {
		const minion = key.substring(0, key.lastIndexOf('_'));
		const tier = parseInt(key.substring(key.lastIndexOf('_') + 1));
		// Byte shift the tier into the value
		minions[minion] = minions[minion] | (1 << tier);
	}

	delete member.crafted_generators;

	return minions;
}

function condenseCollTiers(member: RawProfileMember) {
	const tiers: CraftedMinions = {};

	if (!member.unlocked_coll_tiers) {
		delete member.unlocked_coll_tiers;
		return undefined;
	}

	for (const key of member.unlocked_coll_tiers) {
		const index = key.lastIndexOf('_');
		const collection = key.substring(0, index);
		const tier = key.substring(index + 1);

		tiers[collection] = Math.max(tiers[collection] ?? 0, parseInt(tier));
	}

	delete member.unlocked_coll_tiers;

	// If there are no tiers, delete the field.
	if (Object.keys(tiers).length < 1) {
		return undefined;
	}

	return tiers;
}

function condenseGroup(member: RawProfileMember, prefix: string, rename?: (arg: string) => string, extra?: string[]) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const group: any = {};

	for (const key in member) {
		const isExtra = extra?.includes(key);
		if (!key.startsWith(prefix) && !isExtra) continue;

		let name = isExtra ? key : key.substring(prefix.length);
		if (rename) name = rename(name);
		
		group[name] = member[key];

		delete member[key];
	}

	if (Object.keys(group).length < 1) {
		return undefined;
	}

	return group;
}

function condenseInventories(member: RawProfileMember): Inventories {
	const inventories: Inventories = { 
		armor: [],
	};

	const keys = INVENTORY_FIELDS_RENAME;

	for (const key in keys) {
		const inventory = member[key];
		if (!inventory) continue;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(inventories as any)[(keys as any)[key]] = inventory;
		delete member[key];
	}

	return inventories;
};