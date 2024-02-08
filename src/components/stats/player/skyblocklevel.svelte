<script lang="ts">
	import { page } from '$app/stores';
	import { SKYBLOCK_LEVEL_COLORS } from '$lib/constants/levels';
	import * as Popover from '$ui/popover';

	export let xp: number;
	export let rank = -1;

	$: [, color] = Object.entries(SKYBLOCK_LEVEL_COLORS).find(([key]) => +key > xp / 100) ?? [];
	$: profile = $page.params.profile;
</script>

<div
	class="relative flex flex-row justify-between items-center gap-1 max-w-fit p-1 text-lg bg-primary-foreground rounded-md"
	aria-label="Skyblock Level"
>
	<Popover.Mobile>
		<div slot="trigger">
			{#if rank !== -1}
				<a
					href="/leaderboard/skyblockxp/{$page.params.id}-{profile}"
					class="px-1.5 rounded-md hover:bg-muted bg-card"
				>
					<span class="text-sm xs:text-md sm:text-lg">#</span><span class="text-md xs:text-lg sm:text-xl"
						>{rank}</span
					>
				</a>
			{/if}
			<span class="font-mono font-bold text-2xl px-1" style="color: {color};">{Math.floor(xp / 100)}</span>
		</div>
		<div>
			<div class="text-center text-lg">Skyblock&nbsp;Level</div>
			<div class="text-center font-semibold text-lg">{xp} XP</div>
		</div>
	</Popover.Mobile>
</div>
