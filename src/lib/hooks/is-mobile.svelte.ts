import { MediaQuery } from 'svelte/reactivity';

export const TINY_BREAKPOINT = 400;
export const MOBILE_BREAKPOINT = 1024;
export const MEDIUM_BREAKPOINT = 1148;
export const LARGE_BREAKPOINT = 1280;

export class IsMobile extends MediaQuery {
	#tiny: MediaQuery;
	#medium: MediaQuery;
	#large: MediaQuery;

	constructor() {
		super(`max-width: ${MOBILE_BREAKPOINT - 1}px`);

		this.#tiny = new MediaQuery(`max-width: ${TINY_BREAKPOINT - 1}px`);
		this.#medium = new MediaQuery(`max-width: ${MEDIUM_BREAKPOINT - 1}px`);
		this.#large = new MediaQuery(`max-width: ${LARGE_BREAKPOINT - 1}px`);
	}

	get tiny() {
		return this.#tiny.current;
	}

	get mobile() {
		return this.current;
	}

	get medium() {
		return this.#medium;
	}

	get large() {
		return this.#large;
	}

	get max() {
		return !this.current && !this.#tiny.current && !this.#medium.current && !this.#large.current;
	}
}
