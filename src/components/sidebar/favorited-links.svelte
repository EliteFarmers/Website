<script lang="ts">
	import * as Collapsible from '$comp/ui/collapsible/index.js';
	import * as Sidebar from '$comp/ui/sidebar/index.js';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import SidebarLink from './sidebar-link.svelte';

	const sidebar = Sidebar.useSidebar();
	const favorites = getFavoritesContext();
</script>

{#if favorites.current?.length}
	<Sidebar.Group data-sveltekit-preload-data="tap">
		<Collapsible.Root open={true} class="group/collapsible">
			{#snippet child({ props })}
				<Sidebar.MenuItem {...props}>
					<Collapsible.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton {...props} class="text-sidebar-foreground/70">
								{#snippet tooltipContent()}
									Favorites
								{/snippet}
								{#if !sidebar.open && !sidebar.isMobile}
									<ChevronRight
										class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
									/>
								{/if}
								<span>Favorites</span>
								<ChevronRight
									class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
								/>
							</Sidebar.MenuButton>
						{/snippet}
					</Collapsible.Trigger>
					<Collapsible.Content>
						<Sidebar.Menu>
							{#each favorites.current as favorite}
								<SidebarLink
									item={{ title: favorite.name, href: favorite.href }}
									icon={favorite.icon}
								/>
							{/each}
						</Sidebar.Menu>
					</Collapsible.Content>
				</Sidebar.MenuItem>
			{/snippet}
		</Collapsible.Root>
	</Sidebar.Group>
{/if}
