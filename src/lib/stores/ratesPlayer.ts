import { createFarmingPlayer, type FarmingPlayer, type PlayerOptions } from 'farming-weight';
import { writable } from 'svelte/store';

export function getRatesPlayer(options: PlayerOptions) {
	const { subscribe, update, set } = writable<FarmingPlayer>(createFarmingPlayer(options));

	return {
		subscribe,
		set,
		update,
		refresh: () => update((p) => p),
	};
}

export type RatesPlayerStore = ReturnType<typeof getRatesPlayer>;
