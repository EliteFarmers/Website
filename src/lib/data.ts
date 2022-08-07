import type { CommunityUpgrades, ContestData, CraftedMinions, CropName, Inventories, JacobData, ProfileData, ProfileMember, Profiles, RawProfileData, RawProfileMember } from './skyblock.d';
import { parse, simplify } from 'prismarine-nbt';
import { API_CROP_TO_CROP, EXCLUDED_FIELDS, INVENTORY_FIELDS_RENAME, KEPT_PLAYER_FIELDS, MOVE_TO_STATS } from './constants/data';
import { getContestTimeStamp } from './format';


export async function accountFromIGN(ign: string) {
	const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${ign}`).catch(() => undefined);

	if (!response) return undefined;

	if (response.status !== 200) {
		return response;
	}

	const data = await response.json();

	return accountFromUUID(data.id);
}

export async function accountFromUUID(ign: string) {
	const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${ign}`).catch(() => undefined);

	if (!response) return undefined;

	if (response.status !== 200) {
		return response;
	}

	return response.json();
}

export async function fetchProfiles(uuid: string, key: string): Promise<Profiles | undefined> {
	const response = await fetch(`https://api.hypixel.net/skyblock/profiles?uuid=${uuid}&key=${key}`);

	if (!response) return undefined;

	if (response.status !== 200) {
		return undefined;
	}

	return new Promise((resolve,) => {
		response.json().then(async (data) => {
			const startTime = Date.now();
			const parsed = await formatProfiles(data.profiles, uuid);
			const endTime = Date.now();

			console.log(`[Skyblock] Parsed profiles in ${endTime - startTime}ms.`);

			resolve(parsed);
		}).catch((e) => {
			console.log('Failed to fetch profile data.', e);
			resolve(undefined);
		});
	});
}

export async function fetchPlayer(uuid: string, key: string) {
	const response = await fetch(`https://api.hypixel.net/player?uuid=${uuid}&key=${key}`);

	if (!response) return undefined;

	if (response.status !== 200) {
		return response;
	}

	return new Promise((resolve,) => {
		response.json().then(async (data) => {

			const player = data.player;

			for (const key in player) {
				let keep = false;
				for (const field of KEPT_PLAYER_FIELDS) {
					if (key.startsWith(field)) keep = true;
				}
				if (!keep) delete player[key];
			}

			data.player = player;

			resolve(data);
		}).catch(() => {
			console.log('Failed to fetch player data.');
			resolve(undefined);
		});
	});
}

export async function formatProfiles(profiles: RawProfileData[], uuid: string) {
	const data: Profiles = {
		last_fetched: Date.now(),
		version: 1,
		profiles: []
	};
	
	for (const profile of profiles) {

		// Crafted minions are spread amongst profile members.
		let minions: string[] = [];

		const members = Object.keys(profile.members)
			.filter((key) => key !== uuid)
			.map(id => {
				const member = profile.members[id];
				minions = minions.concat(member.crafted_generators ?? []);
				
				return { uuid: id, last_seen: member.last_save }
			})
			.sort((a, b) => b.last_seen - a.last_seen);

		// Add the other members' minions to their own profile.
		profile.members[uuid].crafted_generators?.push(...minions);

		const memberData = formatMemberData(profile.members[uuid]);
		
		data.profiles.push({
			profile_id: profile.profile_id,
			member: memberData,
			members: members,
			cute_name: profile.cute_name,
			coop: Object.keys(profile.members).length > 1,
			community_upgrades: getCommunityUpgradeData(profile),
			game_mode: profile.game_mode, 
			banking: getBankingData(profile),
			last_save: profile.last_save
		});
	}

	await loadNBTData(data.profiles);

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
	
		if (data.inventories.backpacks) {
			for (const key in data.inventories.backpacks) {
				queue.push(hydrateNBT(data.inventories.backpacks, key));
			}
		}
	}

	Promise.allSettled(queue);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function hydrateNBT(element: any, key: string) {
	if (!element?.[key]?.data) return;

	const nbt = await parse(Buffer.from(element[key].data, 'base64'));
	element[key] = simplify(nbt.parsed)?.i ?? false;
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
		inventories: inventories as Inventories,
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
		return tiers;
	}

	for (const key of member.unlocked_coll_tiers) {
		const index = key.lastIndexOf('_');
		const collection = key.substring(0, index);
		const tier = key.substring(index + 1);

		tiers[collection] = Math.max(tiers[collection] ?? 0, parseInt(tier));
	}

	delete member.unlocked_coll_tiers;

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

	return group;
}

function condenseInventories(member: RawProfileMember): Inventories {
	const inventories: Inventories = {
		player: [], armor: [], ender_chest: [],
		backpacks: [], talismans: [], equipment: [],
		wardrobe: [], vault: [], potions: [], quiver: []
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