<script lang="ts">
	import { page } from '$app/stores';
	import { NAV_PAGES } from '$content/nav';
	import cn from 'classnames';
	import ExternalLink from 'lucide-svelte/icons/external-link';
</script>

<div class="mr-4 hidden md:flex gap-6">
	<a href="/" class="flex items-center gap-2">
		<img src="/favicon.webp" class="mr-3 h-6 sm:h-9" alt="Elite Logo" />
		<span class="inline-block leading-none self-center whitespace-nowrap text-xl font-semibold px-1">
			Elite Farmers
		</span>
	</a>
	<nav class="flex items-center gap-6 text-sm">
		{#each NAV_PAGES as navItem, index (navItem + index.toString())}
			{#if navItem.href && navItem.href !== '/'}
				<a
					href={navItem.href}
					class={cn(
						'flex flex-row gap-1 items-center transition-colors hover:text-foreground',
						$page.url.pathname.startsWith(navItem.href) ? 'text-foreground' : 'text-foreground/80'
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
