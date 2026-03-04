import { getRecap } from '$lib/remote';
import { getContext, setContext } from 'svelte';

interface RecapProps {
	playerUuid: string;
	profileUuid: string;
	profileName: string;
	year: number;
}

export class RecapContext {
	#recap = $state<ReturnType<typeof getRecap>>(null!);
	#playerUuid = $state<string>();
	#profileUuid = $state<string>();
	#profileName = $state<string>();
	#year = $state<number>();
	#data = $derived(this.#recap.current?.recap?.data);
	#current = $derived(this.#recap.current);

	constructor(data: RecapProps) {
		this.setPlayerProfile(data);
	}

	setPlayerProfile(data: RecapProps) {
		this.#recap = getRecap(data);
		this.#playerUuid = data.playerUuid;
		this.#profileUuid = data.profileUuid;
		this.#profileName = data.profileName;
		this.#year = data.year;
	}

	get loading() {
		return this.#recap.loading;
	}

	get data() {
		return this.#data!;
	}

	get authed() {
		return this.#current?.authed === true;
	}

	get current() {
		return this.#current?.recap;
	}

	get recap() {
		return this.#recap;
	}

	get playerUuid() {
		return this.#playerUuid;
	}

	get profileUuid() {
		return this.#profileUuid;
	}

	get profileName() {
		return this.#profileName;
	}

	get year() {
		return this.#year;
	}
}

export function initRecapContext(data: RecapProps) {
	const existing = getContext<RecapContext>('elite-RecapContext');
	if (existing) {
		return existing;
	}

	const ctx = new RecapContext(data);
	setContext('elite-RecapContext', ctx);
	return ctx;
}

export function getRecapContext() {
	const RecapContext = getContext<RecapContext>('elite-RecapContext');
	if (!RecapContext) {
		throw new Error('RecapContext context not found');
	}
	return RecapContext;
}
