import { getAccount, getPlayerParticipations } from '$lib/api';
import { error } from '@sveltejs/kit';
import { SkyBlockTime } from 'farming-weight';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals, params }) => {
	const { access_token: token, session } = locals;

	if (!token || !session?.perms?.support) {
		throw error(404, 'Not Found');
	}

	const { id } = params;

	const { data: account } = await getAccount(id).catch(() => ({ data: undefined }));

	if (!account?.id) {
		throw error(404, 'Account not found');
	}

	if (!session?.perms?.moderator) {
		return {
			account,
		};
	}

	const { data: rawContests } = await getPlayerParticipations(account.id).catch(() => ({ data: undefined }));

	const contests = rawContests
		?.filter((c) => c.timestamp && c.timestamp > SkyBlockTime.SkyBlockEpochSeconds)
		.map((c) => ({
			...c,
			hour: new Date(Number(c.timestamp ?? 0) * 1000).getUTCHours(),
		}))
		.sort((a, b) => Number(a.timestamp ?? 0) - Number(b.timestamp ?? 0));

	return {
		contests: contests ?? [],
		account,
		moderator: session?.perms?.moderator ?? false,
	};
}) satisfies LayoutServerLoad;
