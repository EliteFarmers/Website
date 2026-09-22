<script lang="ts">
	import LeaderboardRankLink from '$comp/leaderboards/leaderboard-rank-link.svelte';
	import { getLevelProgress, toReadable } from '$lib/format';
	import type { Skill } from '$lib/skyblock';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { Skeleton } from '$ui/skeleton';
	import { getGardenLevel } from 'farming-weight';

	interface Props {
		skill: Skill | 'garden' | 'coop-social';
		overflow?: boolean;
	}

	let { skill, overflow = false }: Props = $props();

	const ctx = getStatsContext();

	const name = $derived(skill === 'coop-social' ? 'Co-op Social' : skill.charAt(0).toUpperCase() + skill.slice(1));
	const rank = $derived(ctx.ranks?.[skill]?.rank ?? -1);
	const loading = $derived(ctx.member.loading);

	const progress = $derived.by(() => {
		if (skill === 'garden') return getGardenLevel(Number(ctx.garden?.experience ?? 0), overflow);
		if (skill === 'coop-social') return getLevelProgress('social', ctx.member.current?.socialXp ?? 0);

		const level = ctx.member.current?.stats?.skills?.levels?.[skill];
		return {
			level: level?.level ?? 0,
			ratio: level?.progress ?? 0,
			progress: level?.xpCurrent ?? 0,
			goal: level?.xpForNext ? level.xpForNext : undefined,
		};
	});

	let percent = $derived(Math.round(progress.ratio * 100));
	let readable = $state('');
	let expanded = $state('');
	let hovering = $state(false);

	$effect.pre(() => {
		const lang = navigator.language;

		readable =
			progress.goal !== undefined
				? toReadable(progress.progress, lang) + ' / ' + toReadable(progress.goal, lang)
				: toReadable(progress.progress, lang);

		expanded =
			progress.goal !== undefined
				? Math.floor(progress.progress).toLocaleString() + ' / ' + Math.floor(progress.goal).toLocaleString()
				: Math.floor(progress.progress).toLocaleString();
	});
</script>

<div
	class="flex w-full max-w-2xl flex-1 flex-col items-start justify-center gap-1 rounded-md bg-background p-2 text-foreground"
>
	<div class="flex flex-row items-center gap-2">
		{#if rank >= 0}
			<LeaderboardRankLink
				category={skill}
				player={ctx.ign}
				profile={ctx.selectedProfile?.profileName}
				{rank}
				class="rounded-md bg-card px-1.5 py-0.5 font-semibold text-completed hover:bg-muted"
			>
				<span class="xs:text-md text-sm leading-none sm:text-lg">#</span><span
					class="text-md xs:text-lg leading-none sm:text-xl">{rank}</span
				>
			</LeaderboardRankLink>
		{/if}
		<div class="text-md xs:text-lg sm:text-xl">
			<span>{name}</span>
			{#if loading}
				<Skeleton class="m-0 -mb-1 inline-block h-6 w-8 rounded-md" />
			{:else}
				<span><strong>{progress.level.toLocaleString()}</strong></span>
			{/if}
		</div>
	</div>
	<div
		class="relative h-8 w-full rounded-lg bg-card text-card-foreground"
		onmouseenter={() => (hovering = true)}
		onmouseleave={() => (hovering = false)}
		role="none"
	>
		{#if loading}
			<div class="absolute top-0 bottom-0 left-0 animate-pulse rounded-lg bg-muted" style="width: 100%;"></div>
		{:else if percent >= 100}
			<div class="absolute top-0 bottom-0 left-0 rounded-lg bg-completed" style="width: 100%;"></div>
		{:else}
			<div
				class="absolute top-0 bottom-0 left-0 rounded-lg bg-progress"
				style="width: {Math.max(2, percent)}%;"
			></div>
		{/if}
		{#if !loading}
			<div class="absolute flex h-full w-full items-center justify-center">
				<p class="text-lg leading-none font-semibold">{hovering ? expanded : readable}</p>
			</div>
		{/if}
	</div>
</div>
