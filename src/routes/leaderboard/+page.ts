import type { LeaderboardEntry } from '$db/database';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	let start = url.searchParams.get('start') ?? '1';
	const ign = url.searchParams.get('jump');

	if (ign && ign.length > 0 && ign.length <= 24 && /^[a-zA-Z0-9_]+$/.test(ign)) {
		const uuid = (await fetch(`/api/account/${ign}`).then((r) => r.json())) as
			| { account?: { id: string } }
			| undefined;

		if (uuid?.account?.id) {
			const res = await fetch(`/api/leaderboard/weight/${uuid.account.id}`);
			const data = (await res.json()) as { rank: number; success: boolean };

			if (data.success) {
				start = String(data.rank - (data.rank % 20) + 1);
			}
		}
	}

	const request = await fetch(`/api/leaderboard/weight?start=${start}`);

	const lb = (await request.json()) as LeaderboardEntry[];

	return {
		lb,
		start: Number(start),
		jump: ign ?? null,
	};
};
