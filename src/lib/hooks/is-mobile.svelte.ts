import { untrack } from 'svelte';

const MOBILE_BREAKPOINT = 768;
const MEDIUM_BREAKPOINT = 1024;
const LARGE_BREAKPOINT = 1280;

export class IsMobile {
	#current = $state<boolean>(false);
	#medium = $state<boolean>(false);
	#large = $state<boolean>(false);
	#max = $state<boolean>(false);

	constructor() {
		$effect(() => {
			return untrack(() => {
				const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
				const medium = window.matchMedia(`(max-width: ${MEDIUM_BREAKPOINT - 1}px)`);
				const large = window.matchMedia(`(max-width: ${LARGE_BREAKPOINT - 1}px)`);
				const onChange = () => {
					this.#current = window.innerWidth < MOBILE_BREAKPOINT;
					this.#medium = window.innerWidth < MEDIUM_BREAKPOINT && !this.#current;
					this.#large = window.innerWidth < LARGE_BREAKPOINT && !this.#medium;
					this.#max = !this.#large && !this.#medium && !this.#current;
				};
				mql.addEventListener('change', onChange);
				medium.addEventListener('change', onChange);
				large.addEventListener('change', onChange);
				onChange();
				return () => {
					mql.removeEventListener('change', onChange);
					medium.removeEventListener('change', onChange);
					large.removeEventListener('change', onChange);
				};
			});
		});
	}

	get current() {
		return this.#current;
	}

	get mobile() {
		return this.#current;
	}

	get medium() {
		return this.#medium;
	}

	get large() {
		return this.#large;
	}

	get max() {
		return this.#max;
	}
}
