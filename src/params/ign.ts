import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
	//* Legacy igns could be under 3 characters
	return param.length <= 24 && /^[a-zA-Z0-9_]+$/.test(param);
}) satisfies ParamMatcher;

export const IsIGN = match;
