export type JacobContestMedal = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface RawJacobContest {
	collected: number;
	claimed_rewards?: boolean;
	claimed_position?: number;
	claimed_participants?: number;
	claimed_medal?: JacobContestMedal | string;
}

export interface JacobContest {
	collected: number;
	position?: number;
	participants?: number;
	medal?: JacobContestMedal;
}

export function formatJacobContests(contests: RawJacobContest[]): JacobContest[] {
	return contests.map((contest) => {
		return {
			collected: contest.collected,
			position: contest.claimed_position,
			participants: contest.claimed_participants,
			medal: calculateJacobContestMedal(contest),
		};
	});
}

export function calculateJacobContestMedal(contest: RawJacobContest): JacobContestMedal | undefined {
	if (contest.claimed_medal) {
		return contest.claimed_medal as JacobContestMedal;
	}

	const { claimed_position: position, claimed_participants: participants } = contest;

	if (position === undefined || participants === undefined) {
		return undefined;
	}

	if (position <= Math.floor(participants * 0.02)) return 'diamond';
	if (position <= Math.floor(participants * 0.05)) return 'platinum';
	if (position <= Math.floor(participants * 0.1)) return 'gold';
	if (position <= Math.floor(participants * 0.3)) return 'silver';
	if (position <= Math.floor(participants * 0.6)) return 'bronze';

	return undefined;
}
