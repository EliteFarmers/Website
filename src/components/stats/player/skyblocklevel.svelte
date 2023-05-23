<script lang="ts">
	import { SKYBLOCK_LEVEL_COLORS } from '$lib/constants/levels';
	import { Button, Popover } from 'flowbite-svelte';

	export let xp: number;

	const [, color] = Object.entries(SKYBLOCK_LEVEL_COLORS).find(([key]) => +key > xp / 100) ?? [];
</script>

<Button
	class="relative max-w-fit !p-0 bg-gray-200 dark:bg-zinc-700 rounded-md"
	aria-label="Skyblock Level"
	id="skyblock-level"
>
	<span class="text-lg px-3 py-0 font-mono font-bold" style="color: {color};">{Math.floor(xp / 100)}</span>
</Button>
<Popover triggeredBy="#skyblock-level" title="Skyblock Level" arrow={false} class="text-black dark:text-white">
	<div class="flex flex-col gap-1">
		<div class="text-center">{xp} XP</div>
	</div>
</Popover>
