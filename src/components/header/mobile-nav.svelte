<script lang="ts">
	import * as Sheet from '$ui/sheet';
	import { buttonVariants } from '$ui/button';
	import MobileLink from '$comp/header/mobile-link.svelte';
	import Menu from 'lucide-svelte/icons/menu';
	import { MOBILE_NAV } from '$content/nav';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';

	let open = $state(false);

	let user = $derived($page.data.session);
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger
		class={cn(
			buttonVariants({
				variant: 'ghost',
				class: 'mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden',
			})
		)}
	>
		<Menu class="h-5 w-5" />
		<span class="sr-only">Toggle Menu</span>
	</Sheet.Trigger>
	<Sheet.Content side="left" class="pr-0">
		<MobileLink href="/" class="flex items-center" bind:open>
			<a class="flex flex-row items-center gap-2" href="/">
				<img src="/favicon.webp" class="mr-3 h-4 w-4" alt="Elite Logo" loading="lazy" />
			</a>
			<span class="font-semibold">Elite Farmers</span>
		</MobileLink>
		<div class="my-4 h-[calc(100vh-8rem)] overflow-auto px-4 pb-10">
			<div class="mr-4 flex flex-col gap-2">
				{#each MOBILE_NAV as navItem, index (index)}
					{#if navItem.auth === undefined || (!navItem.auth && !user) || (navItem.auth && user)}
						<div>
							<span
								class="block whitespace-nowrap rounded-lg border border-transparent p-2 text-sm font-semibold uppercase tracking-wider text-zinc-400"
							>
								{navItem.title}
							</span>
							<div class="grid grid-flow-row auto-rows-max gap-0.5">
								{#each navItem.items ?? [] as item}
									{#if item.href}
										<MobileLink
											href={item.href}
											bind:open
											class="flex flex-row items-center gap-1 rounded-md border-2 border-transparent px-2 py-2 text-foreground hover:bg-primary-foreground data-[active=true]:border-primary-foreground"
											target={item.external ? '_blank' : undefined}
											data-active={$page.url.pathname === item.href}
										>
											<span class="leading-none">{item.title}</span>
											{#if item.external}
												<ExternalLink size={14} class="mt-0.5" />
											{/if}
										</MobileLink>
									{/if}
								{/each}
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>
