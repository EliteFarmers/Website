import { ElementRect } from 'runed';
import { getContext, setContext } from 'svelte';

export class AdsContext {
	#bottomAnchor = $state<HTMLElement | null>(null);
	#bottomAnchorSize = new ElementRect(() => this.#bottomAnchor);

	get bottomAnchor() {
		return this.#bottomAnchor;
	}

	get bottomAnchorSize() {
		return this.#bottomAnchorSize;
	}

	set bottomAnchor(el: HTMLElement | null) {
		this.#bottomAnchor = el;
	}

	constructor() {
		$effect.pre(() => {
			console.debug('AdsContext bottomAnchorSize updated:', this.#bottomAnchorSize.height);
		});
	}
}

export function initAdContext() {
	const ads = new AdsContext();
	setContext('AdsContext', ads);
	return ads;
}

export function getAdCtx() {
	const ads = getContext<AdsContext>('AdsContext');
	if (!ads) {
		try {
			return initAdContext();
		} catch {
			throw new Error('AdsContext context not found');
		}
	}
	return ads;
}
