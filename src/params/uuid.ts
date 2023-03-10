import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
	//* UUIDs are 32 characters long or 36 with dashes
	return param.length === 32 || (param.length === 36 && /^[a-fA-F0-9-]+$/.test(param));
}) satisfies ParamMatcher;

export const IsUUID = match;