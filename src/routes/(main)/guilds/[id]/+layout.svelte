<script lang="ts">
	import { page } from '$app/state';
	import GuildTag from '$comp/guilds/guild-tag.svelte';
	import DateDisplay from '$comp/time/date-display.svelte';
	import { RoundToFixed } from '$lib/format';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const createdAt = $derived.by(() => Number(data.guild.createdAt ?? 0));
	const lastUpdated = $derived.by(() => Number(data.guild.lastUpdated ?? 0) * 1000);
	const preferredGames = $derived.by(() => data.guild.preferredGames?.filter(Boolean) ?? []);

	const latestStats = $derived.by(() => data.guild.stats?.[0]);

	const overviewStats = $derived.by(() => {
		const stats = latestStats;
		if (!stats) return [] as { key: string; label: string; value: string }[];

		const entries: { key: string; label: string; value: string }[] = [];

		const skyblockAvg = stats.skyblockExperience?.average ?? 0;
		entries.push({
			key: 'avg-skyblock',
			label: 'Avg Skyblock Level',
			value: (skyblockAvg / 100).toLocaleString(undefined, {
				maximumFractionDigits: 2,
				minimumFractionDigits: 2,
			}),
		});

		entries.push({
			key: 'avg-skill',
			label: 'Avg Skill Level',
			value: RoundToFixed(stats.skillLevel?.average ?? 0, 2).toLocaleString(undefined, {
				maximumFractionDigits: 2,
				minimumFractionDigits: 2,
			}),
		});

		entries.push({
			key: 'farming-weight',
			label: 'Farming Weight',
			value: RoundToFixed(stats.farmingWeight?.total ?? 0, 0).toLocaleString(),
		});

		entries.push({
			key: 'member-count',
			label: 'Members',
			value: data.guild.memberCount.toLocaleString(),
		});

		return entries;
	});

	const navLinks = [
		{ label: 'Overview', href: `/guilds/${data.guild.id}`, match: 'exact' as const },
		{ label: 'Member Leaderboards', href: `/guilds/${data.guild.id}/members`, match: 'startsWith' as const },
	];

	const pathname = $derived(page.url.pathname);

	function isActive(href: string, match: 'exact' | 'startsWith') {
		return match === 'exact' ? pathname === href : pathname.startsWith(href);
	}
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-4 py-10">
	<section class="bg-card rounded-lg border p-6 shadow-sm">
		<div class="flex flex-col gap-6">
			<div class="flex flex-col gap-4">
				<div class="flex flex-wrap items-center gap-3">
					<h1 class="text-3xl font-bold">{data.guild.name}</h1>
					{#if data.guild.tag}
						<GuildTag tag={data.guild.tag} tagColor={data.guild.tagColor} />
					{/if}
				</div>
				{#if data.guild.description}
					<p class="text-muted-foreground max-w-2xl whitespace-pre-wrap">{data.guild.description}</p>
				{/if}
				{#if preferredGames.length}
					<div class="flex flex-wrap gap-2">
						{#each preferredGames as game (game)}
							<span
								class="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase"
							>
								{game}
							</span>
						{/each}
					</div>
				{/if}
			</div>
			<div class="text-muted-foreground flex flex-col items-start gap-3 text-sm sm:items-center md:flex-row">
				{#if createdAt}
					<span class="flex items-center gap-2">
						<span class="text-foreground font-medium">Created</span>
						<DateDisplay timestamp={createdAt} class="text-foreground font-medium" />
					</span>
				{/if}
				{#if lastUpdated}
					<span class="flex items-center gap-2">
						<span class="text-foreground font-medium">Last Updated</span>
						<DateDisplay timestamp={lastUpdated} class="text-foreground font-medium" />
					</span>
				{/if}
				<a
					class="text-primary flex flex-row items-center gap-1 hover:underline"
					href="https://plancke.io/hypixel/guild/name/{data.guild.name}"
					>Plancke
					<ExternalLink class="size-4" />
				</a>
				<!-- <span>
					Publicly Listed:
					<strong class="text-foreground">{data.guild.publiclyListed ? 'Yes' : 'No'}</strong>
				</span> -->
			</div>
		</div>
	</section>

	{#if overviewStats.length}
		<section class="grid gap-4 md:grid-cols-2">
			{#each overviewStats as stat (stat.key)}
				<div class="bg-card rounded-lg border p-4">
					<p class="text-muted-foreground text-sm">{stat.label}</p>
					<p class="text-2xl font-semibold">{stat.value}</p>
				</div>
			{/each}
		</section>
	{/if}

	<nav class="mt-6 flex flex-wrap gap-2 border-b pb-2">
		{#each navLinks as link (link.href)}
			{@const active = isActive(link.href, link.match)}
			<a
				href={link.href}
				class={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
					active
						? 'bg-primary text-primary-foreground shadow-sm'
						: 'text-muted-foreground hover:bg-muted hover:text-foreground'
				}`}
				aria-current={active ? 'page' : undefined}
			>
				{link.label}
			</a>
		{/each}
	</nav>

	{@render children?.()}
</div>
