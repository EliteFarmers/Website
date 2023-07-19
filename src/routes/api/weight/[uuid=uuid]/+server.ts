import { GetProfilesWeights } from '$lib/api/elite';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

//! Temporary route for SkyHanni users until most have updated to the new route
export const GET = (async ({ params }) => {
    const { uuid } = params;

    try {
        const { data } = await GetProfilesWeights(uuid);

        if (!data) {
            return json({
                error: 'Account not found',
            });
        }

        const transformed = {
            id: '',
            linked: false,
            profiles: {} as Record<string, {
                farming: {
                    total: number,
                },
                cute_name: string,
            }>
        }

        for (const profile of data.profiles ?? []) {
            transformed.profiles[profile.profileId ?? ''] = {
                cute_name: profile.profileName ?? '',
                farming: {
                    total: profile.totalWeight ?? 0,
                }
            }
        }

        return json(transformed);
    } catch (error) {
        return json({
            success: false,
            error: error,
        });
    }
}) as RequestHandler;