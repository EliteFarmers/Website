import { REDIRECT_ROUTES } from '$lib/constants/leaderboards';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (({ params }) => {
    const { category, oldpage, start } = params;

    const key = `/${category}/${oldpage}`;
    const page = REDIRECT_ROUTES[key] as string | undefined;
    
    const newUrl = (page ? `/leaderboard${page}` : `/leaderboard/${category}`) 
        + (start ? '/' + start.replace('+', '') : '');

    throw redirect(308, newUrl);
}) satisfies PageServerLoad;