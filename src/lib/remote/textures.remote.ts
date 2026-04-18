import { command, query } from '$app/server';
import { reloadResourcePacks } from '$lib/api';
import { cache, reloadCachedItems } from '$lib/servercache';

export const getTexturePacks = query(async () => {
	return cache.texturepacks;
});

export const adminReloadTexturePacks = command(async () => {
	const result = await reloadResourcePacks();
	if (!result.ok) {
		return { success: false, message: 'Failed to reload texture packs' };
	}
	await reloadCachedItems();
	return { success: true };
});
