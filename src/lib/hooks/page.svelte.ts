import { page } from '$app/state';
import Home from '@lucide/svelte/icons/home';
import { getContext, setContext, untrack, type Component, type Snippet } from 'svelte';

interface CrumbBase {
	name?: string;
	capitalize?: boolean;
	href?: string;
	icon?: Component | unknown;
	snippet?: Snippet<[Crumb | Omit<CrumbBase, 'dropdown'>]>;
	tooltip?: string;
	dropdown?: Omit<CrumbBase, 'dropdown'>[];
	data?: Record<string, string | undefined | boolean | number>;
}

export type Crumb =
	| (CrumbBase & { name: string })
	| (CrumbBase & { icon: Component | unknown })
	| (CrumbBase & { snippet?: Snippet<[Crumb | Omit<CrumbBase, 'dropdown'>]> });

const home = {
	icon: Home as unknown as Component,
	href: '/',
};

export class Breadcrumb {
	#breadcrumbs = $state<Crumb[]>([]);
	#sidebar = $state<Crumb[]>([]);
	#sidebarName = $state<string>('');
	#path = $derived<string>(page.url.pathname);
	#overridePath = $state<string | null>(null);
	#breadcrumbsOverride = $state<Crumb[] | null>(null);
	#above = $state<boolean>(true);

	constructor() {
		$effect.pre(() => {
			if (this.#overridePath === this.#path) return;

			this.#breadcrumbsOverride = null;
			this.#overridePath = null;
			this.#sidebar = [];
			this.#sidebarName = '';

			untrack(() => {
				const segments = this.#path.split('/').filter((segment) => segment !== '');

				this.#breadcrumbs = [
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

	get breadcrumbs() {
		return this.#breadcrumbs;
	}

	get path() {
		return this.#path;
	}

	get breadcrumbsOverride() {
		return this.#breadcrumbsOverride;
	}

	setBreadcrumbs(crumbs: Crumb[], useHome = true) {
		this.#breadcrumbsOverride = useHome ? [home, ...crumbs] : crumbs;
		this.#overridePath = page.url.pathname;
	}

	get name() {
		return this.#sidebarName;
	}

	setSidebar(name: string, crumbs: Crumb[], above = true) {
		this.#sidebarName = name;
		this.#sidebar = crumbs;
		this.#overridePath = page.url.pathname;
		this.#above = above;
	}

	get above() {
		return this.#above;
	}

	get sidebar() {
		return this.#sidebar;
	}

	get sidebarName() {
		return this.#sidebarName;
	}
}

export function initPageContext() {
	const bread = new Breadcrumb();
	setContext('breadcrumb', bread);
	return bread;
}

export function getPageCtx() {
	const bread = getContext<Breadcrumb>('breadcrumb');
	if (!bread) {
		try {
			return initPageContext();
		} catch {
			throw new Error('Breadcrumb context not found');
		}
	}
	return bread;
}
