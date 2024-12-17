<script lang="ts">
	import { page } from '$app/state';
	import { NAV_PAGES } from '$content/nav';
	import cn from 'classnames';
	import ExternalLink from 'lucide-svelte/icons/external-link';
</script>

<div class="mr-4 hidden gap-6 md:flex">
	<a href="/" class="flex items-center gap-2">
		<img src="/favicon.webp" class="mr-3 h-6 sm:h-9" alt="Elite Logo" />
		<span class="inline-block self-center whitespace-nowrap px-1 text-xl font-semibold leading-none">
			Elite Farmers
		</span>
	</a>
	<nav class="flex items-center gap-6 text-sm">
		{#each NAV_PAGES as navItem, index (navItem + index.toString())}
			{#if navItem.href && navItem.href !== '/'}
				<a
					href={navItem.href}
					class={cn(
						'flex flex-row items-center gap-1 transition-colors hover:text-foreground',
						page.url.pathname.startsWith(navItem.href) ? 'text-foreground' : 'text-foreground/80'
					)}
					target={navItem.external ? '_blank' : undefined}
				>
					{navItem.title}
					{#if navItem.external}
						<ExternalLink size={14} class="mt-0.5" />
					{/if}
				</a>
			{/if}
		{/each}
	</nav>
</div>
