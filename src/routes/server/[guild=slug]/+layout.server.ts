import { GetPublicGuild } from '$lib/api/elite';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params }) => {
    const { guild } = params;

    // Remove everything before the last dash
    const guildId = guild.slice(guild.lastIndexOf('-') + 1);

    const { data: guildData } = await GetPublicGuild(guildId).catch(() => ({ data: undefined }));

    if (!guildData) {
        throw error(404, 'Guild not found');
    }

    return {
        guild: guildData,
    };
}) satisfies LayoutServerLoad;