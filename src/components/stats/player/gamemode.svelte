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

	interface Props {
		class?: string;
		gameMode?: ProfileGameMode;
		popover?: boolean;
	}

	let { class: classes = '', gameMode = 'classic', popover = true }: Props = $props();
</script>

<Popover.Mobile hasContent={popover}>
	{#snippet trigger()}
		<div>
			<span class="{classes} font-mono">{icons[gameMode ?? 'classic']}</span>
		</div>
	{/snippet}
	{#if popover}
		<div>
			<h5 class="font-semibold">Profile Game Mode</h5>

			<p class="text-center first-letter:capitalize">{gameModeRename[gameMode] ?? gameMode}</p>
		</div>
	{/if}
</Popover.Mobile>
