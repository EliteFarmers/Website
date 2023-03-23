import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
	//* Snowflakes only contain numbers
	return param.length >= 18 && /^[0-9]+$/.test(param);
}) satisfies ParamMatcher;

export const IsSnowflake = match;
