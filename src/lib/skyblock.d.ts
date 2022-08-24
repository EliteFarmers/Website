export type UUID = string;
export type TimestampMills = number;
type Tier = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type Skill = 'farming' | 'mining' | 'combat' | 'foraging' | 'fishing' | 'enchanting' | 'alchemy' | 'taming' | 'carpentry' | 'runecrafting' | 'social'; 

export type RawProfileResponse = {
	success: boolean;
	profiles: RawProfileData[];
}

export type Profiles = {
	success: boolean;
	last_fetched: TimestampMills;
	times_fetched: number;
	version: number;
	profiles: ProfileData[];
}

export type ProfileData = {
	profile_id: UUID;
	member: ProfileMember;
	members: MemberData[];
	cute_name: string;
	community_upgrades?: CommunityUpgrades;
	game_mode?: string; 
	banking?: BankingData;
	last_save?: TimestampMills;
	coop: boolean;
	api: APISettings;
}

export type APISettings = {
	skills: APISetting;
	collections: APISetting;
	inventory: APISetting;
	vault: APISetting;
};

export type APISetting = {
	enabled: boolean;
	last_fetched: TimestampMills;
	history: {
		enabled: boolean;
		fetched: TimestampMills;
	}[];
}

type MemberData = {
	uuid: UUID;
	last_seen: TimestampMills;
}

type CommunityUpgradeNames = 'minion_slots' | 'island_size' | 'guests_count' | 'coins_allowance' | 'coop_slots';

export type CommunityUpgrades = {
	[key in CommunityUpgradeNames]: Tier;
}

export type RawProfileData = {
	profile_id: UUID;
	members: RawProfileMembers;
	cute_name: string;
	community_upgrades?: RawCommunityUpgrades;
	game_mode?: string; 
	banking?: BankingData;
	last_save?: TimestampMills;
}

export type RawProfileMembers = { 
	[uuid: UUID]: RawProfileMember
}

export type ProfileMember = {
	last_save: TimestampMills;
	inventories: Inventories;
	skills?: ExperienceSkills;
	collection?: { 
		[key: string]: number 
	};
	collection_tiers?: {
		[key: string]: number
	};
	minions: CraftedMinions;
	jacob: JacobData;
	fairy: FairyData;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any
}

export type SkillName = 'alchemy' | 'carpentry' | 'combat' | 'enchanting' | 'farming' | 'foraging' | 'fishing' | 'mining' | 'runecrafting' | 'social' | 'taming';

export type ExperienceSkills = {
	[key in SkillName]: number;
}

export type CropName = 'cactus' | 'carrot' | 'cocoa' | 'melon' | 'mushroom' | 'nether_wart' | 'potato' | 'pumpkin' | 'sugar_cane' | 'wheat';

export type ContestData = {
	[key in CropName]: JacobContest[];
}

export type CraftedMinions = {
	[key: string]: number;
}

export type JacobContest = {
	collected: number;
	timestamp: number;
	position?: number;
	participants?: number;
}

export type JacobData = {
	medals: MedalInventory;
	perks: FarmingPerks;
	participations: number;
	contests: ContestData
};

export type FairyData = {
	souls_collected: number;
	souls: number;
	exchanges: number;
};

export type Inventories = {
	player?: ItemStack[];
	armor: ItemStack[];
	ender_chest?: ItemStack[];
	backpacks?: ItemStack[][];
	talismans?: ItemStack[];
	equipment?: ItemStack[];
	wardrobe?: ItemStack[];
	vault?: ItemStack[];
	potions?: ItemStack[];
	quiver?: ItemStack[];
}

export type RawProfileMember = {
	last_save: TimestampMills;
	inv_armor: NBTData;
	experience_skill_alchemy: number;
	experience_skill_carpentry: number;
	experience_skill_combat: number;
	experience_skill_enchanting: number;
	experience_skill_farming: number;
	experience_skill_fishing: number;
	experience_skill_foraging: number;
	experience_skill_mining: number;
	experience_skill_runecrafting: number;
	experience_skill_taming: number;
	collection: { 
		[key: string]: number 
	},
	crafted_generators?: string[],
	jacob2?: RawAPIJacobData,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any
}

