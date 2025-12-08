import { command, query } from '$app/server';
import {
	getAccount,
	linkOwnAccount,
	searchAccountsWithDiscord,
	toggleRecapVisibility,
	zodGetAccountParams,
} from '$lib/api';
import * as z from 'zod';

export const GetAccount = query(zodGetAccountParams, async (params) => {
	return await getAccount(params.player);
});

export const getAccountOptions = query(async () => {
	const { data: accountOptions } = await searchAccountsWithDiscord();
	return accountOptions;
});

export const linkAccountCommand = command(z.string(), async (username: string) => {
	const { error: problem, response } = await linkOwnAccount(username);
	return { problem, response };
});

export const toggleRecapVisibilityCommand = command(
	z.object({
		year: z.number().int().min(2025),
		playerUuid: z.string().length(32),
		profileUuid: z.string().length(32),
		makePublic: z.boolean(),
	}),
	async ({ year, playerUuid, profileUuid, makePublic }) => {
		const { error: problem } = await toggleRecapVisibility(year, playerUuid, profileUuid, {
			public: makePublic,
		});
		return { problem };
	}
);
