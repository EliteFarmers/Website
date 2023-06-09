import { match as ign } from './ign';
import { match as uuid } from './uuid';

import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
	return ign(param) || uuid(param);
}) satisfies ParamMatcher;

export const IsIGNOrUUID = match;
