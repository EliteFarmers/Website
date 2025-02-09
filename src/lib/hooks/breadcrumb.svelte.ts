import { page } from '$app/state';
import { getContext, setContext, untrack, type Component, type Snippet } from 'svelte';
import Home from 'lucide-svelte/icons/home';

interface CrumbBase {
	name: string;
	capitalize?: boolean;
	href?: string;
	icon?: Component | unknown;
	snippet?: Snippet;
	tooltip?: string;
	dropdown?: Omit<CrumbBase, 'dropdown'>[];
	data?: Record<string, string | undefined | boolean | number>;
}

export type Crumb =
	| (CrumbBase & { name: string })
	| (CrumbBase & { icon: Component | unknown })
	| (CrumbBase & { snippet: Snippet<[Crumb | Omit<CrumbBase, 'dropdown'>]> });

const home = {
	icon: Home as unknown as Component,
	href: '/',
};

export class Breadcrumb {
	#current = $state<Crumb[]>([]);
	#path = $state<string>('');
	#overridePath = $state<string | null>(null);
	#override = $state<Crumb[] | null>(null);

	constructor() {
		$effect(() => {
			const path = page.url.pathname;
			this.#path = path;

			if (this.#overridePath === path) return;
			this.#override = null;
			this.#overridePath = null;

			untrack(() => {
				const segments = path.split('/').filter((segment) => segment !== '');

				this.#current = [
					home,
					...segments.map((segment, index) => {
						const href = `/${segments.slice(0, index + 1).join('/')}`;
						return {
							name: segment,
							href: index === segments.length - 1 ? undefined : href,
						};
					}),
				];
			});
		});
	}

	get current() {
		return this.#current;
	}

	get path() {
		return this.#path;
	}

	get override() {
		return this.#override;
	}

	setOverride(crumbs: Crumb[], useHome = true) {
		this.#override = useHome ? [home, ...crumbs] : crumbs;
		this.#overridePath = page.url.pathname;
	}
}

export function initBreadcrumb() {
	const bread = new Breadcrumb();
	setContext('breadcrumb', bread);
	return bread;
}
export function getBreadcrumb() {
	const bread = getContext<Breadcrumb>('breadcrumb');
	if (!bread) {
		try {
			return initBreadcrumb();
		} catch {
			throw new Error('Breadcrumb context not found');
		}
	}
	return bread;
}
