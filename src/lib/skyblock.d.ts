export type UUID = string;
export type TimestampMills = number;

export type Skill = 'farming' | 'mining' | 'combat' | 'foraging' | 'fishing' | 'enchanting' | 'alchemy' | 'taming' | 'carpentry' | 'runecrafting' | 'social'; 

export type ProfileResponse = {
	success: boolean;
	profiles: ProfileData[];
}

export type ProfileData = {
	profile_id: UUID;
	members: ProfileMembers;
	cute_name: string;
	community_upgrades?: CommunityUpgrades;
	game_mode?: string; 
	banking?: BankingData;
	last_save?: TimestampMills;
}

export type ProfileMembers = { 
	[uuid: UUID]: ProfileMember
}

export type ProfileMember = {
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
	crafted_generators: string[],
	jacob: StrippedContestData,
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

export type CommunityUpgrades = {
	upgrade_states: CommunityUpgradeState[]
}

export type CommunityUpgradeState = {
	upgrade: string;
	tier: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
	started_ms: TimestampMills;
	started_by: UUID;
	claimed_ms: TimestampMills;
	claimed_by: UUID;
	fasttracked: boolean;
}

export type BankingData = {
	balance: number,
	transactions: BankingTransaction[]
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