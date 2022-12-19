import type { PageLoad } from './$types';

export const load: PageLoad = ({ setHeaders }) => {

	setHeaders({
		// Max age of 5 minutes
		'Cache-Control': 'max-age=300',
	});

	return {

	};
};
