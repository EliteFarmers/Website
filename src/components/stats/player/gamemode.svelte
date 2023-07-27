<script lang="ts">
	import type { ProfileGameMode } from '$lib/api/elite';
	import { Popover } from 'flowbite-svelte';

	const icons: Record<ProfileGameMode, string> = {
		island: '☀',
		ironman: '♲',
		bingo: 'Ⓑ',
		classic: '',
	};

	export { classes as class };
	export let gameMode: ProfileGameMode = 'classic';
</script>

<span class={`${$$props.class}`}>{icons[gameMode ?? 'classic']}</span>
<Popover>
	<h5 slot="title">Profile Game Mode</h5>

	<p class="first-letter:capitalize text-center">{gameMode}</p>
</Popover>
