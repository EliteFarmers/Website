export const PROFILE_UPDATE_INTERVAL = 1000 * 60 * 10; // 10 minutes
export const PLAYER_UPDATE_INTERVAL = 1000 * 60 * 60; // 1 hour
export const ACCOUNT_UPDATE_INTERVAL = 1000 * 60 * 60; // 1 hour

export const EXCLUDED_FIELDS = [
	'objectives', 
	'tutorial', 
	'quests', 
	'visited_zones', 
	'visited_modes', 
	'temp_stat_buffs', 
	'disabled_potion_effects', 
	'paused_effects',
	'active_effects', 
	'achievement_spawned_island_types', 
	'autopet', 
	'experimentation',
	'harp_quest',
	'trapper_quest',
	'favorite_arrow',
	'backpack_icons',
	'sacks_counts',
	'fishing_bag',
	'candy_inventory_contents',
	'personal_bank_upgrade',
	'wardrobe_equipped_slot'
];

export const API_CROP_TO_CROP = Object.assign(Object.create(null), {
	'WHEAT': 'wheat',
	'POTATO_ITEM': 'potato',
	'CARROT_ITEM': 'carrot',
	'MELON': 'melon',
	'PUMPKIN': 'pumpkin',
	'CACTUS': 'cactus',
	'SUGAR_CANE': 'sugar_cane',
	'INK_SACK': 'cocoa',
	'INK_SACK:3': 'cocoa',
	'MUSHROOM_COLLECTION': 'mushroom',
	'NETHER_STALK': 'nether_wart'
});

export const INVENTORY_FIELDS_RENAME = Object.assign(Object.create(null), {
	'inv_contents': 'player',
	'inv_armor': 'armor',
	'ender_chest_contents': 'ender_chest',
	'backpack_contents': 'backpacks',
	'talisman_bag': 'talismans',
	'equippment_contents': 'equipment',
	'wardrobe_contents': 'wardrobe',
	'personal_vault_contents': 'vault',
	'potion_bag': 'potions',
	'quiver': 'quiver'
});

export const MOVE_TO_STATS = [ 
	'first_join', 
	'first_join_hub', 
	'last_death', 
	'death_count', 
	'fishing_treasure_caught' 
];

export const KEPT_PLAYER_FIELDS = [
	'firstLogin',
	'lastLogin',
	'socialMedia',
	'karma',
	'rankPlusColor',
	'newPackageRank',
	'userLanguage',
	'skyblock_extra',
	'scorpius_bribe_',
	'claimed_'
]