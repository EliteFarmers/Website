import { LEADERBOARDS } from '$db/leaderboards';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {

	const leaderboards = LEADERBOARDS;

	const categories = Object.entries(leaderboards).map(([ title, category ]) => {
		if (!category) return undefined;
		const pages = Object.keys(category.pages).map(page => {
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

	return {
		categories,
	};
};