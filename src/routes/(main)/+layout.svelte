<script lang="ts">
	import FooterPills from '$comp/footer/footer-pills.svelte';
	import Footer from '$comp/footer/footer.svelte';
	import Announcements from '$comp/header/announcements.svelte';
	import Header from '$comp/header/header.svelte';
	import AppSidebar from '$comp/sidebar/app-sidebar.svelte';
	import FavoritedLinks from '$comp/sidebar/favorited-links.svelte';
	import UpcomingEvents from '$comp/sidebar/upcoming-events.svelte';
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

	<div class="max-h-screen flex-1 overflow-y-auto">
		<Sidebar.Inset>
			<Header />
			<Announcements />

			<Content>
				{@render children?.()}
				<FooterPills />
			</Content>

			<Footer />
		</Sidebar.Inset>
	</div>
</Sidebar.Provider>
