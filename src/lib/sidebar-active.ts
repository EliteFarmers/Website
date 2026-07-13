type SidebarMatchableItem = {
	href?: string;
	items?: SidebarMatchableItem[];
	dropdown?: SidebarMatchableItem[];
};

export function isSidebarHrefActive(href: string | undefined, pathname: string): boolean {
	if (!href) return false;
	if (href === '/') return pathname === '/';
	return pathname === href || pathname.startsWith(`${href}/`);
}

export function findActiveSidebarHref(items: SidebarMatchableItem[], pathname: string): string | null {
	let activeHref: string | null = null;

	function visit(entries: SidebarMatchableItem[]) {
		for (const entry of entries) {
			if (entry.href && isSidebarHrefActive(entry.href, pathname)) {
				if (!activeHref || entry.href.length > activeHref.length) {
					activeHref = entry.href;
				}
			}

			if (entry.items?.length) {
				visit(entry.items);
			}

			if (entry.dropdown?.length) {
				visit(entry.dropdown);
			}
		}
	}

	visit(items);
	return activeHref;
}
