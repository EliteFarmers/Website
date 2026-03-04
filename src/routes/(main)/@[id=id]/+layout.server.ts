import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params }) => {
	return {
		paramsId: params.id,
		paramsProfile: params.profile,
	};
};
