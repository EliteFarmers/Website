import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';

export function initShowLeaderboardName() {
	setContext('leaderboardName', writable(false));
}

export function getShowLeaderboardName() {
	return getContext<Writable<boolean>>('leaderboardName');
}
