<script lang="ts">
	import Gamemode from '$comp/stats/player/gamemode.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { cn } from '$lib/utils';
	import * as Popover from '$ui/popover';

	const ctx = getStatsContext();
	const selected = $derived(ctx.selectedProfile);
	const profiles = $derived((ctx.profiles ?? []).slice(1));
</script>

<div class="flex flex-row items-center gap-2">
	<Popover.Mobile hasContent={profiles.length > 0}>
		{#snippet child({ props })}
			<div class="flex flex-row items-center gap-2 rounded-md border">
				<button {...props} class={cn(props.class ?? '', 'z-10 col-span-1 grid')}>
					<div class="mx-1 px-3 py-1.5 @md:py-2">
						<h2 class="text-xl md:text-2xl">
							{selected?.profileName}
						</h2>
					</div>
				</button>
				<Gamemode
					class="text-muted-foreground mt-1 mr-4 text-2xl font-semibold first-letter:capitalize"
					gameMode={selected?.gameMode ?? 'classic'}
				/>
			</div>
		{/snippet}
		{#if profiles.length > 0}
			<div class="flex flex-col gap-1" data-sveltekit-preload-data="tap">
				{#each profiles ?? [] as pId (pId.id)}
					<a
						href="/@{ctx.ign}/{pId.name}"
						class="hover:bg-muted flex flex-row justify-between gap-4 rounded-sm p-2 text-lg font-semibold md:text-xl"
					>
						<div class="flex flex-row items-center gap-2">
							<span>{pId.name}</span>
							<Gamemode popover={false} gameMode={pId.gameMode} />
						</div>
						<span class="font-normal">{pId.weight.toLocaleString()}</span>
					</a>
				{/each}
				<div class="flex flex-row justify-between gap-4 rounded-sm border-2 p-2 text-lg md:text-xl">
					<span class="font-semibold">Total Weight</span>
					<span>
						{(
							profiles.reduce((sum, profile) => sum + profile.weight, 0) +
							+(ctx.member.current?.farmingWeight.totalWeight ?? 0)
						).toLocaleString()}
					</span>
				</div>
			</div>
		{/if}
	</Popover.Mobile>
</div>
