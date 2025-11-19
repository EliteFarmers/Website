import { ElementRect } from 'runed';
import { getContext, setContext } from 'svelte';

export class AdsContext {
	#bottomAnchor = $state<HTMLElement | null>(null);
	#bottomAnchorSize = $derived(new ElementRect(() => this.#bottomAnchor));
	#footerBottom = $state<HTMLElement | null>(null);
	#footerBottomSize = $derived(
		new ElementRect(() => (this.#footerBottom?.children[0] as HTMLElement | null) ?? this.#footerBottom)
	);

	constructor() {
		$effect.pre(() => {
			document.addEventListener('nitroAds.rendered', this.handleAdRendered);
		});
	}

	handleAdRendered = (event: Event) => {
		console.error(JSON.stringify(event, undefined, 2));
		// const nitroEvent = event as RenderedEvent;
		// if (nitroEvent.slotId === 'footer-bottom' && this.#footerBottom) {
		//     this.#footerBottomSize.refresh();
		// }
	};

	get footerBottom() {
		return this.#footerBottom;
	}

	set footerBottom(el: HTMLElement | null) {
		this.#footerBottom = el;
	}

	get bottomAnchor() {
		return this.#bottomAnchor;
	}

	get bottomAnchorSize() {
		return this.#bottomAnchorSize;
	}

	get footerBottomSize() {
		return this.#footerBottomSize;
	}

	set bottomAnchor(el: HTMLElement | null) {
		this.#bottomAnchor = el;
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

export interface RenderedEvent {
	adInfo: AdInfo;
	type: string;
}

export interface AdInfo {
	acceptable: boolean;
	adUnitCode: string;
	auf?: string;
	bidder: string;
	c: string;
	cpm: number;
	creativeId: string;
	duration: number;
	f?: string;
	hashedEmail: boolean;
	height: number;
	href: string;
	mediaType?: string;
	meta?: string;
	r: string;
	refresh: boolean;
	requestId: string;
	targeting?: Record<string, unknown | unknown[]>;
	timeToRespond?: number;
	trackerMeta?: Record<string, string>;
	type: unknown;
	v?: string;
	width: number;
}
