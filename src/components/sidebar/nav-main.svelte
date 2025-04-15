<script lang="ts">
	import * as Collapsible from '$comp/ui/collapsible/index.js';
	import * as Sidebar from '$comp/ui/sidebar/index.js';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import SidebarLink from './sidebar-link.svelte';

	let {
		items,
		title = 'Group',
	}: {
		items: {
			title: string;
			href: string;
			// this should be `Component` after @lucide/svelte updates types
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			icon?: any;
			open?: boolean;
			items?: {
				title: string;
				href: string;
			}[];
		}[];
		title?: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon?: any;
	} = $props();

	const sidebar = Sidebar.useSidebar();
</script>

<Sidebar.Group data-sveltekit-preload-data="tap">
	<Collapsible.Root open={true} class="group/collapsible">
		{#snippet child({ props })}
			<Sidebar.MenuItem {...props}>
				<Collapsible.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton {...props} class="text-sidebar-foreground/70">
							{#snippet tooltipContent()}
								{title}
							{/snippet}
							{#if !sidebar.open && !sidebar.isMobile}
								<ChevronRight
									class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
								/>
							{/if}
							<span>{title}</span>
							<ChevronRight
								class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
							/>
						</Sidebar.MenuButton>
					{/snippet}
				</Collapsible.Trigger>
				<Collapsible.Content>
					<Sidebar.Menu>
						{#each items as mainItem (mainItem.title)}
							{#if mainItem.items?.length}
								<Collapsible.Root open={mainItem.open} class="group/sub-collapsible">
									{#snippet child({ props })}
										<Sidebar.MenuItem {...props}>
											<Collapsible.Trigger>
												{#snippet child({ props })}
													<Sidebar.MenuButton {...props}>
														{#snippet tooltipContent()}
															{mainItem.title}
														{/snippet}
														{#if mainItem.icon}
															<mainItem.icon />
														{/if}
														<span>{mainItem.title}</span>
														<ChevronRight
															class="ml-auto transition-transform duration-200 group-data-[state=open]/sub-collapsible:rotate-90"
														/>
													</Sidebar.MenuButton>
												{/snippet}
											</Collapsible.Trigger>
											<Collapsible.Content>
												{#if mainItem.items}
													<Sidebar.MenuSub>
														{#each mainItem.items as subItem (subItem.title)}
															<Sidebar.MenuSubItem>
																<Sidebar.MenuSubButton>
																	{#snippet child({ props })}
																		<a href={subItem.href} {...props}>
																			<span>{subItem.title}</span>
																		</a>
																	{/snippet}
																</Sidebar.MenuSubButton>
															</Sidebar.MenuSubItem>
														{/each}
													</Sidebar.MenuSub>
												{/if}
											</Collapsible.Content>
										</Sidebar.MenuItem>
									{/snippet}
								</Collapsible.Root>
							{:else}
								<SidebarLink item={mainItem} />
							{/if}
						{/each}
					</Sidebar.Menu>
				</Collapsible.Content>
			</Sidebar.MenuItem>
		{/snippet}
	</Collapsible.Root>
</Sidebar.Group>
