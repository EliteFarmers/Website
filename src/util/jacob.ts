export type JacobContestMedal = 'bronze' | 'silver' | 'gold';

export interface RawJacobContest {
	collected: number;
	claimed_rewards?: boolean;
	claimed_position?: number;
	claimed_participants?: number;
	claimed_medal?: JacobContestMedal;
}

export interface JacobContest {
	collected: number;
	position?: number;
	participants?: number;
	medal?: JacobContestMedal;
}

export function FormatJacobContests(contests: RawJacobContest[]): JacobContest[] {
	return contests.map((contest) => {
		return {
			collected: contest.collected,
			position: contest.claimed_position,
			participants: contest.claimed_participants,
			medal: CalculateJacobContestMedal(contest),
		};
	});
}

export function CalculateJacobContestMedal(contest: RawJacobContest): JacobContestMedal | undefined {
	if (contest.claimed_medal) {
		return contest.claimed_medal;
	}

	const { claimed_position: position, claimed_participants: participants } = contest;

	if (position === undefined || participants === undefined) {
		return undefined;
	}

	if (position <= participants * 0.05 + 1) return 'gold';
	if (position <= participants * 0.25 + 1) return 'silver';
	if (position <= participants * 0.6 + 1) return 'bronze';

	return undefined;
}
