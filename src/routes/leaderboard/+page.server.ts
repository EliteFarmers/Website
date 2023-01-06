import { LEADERBOARDS } from '$db/leaderboards';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ setHeaders }) => {
	const leaderboards = LEADERBOARDS;

	const categories = Object.entries(leaderboards).map(([title, category]) => {
		if (!category) return undefined;
		const pages = Object.keys(category.pages).map((page) => {
			return {
				name: page,
				title: category.pages[page].name,
			};
		});
		return {
			name: title,
			title: category.name,
			pages,
		};
	});

	setHeaders({
		'Cache-Control': 'max-age=600',
	});

	return {
		categories,
	};
};
