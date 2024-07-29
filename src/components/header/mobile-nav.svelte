<script lang="ts">
	import * as Sheet from '$ui/sheet';
	import { Button } from '$ui/button';
	import MobileLink from '$comp/header/mobile-link.svelte';
	import Menu from 'lucide-svelte/icons/menu';
	import { MOBILE_NAV } from '$content/nav';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import { page } from '$app/stores';

	let open = false;

	$: user = $page.data.session;
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="ghost"
			class="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
		>
			<Menu class="w-5 h-5" />
			<span class="sr-only">Toggle Menu</span>
		</Button>
	</Sheet.Trigger>
	<Sheet.Content side="left" class="pr-0">
		<MobileLink href="/" class="flex items-center" bind:open>
			<a class="flex flex-row gap-2 items-center" href="/">
				<img src="/favicon.webp" class="mr-3 h-4 w-4" alt="Elite Logo" loading="lazy" />
			</a>
			<span class="font-semibold">Elite Farmers</span>
		</MobileLink>
		<div class="my-4 h-[calc(100vh-8rem)] pb-10 px-4 overflow-auto">
			<div class="flex flex-col gap-2 mr-4">
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
											class="flex flex-row gap-1 items-center text-foreground px-2 py-2 rounded-md hover:bg-primary-foreground border-2 border-transparent data-[active=true]:border-primary-foreground"
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
