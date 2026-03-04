import { updateFortuneSettings } from '$lib/api';
import { MissingRatesDataSchema } from '$lib/stores/ratesData';
import { fail } from '@sveltejs/kit';
import { normalizeChipId } from 'farming-weight';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const data = url.searchParams.get('data');
	if (!data) {
		return {};
	}

	try {
		const string = atob(data ?? '');
		const parsed = JSON.parse(string);
		const result = MissingRatesDataSchema.safeParse(parsed);
		if (!result.success) {
			return { importedSettingsError: 'Failed to import settings!' };
		}
		return { importedSettings: result.data };
	} catch {
		return { importedSettingsError: 'Failed to parse settings!' };
	}
}) satisfies PageServerLoad;

export const actions: Actions = {
	save: async ({ request, locals }) => {
		const { access_token: token, session } = locals;
		if (!token || !session?.perms?.support) {
			return fail(403);
		}

		const data = await request.formData();
		const playerUuid = data.get('player') as string | undefined;
		const profile = data.get('profile') as string | undefined;

		if (!playerUuid || !profile) {
			return fail(400);
		}

		const strength = +(data.get('strength') ?? 0);
		const communityCenter = +(data.get('community') ?? 0);
		const rosewaterFlasks = +(data.get('flasks') ?? 0);

		const shards = {} as Record<string, number>;
		const chips = {} as Record<string, number>;

		for (const [key, value] of data.entries()) {
			if (key.startsWith('SHARD_')) {
				shards[key] = +(value as string);
			}
			if (key.endsWith('_GARDEN_CHIP')) {
				const normalized = normalizeChipId(key);
				if (normalized) {
					chips[normalized] = +(value as string);
				}
			}
		}

		const { error: e } = await updateFortuneSettings(playerUuid, profile, {
			strength: strength,
			communityCenter: communityCenter,
			attributes: shards,
			chips: chips,
			rosewaterFlasks: rosewaterFlasks,
		});

		if (e) {
			return fail(500, { error: e });
		}

		return { success: true };
	},
};
