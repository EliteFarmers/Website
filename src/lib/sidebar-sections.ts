import type { Crumb, SidebarSection, SidebarSectionGroup } from '$lib/hooks/page.svelte';

const SIDEBAR_SECTION_META = {
	account: {
		title: 'Account',
		backLabel: 'Back to main',
	},
	admin: {
		title: 'Admin',
		backLabel: 'Back to main',
	},
	browse: {
		title: 'Browse',
		backLabel: 'Back to main',
	},
	guilds: {
		title: 'Guilds',
		backLabel: 'Back to main',
	},
	stats: {
		title: 'Stats',
		backLabel: 'Back to main',
	},
} as const;

export type SidebarSectionId = keyof typeof SIDEBAR_SECTION_META;

export function createSidebarSection(id: SidebarSectionId, items: Crumb[] | SidebarSectionGroup[]): SidebarSection {
	const meta = SIDEBAR_SECTION_META[id];

	return {
		id,
		title: meta.title,
		items,
		backLabel: meta.backLabel,
	};
}
