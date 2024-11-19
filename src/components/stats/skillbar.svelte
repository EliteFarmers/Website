<script lang="ts">
	import { page } from '$app/stores';
	import { toReadable } from '$lib/format';

	interface Props {
		name: string;
		progress: {
			level: number;
			ratio: number;
			progress: number;
			goal?: number;
		};
		rank?: number;
	}

	let { name, progress, rank = -1 }: Props = $props();

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
				? Math.floor(progress.progress).toLocaleString() +
					' / ' +
					Math.floor(progress.goal).toLocaleString()
				: Math.floor(progress.progress).toLocaleString();
	});
</script>

<div class="flex flex-col flex-1 gap-1 items-start justify-center max-w-2xl w-full">
	<div class="flex flex-row gap-2 items-center">
		{#if rank >= 0}
			<a
				href="/leaderboard/{name.toLowerCase()}/{$page.params.id}-{$page.params.profile}"
				class="py-0.5 px-1.5 font-semibold text-green-700 dark:text-yellow-400 bg-primary-foreground rounded-md hover:bg-muted"
			>
				<span class="text-sm xs:text-md sm:text-lg leading-none">#</span><span
					class="text-md xs:text-lg sm:text-xl leading-none">{rank}</span
				>
			</a>
		{/if}
		<span class="text-md xs:text-lg sm:text-xl">{name} <strong>{progress.level.toLocaleString()}</strong></span>
	</div>
	<div
		class="relative w-full bg-primary-foreground h-8 rounded-lg"
		onmouseenter={() => (hovering = true)}
		onmouseleave={() => (hovering = false)}
		role="none"
	>
		<div
			class="absolute top-0 bottom-0 left-0 rounded-lg bg-yellow-200 dark:bg-yellow-700"
			style="width: {Math.max(2, percent)}%;"
		></div>
		{#if percent >= 100}
			<!-- Gold color to show completion -->
			<div
				class="absolute top-0 left-0 w-full h-full rounded-lg bg-yellow-400 dark:bg-yellow-600"
				style="opacity: 0.7;"
			></div>
		{/if}
		<div class="absolute flex items-center justify-center w-full h-full">
			<p class="text-lg leading-none font-semibold">{hovering ? expanded : readable}</p>
		</div>
	</div>
</div>
