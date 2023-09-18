<script lang="ts">
	import type { ProfileGameMode } from '$lib/api/elite';
	import { Popover } from 'flowbite-svelte';

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

<span class="{$$props.class ?? classes} font-mono">{icons[gameMode ?? 'classic']}</span>
{#if popover}
	<Popover>
		<h5 slot="title">Profile Game Mode</h5>

		<p class="first-letter:capitalize text-center">{gameModeRename[gameMode] ?? gameMode}</p>
	</Popover>
{/if}
