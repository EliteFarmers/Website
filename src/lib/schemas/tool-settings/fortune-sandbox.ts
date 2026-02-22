import * as z from 'zod';

export const FORTUNE_SANDBOX_TOOL_SETTING_TARGET_ID = 'tools:fortune-sandbox';
export const FORTUNE_SANDBOX_TOOL_SETTING_VERSION = 2;
export const FORTUNE_SANDBOX_TOOL_SETTING_LEGACY_VERSION = 1;

const zodFiniteNumber = z.number().finite();
const zodNonNegativeNumber = zodFiniteNumber.nonnegative();
const zodNumericRecord = z.record(z.string(), zodFiniteNumber.nullable());
const zodItemAttributes = z.record(z.string(), z.union([z.string(), zodFiniteNumber, z.boolean(), z.null()]));
const zodItemEnchantments = z.record(z.string(), z.union([zodFiniteNumber, z.string(), z.null()]));

export const zodFortuneSandboxItem = z
	.object({
		name: z.string().nullish(),
		skyblockId: z.string().nullish(),
		uuid: z.string().nullish(),
		lore: z.array(z.string()).nullish(),
		attributes: zodItemAttributes.nullish(),
		enchantments: zodItemEnchantments.nullish(),
	});

export const zodFortuneSandboxPet = z
	.object({
		type: z.string().nullish(),
		uuid: z.string().nullish(),
		tier: z.string().nullish(),
		exp: z.number().nullish(),
		heldItem: z.string().nullish(),
	});

export const zodFortuneSandboxOptions = z
	.object({
		gardenLevel: zodNonNegativeNumber.optional(),
		farmingLevel: zodNonNegativeNumber.optional(),
		strength: zodNonNegativeNumber.optional(),
		communityCenter: zodNonNegativeNumber.optional(),
		filledRosewaterFlask: zodNonNegativeNumber.optional(),
		anitaBonus: zodNonNegativeNumber.optional(),
		plotsUnlocked: zodNonNegativeNumber.optional(),
		uniqueVisitors: zodNonNegativeNumber.optional(),
		refinedTruffles: zodNonNegativeNumber.optional(),
		cocoaFortuneUpgrade: zodNonNegativeNumber.optional(),
		dnaMilestone: zodNonNegativeNumber.optional(),
		chips: zodNumericRecord.optional(),
		attributes: zodNumericRecord.optional(),
		milestones: zodNumericRecord.optional(),
		cropUpgrades: zodNumericRecord.optional(),
		personalBestsUnlocked: z.boolean().optional(),
		personalBests: zodNumericRecord.optional(),
		bestiaryKills: zodNumericRecord.optional(),
		sprayedPlot: z.boolean().optional(),
		infestedPlotProbability: z.number().min(0).max(1).optional(),
		zorro: z
			.object({
				enabled: z.boolean(),
				mode: z.union([z.string(), z.number()]),
			})
			.nullish(),
	});

export const zodFortuneSandboxPlayerGearSource = z
	.object({
		playerName: z.string().trim().min(1).max(64),
		playerUuid: z.string().trim().nullish(),
		profileId: z.string().trim().nullish(),
		profileName: z.string().trim().nullish(),
	});

export const zodFortuneSandboxSource = z
	.object({
		playerGear: zodFortuneSandboxPlayerGearSource.optional(),
	});

export const zodFortuneSandboxSideData = z.object({
	options: zodFortuneSandboxOptions,
	pet: zodFortuneSandboxPet.optional(),
	tool: zodFortuneSandboxItem.optional(),
	toolsByCrop: z.record(z.string(), zodFortuneSandboxItem).optional(),
	armor: z.array(zodFortuneSandboxItem).optional(),
	equipment: z.array(zodFortuneSandboxItem).optional(),
	source: zodFortuneSandboxSource.optional(),
});

export const zodFortuneSandboxCompareState = z
	.object({
		enabled: z.boolean().optional(),
		activeSide: z.enum(['A', 'B']).optional(),
		linkedSections: z
			.object({
				pet: z.boolean().optional(),
				tool: z.boolean().optional(),
				armorEquipment: z.boolean().optional(),
				stats: z.boolean().optional(),
			})
			.optional(),
		diff: z
			.object({
				mode: z.enum(['summary', 'sources', 'break-even']).optional(),
				metric: z.enum(['bazaarProfit', 'npcProfit']).optional(),
				fieldId: z.string().trim().max(256).optional(),
				range: z
					.object({
						start: zodFiniteNumber,
						end: zodFiniteNumber,
						step: zodFiniteNumber,
					})
					.optional(),
				scanSide: z.enum(['A', 'B']).optional(),
			})
			.optional(),
	})
	.optional();

export const zodFortuneSandboxToolSettingDataV1 = z.object({
	schemaVersion: z.literal(FORTUNE_SANDBOX_TOOL_SETTING_LEGACY_VERSION),
	options: zodFortuneSandboxOptions,
	pet: zodFortuneSandboxPet.optional(),
	tool: zodFortuneSandboxItem.optional(),
	toolsByCrop: z.record(z.string(), zodFortuneSandboxItem).optional(),
	armor: z.array(zodFortuneSandboxItem).optional(),
	equipment: z.array(zodFortuneSandboxItem).optional(),
	source: zodFortuneSandboxSource.optional(),
});

export const zodFortuneSandboxToolSettingDataV2 = z.object({
	schemaVersion: z.literal(FORTUNE_SANDBOX_TOOL_SETTING_VERSION),
	sides: z.object({
		A: zodFortuneSandboxSideData,
		B: zodFortuneSandboxSideData.optional(),
	}),
	compare: zodFortuneSandboxCompareState,
});

export const zodFortuneSandboxToolSettingData = z.union([
	zodFortuneSandboxToolSettingDataV1,
	zodFortuneSandboxToolSettingDataV2,
]);

export const zodFortuneSandboxShareSaveInput = z.object({
	name: z.string().trim().max(128).nullish(),
	description: z.string().trim().max(512).nullish(),
	data: zodFortuneSandboxToolSettingDataV2,
});

export const zodFortuneSandboxApiToolSetting = z.object({
	id: z.string(),
	ownerId: z.string(),
	targetId: z.literal(FORTUNE_SANDBOX_TOOL_SETTING_TARGET_ID),
	version: z.union([
		z.literal(FORTUNE_SANDBOX_TOOL_SETTING_LEGACY_VERSION),
		z.literal(FORTUNE_SANDBOX_TOOL_SETTING_VERSION),
	]),
	name: z.string().nullish(),
	description: z.string().nullish(),
	isPublic: z.boolean(),
	data: zodFortuneSandboxToolSettingData,
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type FortuneSandboxToolSettingDataV1 = z.infer<typeof zodFortuneSandboxToolSettingDataV1>;
export type FortuneSandboxToolSettingData = z.infer<typeof zodFortuneSandboxToolSettingDataV2>;
export type FortuneSandboxAnyToolSettingData = z.infer<typeof zodFortuneSandboxToolSettingData>;
export type FortuneSandboxSideData = z.infer<typeof zodFortuneSandboxSideData>;
export type FortuneSandboxCompareState = z.infer<typeof zodFortuneSandboxCompareState>;
export type FortuneSandboxShareSaveInput = z.infer<typeof zodFortuneSandboxShareSaveInput>;
export type FortuneSandboxPlayerGearSource = z.infer<typeof zodFortuneSandboxPlayerGearSource>;
