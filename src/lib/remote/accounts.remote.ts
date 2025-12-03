import { command, query } from '$app/server';
import { getAccount, linkOwnAccount, searchAccountsWithDiscord, zodGetAccountParams } from '$lib/api';
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
