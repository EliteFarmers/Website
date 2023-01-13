<script lang="ts">
	import Tooltip from '$comp/generic/tooltip.svelte';
	import { SKYBLOCK_LEVEL_COLORS } from '$lib/constants/levels';

	export let xp: number;

	const [, color] = Object.entries(SKYBLOCK_LEVEL_COLORS).find(([key]) => +key > xp / 100) ?? [];
</script>

<div
	class="relative max-w-fit p-2 px-3 m-1 text-lg bg-gray-200 dark:bg-zinc-700 rounded-md"
	aria-label="Skyblock Level"
>
	<span class="font-mono font-bold" style="color: {color};">{Math.floor(xp / 100)}</span>
	<Tooltip>
		<div class="flex flex-col gap-1">
			<div class="text-center">Skyblock&nbsp;Level</div>
			<div class="text-center">{xp} XP</div>
		</div>
	</Tooltip>
</div>
