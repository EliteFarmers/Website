import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent, locals }) => {
	const { account, profile, session } = await parent();
	const authorized = session?.flags?.support;

	if (!account.id || !account.name || !profile.profileId) {
		throw error(404, 'Player not found');
	}

	if (account.settings?.nameStyle?.id) {
		const style = locals.cache?.styleLookup?.[account.settings.nameStyle?.id];
		return {
			authorized,
			style: style ?? undefined,
		};
	}

	return {
		authorized,
	};
}) satisfies LayoutServerLoad;
