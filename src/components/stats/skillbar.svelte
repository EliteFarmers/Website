<script lang="ts">
	import { page } from '$app/state';
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
				? Math.floor(progress.progress).toLocaleString() + ' / ' + Math.floor(progress.goal).toLocaleString()
				: Math.floor(progress.progress).toLocaleString();
	});
</script>

<div class="flex w-full max-w-2xl flex-1 flex-col items-start justify-center gap-1">
	<div class="flex flex-row items-center gap-2">
		{#if rank >= 0}
			<a
				href="/leaderboard/{name.toLowerCase()}/{page.params.id}-{page.params.profile}"
				class="rounded-md bg-primary-foreground px-1.5 py-0.5 font-semibold text-completed hover:bg-muted"
			>
				<span class="xs:text-md text-sm leading-none sm:text-lg">#</span><span
					class="text-md xs:text-lg leading-none sm:text-xl">{rank}</span
				>
			</a>
		{/if}
		<span class="text-md xs:text-lg sm:text-xl">{name} <strong>{progress.level.toLocaleString()}</strong></span>
	</div>
	<div
		class="relative h-8 w-full rounded-lg bg-primary-foreground"
		onmouseenter={() => (hovering = true)}
		onmouseleave={() => (hovering = false)}
		role="none"
	>
		{#if percent >= 100}
			<div class="absolute bottom-0 left-0 top-0 rounded-lg bg-completed" style="width: 100%;"></div>
		{:else}
			<div
				class="absolute bottom-0 left-0 top-0 rounded-lg bg-progress"
				style="width: {Math.max(2, percent)}%;"
			></div>
		{/if}
		<div class="absolute flex h-full w-full items-center justify-center">
			<p class="text-lg font-semibold leading-none">{hovering ? expanded : readable}</p>
		</div>
	</div>
</div>
