<script lang="ts">
	import Head from '$comp/head.svelte';
	import * as Card from '$ui/card';
	import Coins from '@lucide/svelte/icons/coins';
	import FlaskConical from '@lucide/svelte/icons/flask-conical';
	import Medal from '@lucide/svelte/icons/medal';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import Wrench from '@lucide/svelte/icons/wrench';
	import type { Component } from 'svelte';

	const tools: { title: string; description: string; href: string; icon: Component }[] = [
		{
			title: 'Fortune Sandbox',
			description: 'Configure your farming setup and see your rates with full control over every stat.',
			href: '/tools/fortune',
			icon: Wrench,
		},
		{
			title: 'Rates Calculator',
			description: 'Calculate NPC and Bazaar profit rates for any amount of farming fortune.',
			href: '/tools/rates',
			icon: Coins,
		},
		{
			title: 'Jacob Fortune',
			description: 'See the farming fortune required to earn each medal in Jacob Contests.',
			href: '/tools/jacob-fortune',
			icon: Medal,
		},
		{
			title: 'Crop Gain',
			description: 'View your daily crop collection, skill XP, and estimated uptime over the past week.',
			href: '/tools/gain',
			icon: TrendingUp,
		},
		{
			title: 'What-If Calculator',
			description: 'Pick a stat, scan a range, and see exactly how it affects your profit or collection.',
			href: '/tools/what-if',
			icon: FlaskConical,
		},
	];
</script>

<Head title="Farming Tools | Elite" description="A collection of Hypixel SkyBlock farming tools and calculators." />

<div class="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 py-8">
	<div class="flex flex-col items-center gap-2 text-center">
		<h1 class="text-3xl font-bold">Farming Tools</h1>
		<p class="text-muted-foreground max-w-lg text-sm">Calculators and utilities for Hypixel SkyBlock farming.</p>
	</div>

	<div class="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each tools as tool (tool.href)}
			<a href={tool.href} class="group">
				<Card.Root
					class="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg"
				>
					<Card.Header>
						<div class="flex items-center gap-3">
							<tool.icon class="text-muted-foreground h-5 w-5" />
							<Card.Title class="text-base">{tool.title}</Card.Title>
						</div>
					</Card.Header>
					<Card.Content>
						<p class="text-muted-foreground text-sm">{tool.description}</p>
					</Card.Content>
				</Card.Root>
			</a>
		{/each}
	</div>
</div>
