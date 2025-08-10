import { query } from '$app/server';
import { getAccount, zodGetAccountParams } from '$lib/api';

export const GetAccount = query(zodGetAccountParams, async (params) => {
	return await getAccount(params.player);
});
