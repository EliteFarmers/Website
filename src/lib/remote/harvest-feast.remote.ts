import { query } from '$app/server';
import { cache } from '$lib/servercache';

export const getHarvestFeast = query(async () => {
	return cache.harvestfeast;
});
