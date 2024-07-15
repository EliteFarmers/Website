<script lang="ts">
	import * as Sheet from '$ui/sheet';
	import { Button } from '$ui/button';
	import MobileLink from '$comp/header/mobile-link.svelte';
	import Menu from 'lucide-svelte/icons/menu';
	import { NAV_PAGES } from '$content/nav';
	import ExternalLink from 'lucide-svelte/icons/external-link';

	let open = false;
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
		<div class="my-4 h-[calc(100vh-8rem)] pb-10 pl-6 overflow-auto">
			<div class="flex flex-col space-y-3">
				{#each NAV_PAGES as navItem, index (navItem + index.toString())}
					{#if navItem.href}
						<MobileLink
							href={navItem.href}
							bind:open
							class="flex flex-row gap-1 items-center text-foreground"
							target={navItem.external ? '_blank' : undefined}
						>
							{navItem.title}
							{#if navItem.external}
								<ExternalLink size={14} class="mt-0.5" />
							{/if}
						</MobileLink>
					{/if}
				{/each}
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>
