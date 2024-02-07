<script lang="ts">
	import type { ProfileDetails } from '$lib/api/elite';
	import * as Tooltip from '$ui/tooltip';
	import Gamemode from '$comp/stats/player/gamemode.svelte';

	export let ign: string;
	export let selected: ProfileDetails;
	export let profiles: ProfileDetails[];
</script>

<Tooltip.Root openDelay={50}>
	<Tooltip.Trigger>
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
	</Tooltip.Trigger>
	{#if profiles.length > 0}
		<Tooltip.Content side="bottom">
			<div class="flex flex-col gap-1" data-sveltekit-preload-data="tap">
				{#each profiles ?? [] as pId (pId.id)}
					<a
						href={`/@${ign}/${pId.name}`}
						class="p-2 text-xl font-semibold flex gap-4 justify-between text-gray-600 hover:text-gray-900 dark:text-zinc-200 dark:hover:text-zinc-400"
					>
						<span>{pId.name} <Gamemode popover={false} gameMode={pId.gameMode} /></span>
						<span class="font-normal">{pId.weight.toLocaleString()}</span>
					</a>
				{/each}
			</div>
		</Tooltip.Content>
	{/if}
</Tooltip.Root>
