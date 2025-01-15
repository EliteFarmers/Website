<script lang="ts">
	import type { ProfileDetails } from '$lib/api/elite';
	import * as Popover from '$ui/popover';
	import Gamemode from '$comp/stats/player/gamemode.svelte';

	interface Props {
		ign: string;
		selected: ProfileDetails;
		profiles: ProfileDetails[];
	}

	let { ign, selected, profiles }: Props = $props();
</script>

<div class="flex flex-row items-center gap-2">
	<Popover.Mobile hasContent={profiles.length > 0}>
		{#snippet trigger()}
			<div class="z-10 col-span-1 grid">
				<div class="mx-1 rounded-md bg-primary-foreground p-1 px-2 lg:p-2">
					<h2 class="text-2xl md:text-3xl">
						{selected.name}
					</h2>
				</div>
			</div>
		{/snippet}
		{#if profiles.length > 0}
			<div class="flex flex-col gap-1" data-sveltekit-preload-data="tap">
				{#each profiles ?? [] as pId (pId.id)}
					<a
						href={`/@${ign}/${pId.name}`}
						class="flex flex-row justify-between gap-4 rounded-sm p-2 text-xl font-semibold hover:bg-muted"
					>
						<div class="flex flex-row items-center gap-2">
							<span>{pId.name}</span>
							<Gamemode popover={false} gameMode={pId.gameMode} />
						</div>
						<span class="font-normal">{pId.weight.toLocaleString()}</span>
					</a>
				{/each}
				<div class="flex flex-row justify-between gap-4 rounded-sm bg-muted p-2 text-xl">
					<span class="font-semibold">Total Weight</span>
					<span class="font-normal">
						{(
							profiles.reduce((sum, profile) => sum + profile.weight, 0) + selected.weight
						).toLocaleString()}
					</span>
				</div>
			</div>
		{/if}
	</Popover.Mobile>
	<Gamemode
		class="text-2xl font-semibold text-muted-foreground first-letter:capitalize"
		gameMode={selected.gameMode}
	/>
</div>
