<script lang="ts">
	import * as Collapsible from '$comp/ui/collapsible/index.js';
	import * as Sidebar from '$comp/ui/sidebar/index.js';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { getFavoritesContext, type FavoritedLink } from '$lib/stores/favorites.svelte';
	import SidebarLink from './sidebar-link.svelte';
	import Settings from '@lucide/svelte/icons/settings';
	import { Button } from '$ui/button';
	import { dragHandleZone, dragHandle, type DndEvent } from 'svelte-dnd-action';
	import GripHorizontal from '@lucide/svelte/icons/grip-horizontal';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { Input } from '$ui/input';

	const sidebar = Sidebar.useSidebar();
	const favorites = getFavoritesContext();

	let editing = $state(false);
	let menuOpen = $state(true);

	let items = $derived(favorites.current.map((favorite) => ({ id: favorite.href, ...favorite })));

	function onconsider(e: CustomEvent<DndEvent<FavoritedLink & { id: string }>>) {
		items = e.detail.items;
	}

	function onfinalize(e: CustomEvent<DndEvent<FavoritedLink>>) {
		favorites.setFavorites(e.detail.items);
	}

	$effect(() => {
		if (!sidebar.open && editing) {
			onEdit();
		}
	});

	function onEdit() {
		if (editing) {
			favorites.setFavorites(items);
		} else {
			menuOpen = true;
			sidebar.setOpen(true);
		}
		editing = !editing;
	}

	function openChanged(open: boolean) {
		if (!open && editing) {
			onEdit();
		}
	}
</script>

{#if favorites.current?.length}
	<Sidebar.Group data-sveltekit-preload-data="tap">
		<Collapsible.Root bind:open={menuOpen} class="group/collapsible" onOpenChange={openChanged}>
			{#snippet child({ props })}
				<Sidebar.MenuItem {...props}>
					<Collapsible.Trigger>
						{#snippet child({ props })}
							<div class="flex flex-row items-center">
								<Button
									variant={editing ? 'secondary' : 'ghost'}
									size="sm"
									class="h-8 px-2 py-0 text-sidebar-foreground/70 group-data-[state=collapsed]:hidden"
									onclick={onEdit}
								>
									<Settings class="transition-transform duration-200 {editing ? 'rotate-90' : ''}" />
								</Button>
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
							</div>
						{/snippet}
					</Collapsible.Trigger>
					<Collapsible.Content>
						<Sidebar.Menu>
							{#if editing}
								<div
									use:dragHandleZone={{ items }}
									{onconsider}
									{onfinalize}
									class="flex w-full flex-col gap-1"
								>
									{#each items as favorite (favorite.id)}
										{@render editFavorite(favorite)}
									{/each}
								</div>
							{:else}
								{#each favorites.current as favorite, i (i)}
									{@render favoriteLink(favorite)}
								{/each}
							{/if}
						</Sidebar.Menu>
					</Collapsible.Content>
				</Sidebar.MenuItem>
			{/snippet}
		</Collapsible.Root>
	</Sidebar.Group>
{/if}

{#snippet favoriteLink(favorite: FavoritedLink)}
	<SidebarLink item={{ title: favorite.name, href: favorite.href }} icon={favorite.icon} />
{/snippet}

{#snippet editFavorite(favorite: FavoritedLink)}
	<Sidebar.MenuItem>
		<div class="flex flex-row items-center">
			<div use:dragHandle class="cursor-move rounded-md p-2" aria-label="Drag to reorder">
				<GripHorizontal size={16} />
			</div>
			<Sidebar.MenuButton>
				{#snippet tooltipContent()}
					{favorite.name}
				{/snippet}
				{#snippet child()}
					<Input
						type="text"
						bind:value={favorite.name}
						class="h-8 w-full rounded-md border-2 border-border bg-card px-1.5"
						maxlength={32}
						placeholder="Favorite Name"
					/>
				{/snippet}
			</Sidebar.MenuButton>
			<Button
				variant="ghost"
				size="sm"
				class="ml-auto h-8 px-2 py-0 text-sidebar-foreground/70"
				onclick={() => {
					favorites.removeFavorite(favorite.href);
				}}
			>
				<Trash2 size={16} />
			</Button>
		</div>
	</Sidebar.MenuItem>
{/snippet}
