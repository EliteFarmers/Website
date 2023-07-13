<script lang="ts">
	import { page } from '$app/stores';
	import { SKYBLOCK_LEVEL_COLORS } from '$lib/constants/levels';
	import { Popover } from 'flowbite-svelte';

	export let xp: number;
	export let rank = -1;

	$: [, color] = Object.entries(SKYBLOCK_LEVEL_COLORS).find(([key]) => +key > xp / 100) ?? [];
	$: profile = $page.params.profile;
</script>

<div
	class="relative flex flex-row justify-between items-center gap-1 max-w-fit p-1 m-1 text-lg bg-gray-200 dark:bg-zinc-700 rounded-md"
	aria-label="Skyblock Level"
>
	{#if rank !== -1}
		<a
			href="/leaderboard/skyblockxp/{$page.params.id}-{profile}"
			class="px-1.5 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 hover:dark:bg-zinc-600"
		>
			<span class="text-sm xs:text-md sm:text-lg">#</span><span
				class="text-md xs:text-lg sm:text-xl">{rank}</span
			>
	</a>
	{/if}
	<span class="font-mono font-bold text-2xl px-1" style="color: {color};">{Math.floor(xp / 100)}</span>
	<Popover>
		<div slot="title" class="text-center">Skyblock&nbsp;Level</div>
		<div class="text-center">{xp} XP</div>
	</Popover>
</div>
