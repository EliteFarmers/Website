<script lang="ts">
	import type { ProfileGameMode } from '$lib/api/elite';
	import * as Popover from '$ui/popover';

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

<Popover.Mobile hasContent={popover}>
	<div slot="trigger">
		<span class="{$$props.class ?? classes} font-mono">{icons[gameMode ?? 'classic']}</span>
	</div>
	{#if popover}
		<div>
			<h5 class="font-semibold">Profile Game Mode</h5>

			<p class="first-letter:capitalize text-center">{gameModeRename[gameMode] ?? gameMode}</p>
		</div>
	{/if}
</Popover.Mobile>
