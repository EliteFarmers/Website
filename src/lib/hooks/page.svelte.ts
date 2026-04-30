import { browser } from '$app/environment';
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

export interface SidebarSectionGroup {
	label?: string;
	items: Crumb[];
}

export interface SidebarSection {
	id: string;
	title: string;
	items: Crumb[] | SidebarSectionGroup[];
	backLabel?: string;
}

export function isSidebarSectionGroup(item: Crumb | SidebarSectionGroup): item is SidebarSectionGroup {
	return Array.isArray((item as SidebarSectionGroup).items);
}

const home = {
	icon: Home as unknown as Component,
	href: '/',
};

export class Breadcrumb {
	#breadcrumbs = $state<Crumb[]>([]);
	#sidebarSection = $state<SidebarSection | null>(null);
	#sidebarView = $state<'main' | 'section'>('main');
	#path = $derived<string>(page.url.pathname);
	#overridePath = $state<string | null>(null);
	#breadcrumbsOverride = $state<Crumb[] | null>(null);
	#title = $state<string>('');

	constructor() {
		$effect.pre(() => {
			if (this.#overridePath === this.#path) return;

			this.#breadcrumbsOverride = null;
			this.#overridePath = null;
			this.#sidebarSection = null;
			this.#sidebarView = 'main';

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

	get title() {
		if (browser) {
			return this.#title || document.title || 'Untitled';
		}
		return this.#title;
	}

	set title(title: string) {
		this.#title = title;
	}

	setBreadcrumbs(crumbs: Crumb[], useHome = true) {
		this.#breadcrumbsOverride = useHome ? [home, ...crumbs] : crumbs;
		this.#overridePath = page.url.pathname;
	}

	setSidebarSection(section: SidebarSection | null) {
		this.#sidebarSection = section;
		this.#overridePath = page.url.pathname;
		this.#sidebarView = section ? 'section' : 'main';
	}

	showMainSidebar() {
		this.#sidebarView = 'main';
	}

	showSectionSidebar() {
		if (this.#sidebarSection) {
			this.#sidebarView = 'section';
		}
	}

	get sidebarSection() {
		return this.#sidebarSection;
	}

	get sidebarView() {
		return this.#sidebarView;
	}

	get showingSectionSidebar() {
		return this.#sidebarView === 'section' && !!this.#sidebarSection;
	}

	get name() {
		return this.#sidebarSection?.title ?? '';
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
