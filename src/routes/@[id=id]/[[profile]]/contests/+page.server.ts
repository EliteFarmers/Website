import type { ContestParticipationDto } from '$lib/api';
import { getSkyblockDate } from '$lib/format';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
	const { member } = await parent();

	const years = {} as Partial<Record<number, ContestParticipationDto[]>>;

	for (const contest of member.jacob?.contests ?? []) {
		const year = getSkyblockDate(contest.timestamp ?? 0).year + 1;
		if (!years[year]) years[year] = [];

		years[year]?.push(contest);
	}

	// Sort each year by timestamp
	for (const year in years) {
		years[year] = years[year]?.sort((a, b) => Number(b.timestamp ?? 0) - Number(a.timestamp ?? 0));
	}

	return {
		years,
		contestsCount: member.jacob?.contests?.length ?? 0,
	};
}) satisfies PageServerLoad;
