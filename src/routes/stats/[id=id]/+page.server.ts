import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
    const { profiles } = await parent();

    const selectedProfile = profiles.find((p) => p.selected) ?? profiles[0];

    if (!selectedProfile.profileId) {
        throw redirect(303, '/');
    }

    throw redirect(302, `/stats/${params.id}/${selectedProfile.profileId}`);
};