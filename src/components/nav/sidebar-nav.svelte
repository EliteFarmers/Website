<script lang="ts">
	import { page } from '$app/state';
	import type { NavItem } from '$content/nav';
	import { cn } from '$lib/utils';
	import ExternalLink from 'lucide-svelte/icons/external-link';

	let { navItems = [] as { title: string; items: NavItem[] }[] } = $props();
	let user = $derived(page.data.session);
</script>

<nav class="flex w-full flex-col gap-4">
	{#each navItems as navItem, index (index)}
		<div>
			<span
				class="block whitespace-nowrap rounded-lg border border-transparent px-3 pb-2 text-sm font-semibold uppercase tracking-wider text-zinc-400"
			>
				{navItem.title}
			</span>
			<div class="grid grid-flow-row auto-rows-max gap-0.5">
				{#each navItem.items ?? [] as item}
					{#if item.href && (!item.auth || (item.auth && user))}
						<div class="px-1">
							<a
								href={item.href}
								class={cn(
									'flex flex-row items-center gap-1 whitespace-nowrap rounded-lg border-2 border-transparent px-2.5 py-1.5 font-medium capitalize',
									'text-sm hover:bg-primary-foreground',
									'data-[active=true]:border-primary-foreground'
								)}
								data-active={page.url.pathname === item.href}
							>
								{item.title}
								{#if item.external}
									<ExternalLink size={14} class="mt-0.5" />
								{/if}
							</a>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</nav>
