import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
	return param.length >= 18 && (/^.*-[0-9]+$/.test(param) || /^[0-9]+$/.test(param));
}) satisfies ParamMatcher;

export const IsSnowflake = match;
