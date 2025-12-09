import { command, query } from '$app/server';
import {
	getAccount,
	getPlayerRecap,
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

export const getRecap = query(
	z.object({
		year: z.number().int().min(2025),
		playerUuid: z.string().length(32),
		profileUuid: z.string().length(32),
	}),
	async ({ year, playerUuid, profileUuid }) => {
		const { data: recapDto, error: e, response } = await getPlayerRecap(year, playerUuid, profileUuid);

		if (response.status === 401 || !recapDto || e) {
			return {
				authed: false,
			};
		}

		return {
			recap: recapDto,
			authed: true,
		};
	}
);

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
