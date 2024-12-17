<script lang="ts">
	import { page } from '$app/state';
	import { SKYBLOCK_LEVEL_COLORS } from '$lib/constants/levels';
	import * as Popover from '$ui/popover';

	interface Props {
		xp: number;
		rank?: number;
	}

	let { xp, rank = -1 }: Props = $props();

	let [, color] = $derived(Object.entries(SKYBLOCK_LEVEL_COLORS).find(([key]) => +key > xp / 100) ?? []);
	let profile = $derived(page.params.profile);
</script>

<div
	class="relative flex max-w-fit flex-row items-center justify-between gap-1 rounded-md bg-primary-foreground p-1 text-lg"
	aria-label="Skyblock Level"
>
	<Popover.Mobile>
		{#snippet trigger()}
			<div>
				{#if rank !== -1}
					<a
						href="/leaderboard/skyblockxp/{page.params.id}-{profile}"
						class="rounded-md bg-card px-1.5 hover:bg-muted"
					>
						<span class="xs:text-md text-sm sm:text-lg">#</span><span class="text-md xs:text-lg sm:text-xl"
							>{rank}</span
						>
					</a>
				{/if}
				<span class="px-1 font-mono text-2xl font-bold" style="color: {color};">{Math.floor(xp / 100)}</span>
			</div>
		{/snippet}
		<div>
			<div class="text-center text-lg">Skyblock&nbsp;Level</div>
			<div class="text-center text-lg font-semibold">{xp} XP</div>
		</div>
	</Popover.Mobile>
</div>
