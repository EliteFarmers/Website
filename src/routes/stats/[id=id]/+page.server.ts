import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, parent }) => {
    const { profiles } = await parent();

    const selectedProfile = profiles.find((p) => p.selected) ?? profiles[0];

    if (!selectedProfile.profileName) {
        throw redirect(303, '/');
    }

    throw redirect(302, `/stats/${params.id}/${selectedProfile.profileName}`);
}) satisfies PageServerLoad;