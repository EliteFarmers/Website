import { command, getRequestEvent, query } from '$app/server';
import { createToolSetting, getToolSetting, zodGetToolSettingParams } from '$lib/api';
import {
	FORTUNE_SANDBOX_TOOL_SETTING_TARGET_ID,
	FORTUNE_SANDBOX_TOOL_SETTING_VERSION,
	zodFortuneSandboxApiToolSetting,
	zodFortuneSandboxShareSaveInput,
} from '$lib/schemas/tool-settings/fortune-sandbox';

function getApiErrorMessage(error: unknown, fallback: string) {
	if (!error || typeof error !== 'object') return fallback;
	const message =
		'message' in error && typeof error.message === 'string' && error.message.trim().length > 0
			? error.message.trim()
			: '';
	const statusCode = 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : null;
	const details =
		'errors' in error && error.errors && typeof error.errors === 'object'
			? Object.entries(error.errors as Record<string, unknown>)
					.flatMap(([field, value]) => {
						const messages = Array.isArray(value)
							? value.filter((entry): entry is string => typeof entry === 'string')
							: [];
						return messages.map((entry) => `${field}: ${entry}`);
					})
					.join('; ')
			: '';
	if (message && details) return `${statusCode ? `[${statusCode}] ` : ''}${message} (${details})`;
	if (details) return `${statusCode ? `[${statusCode}] ` : ''}${details}`;
	if (message) return `${statusCode ? `[${statusCode}] ` : ''}${message}`;
	return fallback;
}

export const getFortuneSandboxShare = query(zodGetToolSettingParams, async ({ settingId }) => {
	const event = getRequestEvent();
	if (!event.locals.access_token) {
		return { error: 'Unauthorized', setting: null };
	}

	try {
		const response = await getToolSetting(settingId);
		if (response.response.status === 401) {
			return { error: 'Unauthorized', setting: null };
		}

		if (!response.ok || !response.data) {
			return { error: 'Shared setup not found', setting: null };
		}

		const parsed = zodFortuneSandboxApiToolSetting.safeParse(response.data);
		if (!parsed.success) {
			return { error: 'Shared setup data is invalid', setting: null };
		}

		const setting = parsed.data;
		if (!setting.isPublic && setting.ownerId !== event.locals.session?.id) {
			return { error: 'Shared setup is private', setting: null };
		}

		return {
			error: null,
			settingId: setting.id,
			name: setting.name ?? null,
			description: setting.description ?? null,
			setting: setting.data,
		};
	} catch (error) {
		return { error: getApiErrorMessage(error, 'Failed to load shared setup'), setting: null };
	}
});

export const saveFortuneSandboxShareCommand = command(
	zodFortuneSandboxShareSaveInput,
	async ({ data, name, description }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token) {
			return { error: 'Unauthorized', settingId: null };
		}

		const normalizedName = name?.trim() ? name.trim() : 'Fortune Sandbox Setup';
		const normalizedDescription = description?.trim()
			? description.trim()
			: 'Shareable setup for the Farming Fortune Sandbox tool';

		const payload = {
			targetId: FORTUNE_SANDBOX_TOOL_SETTING_TARGET_ID,
			version: FORTUNE_SANDBOX_TOOL_SETTING_VERSION,
			name: normalizedName,
			description: normalizedDescription,
			isPublic: true,
			data,
		};

		try {
			const created = await createToolSetting(payload);
			if (created.response.status === 401) {
				return { error: 'Unauthorized', settingId: null };
			}

			if (!created.ok || !created.data) {
				return {
					error: getApiErrorMessage(created.error, 'Failed to save shared setup'),
					settingId: null,
				};
			}

			return { error: null, settingId: created.data.id };
		} catch (error) {
			return {
				error: getApiErrorMessage(error, 'Failed to save shared setup'),
				settingId: null,
			};
		}
	}
);
