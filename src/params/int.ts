import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
	return !isNaN(+param);
}) satisfies ParamMatcher;
