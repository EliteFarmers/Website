import type { FarmingAttributeShard } from './attribute-shard.js';
import {
	CricketShard,
	CropeetleShard,
	DragonflyShard,
	FireflyShard,
	FlyShard,
	GalaxyFishShard,
	InvisibugShard,
	KeeledSlugShard,
	LadybugShard,
	LocustShard,
	LunarMothShard,
	MiteShard,
	MosquitoShard,
	MothShard,
	MudwormShard,
	PestShard,
	PrayingMantisShard,
	RatShard,
	TermiteShard,
	WartyBugShard,
} from './shards/index.js';

function defineAttributeShards<const T extends Record<string, FarmingAttributeShard>>(
	shards: T & {
		[K in keyof T]: FarmingAttributeShard & { readonly attributeId: K };
	}
): T {
	return shards;
}

export const FARMING_ATTRIBUTE_SHARDS = defineAttributeShards({
	fortunate_farmer: new FlyShard(),
	pest_fortune: new CricketShard(),
	crop_speed: new LocustShard(),
	sprayonator_serendipity: new RatShard(),
	enchanted_farmer: new MosquitoShard(),
	filter_upgrade: new MiteShard(),
	pest_cooldown: new MothShard(),
	bonus_pest_chance: new KeeledSlugShard(),
	wart_eater: new WartyBugShard(),
	garden_wisdom: new DragonflyShard(),
	solar_power: new FireflyShard(),
	lunar_power: new LunarMothShard(),
	pretty_clothes: new LadybugShard(),
	crop_bug: new CropeetleShard(),
	fancy_visit: new InvisibugShard(),
	infiltration: new TermiteShard(),
	insect_power: new PrayingMantisShard(),
	pest_luck: new PestShard(),
	visitor_bait: new MudwormShard(),
	ultimate_dna: new GalaxyFishShard(),
});

export type FarmingAttributeShardId = keyof typeof FARMING_ATTRIBUTE_SHARDS;
