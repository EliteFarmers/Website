import { query } from '$app/server';
import { getAllWeights, getBadges as getBadgeList } from '$lib/api';

export const getWeights = query(async () => {
	const { data } = await getAllWeights();
	return data;
});

export const getBadges = query(async () => {
	const { data } = await getBadgeList();
	return data;
});
