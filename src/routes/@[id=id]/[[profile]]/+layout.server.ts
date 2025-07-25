import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { PROFILE_UPDATE_INTERVAL } from '$lib/constants/data';

export const load = (async ({ parent, setHeaders, locals }) => {
	const { account, profile, session } = await parent();
	const authorized = session?.flags?.support;

	if (!account.id || !account.name || !profile.profileId) {
		throw error(404, 'Player not found');
	}

	if (!authorized) {
		setHeaders({
			'Cache-Control': `public, max-age=${PROFILE_UPDATE_INTERVAL / 1000}`,
		});
	} else {
		setHeaders({
			'Cache-Control': 'no-store',
		});
	}

	if (account.settings?.nameStyle?.id) {
		console.log('Using name style', account.settings.nameStyle.id);
		const style = locals.cache?.styles?.find((s) => s.id === account.settings.nameStyle?.id);
		return {
			authorized,
			style: style ?? undefined,
		};
	}

	return {
		authorized,
	};
}) satisfies LayoutServerLoad;
