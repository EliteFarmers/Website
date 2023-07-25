import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { CanManageGuild } from '$lib/utils';

export const load: PageServerLoad = async ({ parent }) => {
	const { userPermissions } = await parent();

	const hasPerms = CanManageGuild(userPermissions);

	if (!hasPerms) {
		throw error(403, 'You do not have permission to edit this guild.');
	}

	return {};
};
