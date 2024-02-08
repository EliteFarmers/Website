<script lang="ts">
	import { page } from '$app/stores';
	import cn from 'classnames';
</script>

<div class="mr-4 hidden md:flex gap-6">
	<a href="/" class="flex items-center gap-2">
		<img src="/favicon.webp" class="mr-3 h-6 sm:h-9" alt="Elite Logo" />
		<span class="inline-block leading-none self-center whitespace-nowrap text-xl font-semibold px-1">
			Elite Farmers
		</span>
	</a>
	<nav class="flex items-center gap-6 text-sm">
		<a
			href="/info"
			class={cn(
				'transition-colors hover:text-foreground',
				$page.url.pathname === '/info' ? 'text-foreground' : 'text-foreground/80'
			)}
		>
			Info
		</a>
		<a
			href="/browse"
			class={cn(
				'transition-colors hover:text-foreground',
				$page.url.pathname.startsWith('/browse') ? 'text-foreground' : 'text-foreground/80'
			)}
		>
			Browse
		</a>
		<a
			href="/contests"
			class={cn(
				'transition-colors hover:text-foreground',
				$page.url.pathname.startsWith('/contests') ? 'text-foreground' : 'text-foreground/80'
			)}
		>
			Contests
		</a>
		<a
			href="/leaderboard"
			class={cn(
				'transition-colors hover:text-foreground',
				$page.url.pathname.startsWith('/leaderboard') ? 'text-foreground' : 'text-foreground/80'
			)}
		>
			Top Players
		</a>
	</nav>
</div>
