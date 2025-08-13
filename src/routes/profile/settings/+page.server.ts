import {
	getSelectedProfile,
	refreshPurchases,
	updateAccount,
	updateBadges,
	type ConfiguredProductFeaturesDto,
	type EditUserBadgeDto,
	type UpdateUserSettingsDto,
	type WeightStyleWithDataDto,
} from '$lib/api';
import { FetchDiscordUserData } from '$lib/api/auth';
import { IsUUID } from '$params/uuid';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent, url }) => {
	const { session } = await parent();
	const { access_token: token } = locals;

	if (!session || !token) {
		throw redirect(307, '/login?redirect=' + url.pathname);
	}

	const discord = await FetchDiscordUserData();

	if (!discord) {
		throw redirect(307, '/login?redirect=' + url.pathname);
	}

	const account =
		discord.minecraftAccounts?.find((account) => account.primaryAccount) ?? discord.minecraftAccounts?.[0];

	const { data: weight } = account?.id
		? await getSelectedProfile(account?.id).catch(() => ({ data: undefined }))
		: { data: undefined };

	return {
		mcAccount: account ?? null,
		user: discord,
		weight: weight?.farmingWeight ?? null,
		styles: locals.cache?.styleLookup ?? ({} as Record<string, WeightStyleWithDataDto>),
	};
};

export const actions: Actions = {
	updateBadges: async ({ locals, request }) => {
		if (!locals.access_token) {
			console.log('no access token');
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const uuid = data.get('uuid')?.toString();

		if (!uuid || !IsUUID(uuid)) {
			console.log('invalid uuid');
			return fail(400, { error: 'Invalid uuid.' });
		}

		const entries = Array.from(data.entries()).filter(([key]) => key.startsWith('badge.'));
		const badges = {} as Record<string, EditUserBadgeDto>;

		for (const [key, value] of entries) {
			const [, id, setting] = key.split('.');

			const badge = badges[+id] ?? (badges[+id] = { badgeId: +id });

			if (setting === 'visible') {
				badge.visible = value === 'true';
			}

			if (setting === 'order') {
				const num = Number(value);
				if (isNaN(num)) continue;

				badge.order = Math.min(entries.length, Math.max(0, num));
			}
		}

		const body = Object.values(badges);
		const { response, error: e } = await updateBadges(uuid, body);

		if (!response.ok || e) {
			return fail(response.status, {
				error: e || 'Failed to update badges!',
			});
		}

		return { success: true };
	},
	updateSettings: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();

		const body = {
			suffix: data.get('emoji')?.toString() ?? '',
			features: {} as ConfiguredProductFeaturesDto,
			weightStyleId: undefined as number | undefined,
			nameStyleId: undefined as number | undefined,
			leaderboardStyleId: undefined as number | undefined,
		} satisfies UpdateUserSettingsDto;

		const style = data.get('style')?.toString() ?? undefined;
		if (style !== undefined && isFinite(+style)) {
			body.weightStyleId = +style;
		}

		const nameStyle = data.get('nameStyle')?.toString() ?? undefined;
		if (nameStyle !== undefined && isFinite(+nameStyle)) {
			body.nameStyleId = +nameStyle;
		}

		const leaderboardStyle = data.get('lbstyle')?.toString() ?? undefined;
		if (leaderboardStyle !== undefined && isFinite(+leaderboardStyle)) {
			body.leaderboardStyleId = +leaderboardStyle;
		}

		const embed = data.get('embed')?.toString() ?? undefined;
		if (embed !== undefined) {
			body.features.embedColor = embed;
		}

		const promotions = data.get('promotions') ?? undefined;
		if (promotions) {
			body.features.hideShopPromotions = promotions === 'true';
		}

		const override = data.get('override') ?? undefined;
		if (override) {
			body.features.weightStyleOverride = override === 'true';
		}

		const info = data.get('info') ?? undefined;
		if (info) {
			body.features.moreInfoDefault = info === 'true';
		}

		const { response, error: e } = await updateAccount(body);

		if (!response.ok || e) {
			return fail(response.status, { error: e || 'Failed to update settings!' });
		}

		return { success: true };
	},
	refreshPurchases: async ({ locals }) => {
		if (!locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const { response, error: e } = await refreshPurchases();

		if (!response.ok || e) {
			return fail(response.status, { error: e || 'Failed to refresh purchases!' });
		}

		return { success: true };
	},
};
