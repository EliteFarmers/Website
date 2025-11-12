<script lang="ts">
	import Footer from '$comp/footer/footer.svelte';
	import Announcements from '$comp/header/announcements.svelte';
	import Header from '$comp/header/header.svelte';
	import AppSidebar from '$comp/sidebar/app-sidebar.svelte';
	import FavoritedLinks from '$comp/sidebar/favorited-links.svelte';
	import UpcomingEvents from '$comp/sidebar/upcoming-events.svelte';
	import Siderail from '$comp/siderail/siderail.svelte';
	import * as Sidebar from '$ui/sidebar';
	import type { LayoutData } from './$types';
	import Content from './content.svelte';

	interface Props {
		children?: import('svelte').Snippet;
		data: LayoutData;
	}

	let { children, data }: Props = $props();
</script>

<Sidebar.Provider open={data.sidebar}>
	<Sidebar.Root collapsible="icon" class="z-50">
		<AppSidebar>
			<FavoritedLinks />
			<UpcomingEvents events={data.cache?.events} />
		</AppSidebar>
	</Sidebar.Root>

	<div class="m-0 min-h-screen flex-1 overflow-y-auto p-0">
		<Sidebar.Inset>
			<Header />
			<Announcements />

			<Content>
				{@render children?.()}
				{#snippet sidebar()}
					<Siderail />
				{/snippet}
			</Content>

			<Footer />
		</Sidebar.Inset>
	</div>
</Sidebar.Provider>
