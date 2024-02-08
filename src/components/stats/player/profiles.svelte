<script lang="ts">
	import type { ProfileDetails } from '$lib/api/elite';
	import * as Popover from '$ui/popover';
	import Gamemode from '$comp/stats/player/gamemode.svelte';

	export let ign: string;
	export let selected: ProfileDetails;
	export let profiles: ProfileDetails[];
</script>

<Popover.Mobile hasContent={profiles.length > 0}>
	<div slot="trigger">
		<div class="grid col-span-1 z-10">
			<div class="flex flex-row gap-2 items-center">
				<div class="p-1 lg:p-2 px-2 mx-1 bg-card rounded-md">
					<h2 class="text-2xl md:text-3xl">
						{selected.name}
					</h2>
				</div>
				<Gamemode
					class="first-letter:capitalize font-semibold text-2xl text-muted-foreground"
					gameMode={selected.gameMode}
				/>
			</div>
		</div>
	</div>
	{#if profiles.length > 0}
		<div class="flex flex-col gap-1" data-sveltekit-preload-data="tap">
			{#each profiles ?? [] as pId (pId.id)}
				<a
					href={`/@${ign}/${pId.name}`}
					class="p-2 text-xl font-semibold flex flex-row gap-4 justify-between hover:bg-muted rounded-sm"
				>
					<div class="flex flex-row gap-2 items-center">
						<span>{pId.name}</span>
						<Gamemode popover={false} gameMode={pId.gameMode} />
					</div>
					<span class="font-normal">{pId.weight.toLocaleString()}</span>
				</a>
			{/each}
		</div>
	{/if}
</Popover.Mobile>
