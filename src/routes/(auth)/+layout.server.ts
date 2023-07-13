import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (({ locals, url }) => {
    if (!locals.user) {
        throw redirect(302, '/login?redirect=' + url.pathname);
    }

    return {
        user: locals.user,
    }
}) satisfies LayoutServerLoad;