import { PersistedState } from 'runed';
import { getContext, setContext } from 'svelte';

export function initShowLeaderboardName() {
	setContext('showleaderboardname', new PersistedState('showleaderboardname', false));
}

export function getShowLeaderboardName() {
	return getContext<PersistedState<boolean>>('showleaderboardname');
}
