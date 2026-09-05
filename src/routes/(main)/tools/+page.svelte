<script lang="ts">
	import { resolve } from '$app/paths';
	import ToolPage from '$comp/tools/tool-page.svelte';
	import * as Card from '$ui/card';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Coins from '@lucide/svelte/icons/coins';
	import Recycle from '@lucide/svelte/icons/recycle';
	import Medal from '@lucide/svelte/icons/medal';
	import Sprout from '@lucide/svelte/icons/sprout';
	import TrendingUp from '@lucide/svelte/icons/trending-up';

	const tools = [
		{
			title: 'Rates Calculator',
			description: 'Compare crop collection and profit for your farming setup.',
			href: '/tools/rates',
			icon: Coins,
		},
		{
			title: 'Crop Gain Tracker',
			description: 'Review daily crop gains, skill XP, and estimated playtime.',
			href: '/tools/gain',
			icon: TrendingUp,
		},
		{
			title: 'Jacob Contest Fortune',
			description: 'Find the farming fortune needed for each contest medal.',
			href: '/tools/jacob-fortune',
			icon: Medal,
		},
		{
			title: 'Mutation Copper',
			description: 'Compare mutation analysis costs per Copper.',
			href: '/tools/mutations',
			icon: Sprout,
		},
		{
			title: 'Composter Calculator',
			description: 'Compare inputs, upgrades, Compost output, and profit.',
			href: '/tools/composter',
			icon: Recycle,
		},
	] as const;
</script>

<ToolPage title="Farming Tools" description="Calculators and trackers for your Garden." overview>
	<div class="grid gap-4 md:grid-cols-2">
		{#each tools as tool (tool.href)}
			<a
				href={resolve(tool.href)}
				class="group rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<Card.Root
					class="h-full flex-row items-center gap-4 rounded-md border-2 p-5 shadow-none transition-colors group-hover:bg-muted"
				>
					<tool.icon class="size-6 shrink-0 text-muted-foreground" aria-hidden="true" />
					<div class="min-w-0 flex-1 space-y-1">
						<h2 class="text-lg font-medium">{tool.title}</h2>
						<p class="text-sm text-muted-foreground">{tool.description}</p>
					</div>
					<ArrowRight class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
				</Card.Root>
			</a>
		{/each}
	</div>
</ToolPage>
