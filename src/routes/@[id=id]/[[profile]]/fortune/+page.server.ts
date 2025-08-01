import { SetUserFortuneSettings } from '$lib/api/elite';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	save: async ({ request, locals }) => {
		const { access_token: token, session } = locals;
		if (!token || !session?.flags?.support) {
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

		const shards = {} as Record<string, number>;
		const exported = {} as Record<string, boolean>;

		for (const [key, value] of data.entries()) {
			if (key.startsWith('SHARD_')) {
				shards[key] = +(value as string);
			}
			if (key.startsWith('exported.')) {
				const cropKey = key.split('.')[1];
				exported[cropKey] = value === 'true';
			}
		}

		const { error: e } = await SetUserFortuneSettings(token, playerUuid, profile, {
			strength: strength,
			communityCenter: communityCenter,
			attributes: shards,
			exported: exported,
		});

		if (e) {
			return fail(500, { error: e });
		}

		return { success: true };
	},
};
