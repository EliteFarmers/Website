<script lang="ts">
	import type { ProfileGameMode } from '$lib/api/elite';
	import * as Tooltip from '$ui/tooltip';

	const icons: Record<ProfileGameMode, string> = {
		island: '☀',
		ironman: '♲',
		bingo: 'Ⓑ',
		classic: '',
	};

	const gameModeRename: Partial<Record<ProfileGameMode, string>> = {
		island: 'stranded',
	};

	let classes = '';
	export { classes as class };
	export let gameMode: ProfileGameMode = 'classic';
	export let popover = true;
</script>

<Tooltip.Root openDelay={50}>
	<Tooltip.Trigger>
		<span class="{$$props.class ?? classes} font-mono">{icons[gameMode ?? 'classic']}</span>
	</Tooltip.Trigger>
	{#if popover}
		<Tooltip.Content side="bottom">
			<h5 class="font-semibold">Profile Game Mode</h5>

			<p class="first-letter:capitalize text-center">{gameModeRename[gameMode] ?? gameMode}</p>
		</Tooltip.Content>
	{/if}
</Tooltip.Root>
