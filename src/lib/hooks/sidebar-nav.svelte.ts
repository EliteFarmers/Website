import { page } from '$app/state';
import { getContext, setContext } from 'svelte';
import type { Crumb } from '$lib/hooks/breadcrumb.svelte';

export class SidebarNav {
	#name = $state<string>('');
	#current = $state<Crumb[]>([]);
	#path = $state<string>('');
	#overridePath = $state<string | null>(null);

	constructor() {
		$effect(() => {
			const path = page.url.pathname;
			this.#path = path;

			if (this.#overridePath !== path) {
				this.#overridePath = null;
				this.#current = [];
			}
		});
	}

	get name() {
		return this.#name;
	}

	get current() {
		return this.#current;
	}

	get path() {
		return this.#path;
	}

	setNav(name: string, crumbs: Crumb[]) {
		this.#name = name;
		this.#current = crumbs;
		this.#overridePath = page.url.pathname;
	}
}

export function initSidebarNav() {
	const bar = new SidebarNav();
	setContext('sidebarnav', bar);
	return bar;
}

export function getSidebarNav() {
	const bar = getContext<SidebarNav>('sidebarnav');
	if (!bar) {
		try {
			return initSidebarNav();
		} catch {
			throw new Error('SidebarNav context not found');
		}
	}
	return bar;
}
