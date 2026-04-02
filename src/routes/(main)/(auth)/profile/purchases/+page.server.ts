import { getUserOrders, refreshPurchases, type UserOrdersResponseDto } from '$lib/api';
import { FetchDiscordUserData } from '$lib/api/auth';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { DEFAULT_PAYMENTS_PAGE_SIZE, parsePaymentsUrlState } from './payments';

export const load: PageServerLoad = async ({ locals, parent, url }) => {
	const { session } = await parent();
	const { access_token: token } = locals;

	if (!session || !token) {
		throw redirect(307, '/login?redirect=' + url.pathname + url.search);
	}

	const state = parsePaymentsUrlState(url.searchParams);
	let initialOrders: UserOrdersResponseDto | null = null;
	let initialError: string | null = null;

	const [result, discord] = await Promise.all([
		getUserOrders({
			includeCheckoutStates: false,
			offset: state.pageIndex * state.pageSize,
			limit: state.pageSize || DEFAULT_PAYMENTS_PAGE_SIZE,
		}),
		FetchDiscordUserData(),
	]);

	if (result.ok) {
		initialOrders = result.data;
	} else {
		initialError = 'Unable to load your purchases right now.';
	}

	return {
		initialOrders,
		initialError,
		initialPageIndex: state.pageIndex,
		initialPageSize: state.pageSize,
		entitlements: discord?.entitlements ?? [],
	};
};

export const actions: Actions = {
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
