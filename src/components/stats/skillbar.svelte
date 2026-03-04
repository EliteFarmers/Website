<script lang="ts">
	import { page } from '$app/state';
	import { toReadable } from '$lib/format';
	import { Skeleton } from '$ui/skeleton';

	interface Props {
		name: string;
		progress: {
			level: number;
			ratio: number;
			progress: number;
			goal?: number;
		};
		rank?: number;
		loading?: boolean;
	}

	let { name, progress, rank = -1, loading = false }: Props = $props();

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

<div class="flex w-full max-w-2xl flex-1 flex-col items-start justify-center gap-1">
	<div class="flex flex-row items-center gap-2">
		{#if rank >= 0}
			<a
				href="/leaderboard/{name.toLowerCase()}/{page.params.id}-{page.params.profile}?fallback={rank}"
				class="bg-card text-completed hover:bg-muted rounded-md px-1.5 py-0.5 font-semibold"
			>
				<span class="xs:text-md text-sm leading-none sm:text-lg">#</span><span
					class="text-md xs:text-lg leading-none sm:text-xl">{rank}</span
				>
			</a>
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
		class="bg-card relative h-8 w-full rounded-lg"
		onmouseenter={() => (hovering = true)}
		onmouseleave={() => (hovering = false)}
		role="none"
	>
		{#if loading}
			<div class="bg-muted absolute top-0 bottom-0 left-0 animate-pulse rounded-lg" style="width: 100%;"></div>
		{:else if percent >= 100}
			<div class="bg-completed absolute top-0 bottom-0 left-0 rounded-lg" style="width: 100%;"></div>
		{:else}
			<div
				class="bg-progress absolute top-0 bottom-0 left-0 rounded-lg"
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
