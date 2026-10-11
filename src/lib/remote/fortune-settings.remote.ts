import { command, getRequestEvent } from '$app/server';
import { updateFortuneSettings, zodUpdateFortuneSettingsBody, zodUpdateFortuneSettingsParams } from '$lib/api';

function getErrorMessage(error: unknown, fallback: string): string {
	if (typeof error === 'string') return error;
	const body = error as { message?: string; errors?: Record<string, string[]> } | null;
	return Object.values(body?.errors ?? {}).flat()[0] ?? body?.message ?? fallback;
}

export const saveFortuneSettings = command(
	zodUpdateFortuneSettingsParams.extend({ settings: zodUpdateFortuneSettingsBody }),
	async ({ playerUuid, profileUuid, settings }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token) {
			return { error: 'You need to be logged in to save your settings.' };
		}

		const { error } = await updateFortuneSettings(playerUuid, profileUuid, settings);
		if (error !== undefined && error !== null) {
			return { error: getErrorMessage(error, 'Failed to save your settings.') };
		}

		return { error: null };
	}
);
