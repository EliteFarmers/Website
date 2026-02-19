<script lang="ts">
	import FloatingVideo from '$comp/ads/floating-video.svelte';
	import FooterAd from '$comp/ads/footer-ad.svelte';
	import Footer from '$comp/footer/footer.svelte';
	import Announcements from '$comp/header/announcements.svelte';
	import Header from '$comp/header/header.svelte';
	import AppSidebar from '$comp/sidebar/app-sidebar.svelte';
	import FavoritedLinks from '$comp/sidebar/favorited-links.svelte';
	import UpcomingEvents from '$comp/sidebar/upcoming-events.svelte';
	import FooterItems from '$comp/siderail/footer-items.svelte';
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

	<div class="m-0 flex-1 p-0">
		<Sidebar.Inset>
			<Header />
			<Announcements />

			<Content>
				{@render children?.()}
				<FooterAd />
				<FooterItems />
				{#snippet sidebar()}
					<Siderail />
				{/snippet}
			</Content>
			<Footer />
		</Sidebar.Inset>
	</div>
	<FloatingVideo />
</Sidebar.Provider>
