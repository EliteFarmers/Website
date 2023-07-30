<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { toReadable } from '$lib/format';

	export let name: string;
	export let progress: {
		level: number;
		ratio: number;
		progress: number;
		goal?: number;
	};
	export let rank = -1;

	$: percent = Math.round(progress.ratio * 100);
	$: readable = '';
	$: expanded = '';
	$: hovering = false;

	$: {
		if (browser) {
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
		}
	}
</script>

<section class="flex justify-center">
	<div class="relative w-[90%] my-1">
		<div class="mb-1">
			{#if rank >= 0}
				<a
					href="/leaderboard/skills/{name.toLowerCase()}/+{$page.params.id}-{$page.params.profile}"
					class="py-1 pt-1.5 px-1.5 font-semibold text-green-700 dark:text-yellow-400 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 hover:dark:bg-zinc-700"
				>
					<span class="text-sm xs:text-md sm:text-lg">#</span><span class="text-md xs:text-lg sm:text-xl"
						>{rank}</span
					>
				</a>
			{/if}
			<span class="text-md xs:text-lg sm:text-xl">{name} <strong>{progress.level}</strong></span>
		</div>
		<div
			class="relative w-[100%] bg-slate-300 dark:bg-zinc-500 h-8 rounded-lg"
			on:mouseenter={() => (hovering = true)}
			on:mouseleave={() => (hovering = false)}
			role="none"
		>
			<div
				class="absolute top-0 bottom-0 left-0 rounded-lg bg-yellow-100 dark:bg-yellow-600"
				style="width: {Math.max(2, percent)}%;"
			/>
			{#if percent >= 100}
				<!-- Gold color to show completion -->
				<div
					class="absolute top-0 left-0 w-full h-full rounded-lg bg-yellow-300 dark:bg-yellow-400"
					style="opacity: 0.7;"
				/>
			{/if}
			<div class="absolute text-black grid align-middle justify-center w-[100%] h-[100%]">
				<span>{hovering ? expanded : readable}</span>
			</div>
		</div>
	</div>
</section>
