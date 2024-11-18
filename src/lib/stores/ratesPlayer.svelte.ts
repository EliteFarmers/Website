import { createFarmingPlayer, type FarmingPlayer, type PlayerOptions } from 'farming-weight';
import { writable } from 'svelte/store';

export function getRatesPlayer(options: PlayerOptions) {
	const store = writable<FarmingPlayer>(createFarmingPlayer(options));

	return {
		subscribe: store.subscribe,
		set: store.set,
		update: store.update,
		refresh: () => store.update((player) => player),
	};
}

export type RatesPlayerStore = ReturnType<typeof getRatesPlayer>;