export type NBTData = {
	type: number,
	data: {
		type: string,
		value: ItemStack[]
	}
}

export type ItemStack = {
	Count: {
		type: string,
		value: number
	},
	Damage: {
		type: string,
		value: number
	},
	id: {
		type: string,
		value: number
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	tag: any,
}

export type RawCommunityUpgrades = {
	upgrade_states: CommunityUpgradeState[]
}

export type CommunityUpgradeState = {
	upgrade: CommunityUpgradeNames;
	tier: Tier;
	started_ms: TimestampMills;
	started_by: UUID;
	claimed_ms: TimestampMills;
	claimed_by: UUID;
	fasttracked: boolean;
}

export type BankingData = {
	balance: number,
	transactions?: BankingTransaction[]
}

export type BankingTransaction = {
	amount: number,
	timestamp: TimestampMills,
	action: 'DEPOSIT' | 'WITHDRAW',
	initiator_name: `§b${string}` | 'Bank Interest'
}

export type MedalInventory = {
	bronze: number,
	silver: number,
	gold: number
}

export type FarmingPerks = {
	double_drops: number,
	farming_level_cap: number
}

export type FarmingContestScores = {
	[key in CropString]: FarmingContest;
};

export type ContestCrop = 'cactus' | 'carrot' | 'cocoa' | 'melon' | 'mushroom' | 'netherwart' | 'potato' | 'pumpkin' | 'sugarcane' | 'wheat';


type RawAPIProfiles = {
	success: boolean,
	profiles: RawAPIProfile[]
}

type RawAPIProfile = {
	profile_id: string,
	members: {
		[uuid: string]: RawAPIMember
	},
	cute_name: string,
	game_mode: string, // Probably will use soon
	[key: string]: unknown // Not using anything else
}

type RawAPIMember = {
	last_save: number,
	experience_skill_farming: number,
	collection: { 
		[key: string]: number 
	},
	crafted_generators: string[],
	jacob2: RawAPIJacobData,
	[key: string]: unknown // Not using anything else
}

type RawAPIJacobData = {
	medals_inv: MedalInventory,
	perks: FarmingPerks,
	talked: boolean,
	contests: {
		[key: string]: FarmingContest
	}
}

type FarmingContest = {
	collected: number,
	claimed_rewards?: true,
	claimed_position?: number,
	claimed_participants?: number
}

export type PlayerInfo = {
	success: boolean,
	last_fetched: TimestampMills,
	version: number,
	player: PlayerData
}

export type PlayerData = {
	firstLogin: number,
	lastLogin: number,
	karma: number,
	rank?: RankName,
	newPackageRank?: RankName,
	rankPlusColor?: PlusColor,
	socialMedia?: {
		links?: {
			DISCORD?: string,
			HYPIXEL?: string,
			[key: string]: string
		}
	},
	skyblock_extra?: {
		ozanne_coins?: number,
		[key: string]: unknown
	}
	[key: string]: unknown
}

export type AccountInfo = {
	success: boolean,
	last_fetched: TimestampMills,
	version: number,
	account: AccountData
}

export type AccountData = {
	id: string,
	name: string,
	properties: {
		name: string,
		value: string,
	}[]
}

export type PlusColor = 'BLACK' | 'DARK_BLUE' | 'DARK_GREEN' | 'DARK_AQUA' | 
	'DARK_RED' | 'DARK_PURPLE' | 'GOLD' | 'GRAY' | 'DARK_GRAY' | 'BLUE' | 'GREEN' | 
	'AQUA' | 'RED' | 'LIGHT_PURPLE' | 'YELLOW' | 'WHITE';

// Doesn't include 'NONE'
export type RankName = 'OWNER' | 'ADMIN' | 'GAME_MASTER' | 'YOUTUBER' | 
	'SUPERSTAR' | 'MVP_PLUS' | 'MVP' | 'VIP_PLUS' | 'VIP' | 'MAYOR' | 'MINISTER' | 'PIG+++';