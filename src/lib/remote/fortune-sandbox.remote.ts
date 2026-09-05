import { command, query } from '$app/server';
import {
	zodFortuneSandboxShareSaveInput,
	type FortuneSandboxAnyToolSettingData,
} from '$lib/schemas/tool-settings/fortune-sandbox';
import * as zod from 'zod';

const sharingUnavailable = 'Fortune Sandbox sharing is temporarily unavailable while the tool is being updated.';

interface FortuneSandboxShareResult {
	error: string | null;
	setting: FortuneSandboxAnyToolSettingData | null;
	settingId: string | null;
	name: string | null;
	description: string | null;
}

export const getFortuneSandboxShare = query(
	zod.object({ settingId: zod.string().min(1) }),
	async (): Promise<FortuneSandboxShareResult> => ({
		error: sharingUnavailable,
		setting: null,
		settingId: null,
		name: null,
		description: null,
	})
);

export const saveFortuneSandboxShareCommand = command(zodFortuneSandboxShareSaveInput, async () => ({
	error: sharingUnavailable,
	settingId: null,
}));
