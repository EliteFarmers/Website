<script lang="ts">
	import { page } from '$app/state';
	import type { components } from '$lib/api/api';
	import * as Popover from '$ui/popover';

	interface Props {
		total: components['schemas']['MedalInventoryDto'] | undefined;
		earned: components['schemas']['EarnedMedalInventoryDto'] | undefined;
		ranks?: {
			bronze: number;
			silver: number;
			gold: number;
			platinum: number;
			diamond: number;
		};
	}

	let {
		total,
		earned,
		ranks = {
			bronze: -1,
			silver: -1,
			gold: -1,
			platinum: -1,
			diamond: -1,
		},
	}: Props = $props();

	let medals = $derived({
		gold: total?.gold ?? 0,
		silver: total?.silver ?? 0,
		bronze: total?.bronze ?? 0,
	} as Record<keyof typeof ranks, number>);

	let earnedMedals = $derived([
		['diamond', earned?.diamond ?? 0],
		['platinum', earned?.platinum ?? 0],
		['gold', earned?.gold ?? 0],
		['silver', earned?.silver ?? 0],
		['bronze', earned?.bronze ?? 0],
	] as [keyof typeof ranks, number][]);

	let profile = $derived(page.params.profile);
</script>

<div id="Medals" class="flex flex-col items-center md:items-start">
	<h3 class="my-2 text-2xl">Jacob Contest Rankings</h3>
	<div class="flex w-full flex-wrap justify-evenly gap-2 md:flex-row md:gap-4">
		{#each earnedMedals.slice(0, 2) as [medal, count] (medal)}
			<Popover.Mobile triggerRootClass="flex-1 basis-48" triggerClass="w-full">
				{#snippet trigger()}
					<div class="w-full">
						{#if ranks[medal] > -1}
							<a
								href="/leaderboard/{medal}medals/{page.params.id}-{profile}"
								class="xs:justify-center flex flex-1 basis-48 flex-row items-center justify-center gap-3 rounded-md bg-primary-foreground p-2 hover:bg-muted"
							>
								<img src="/images/medals/{medal}.webp" alt="Medal" class="pixelated h-12 w-12 p-1" />

								<span class="text-2xl">{count.toLocaleString()}</span>

								<span class="rounded-md bg-card px-1 py-0.5">
									<span class="text-sm">#</span><span class="text-md xs:text-lg sm:text-xl"
										>{ranks[medal]}</span
									>
								</span>
							</a>
						{:else}
							<div
								class="xs:justify-center flex flex-1 basis-48 flex-row items-center justify-center gap-3 rounded-md bg-primary-foreground p-2 hover:bg-muted"
							>
								<img src="/images/medals/{medal}.webp" alt="Medal" class="pixelated h-12 w-12 p-1" />

								<span class="text-2xl">{count.toLocaleString()}</span>

								<div></div>
							</div>
						{/if}
					</div>
				{/snippet}
				<div>
					<p>
						Placed in <span class="inline-block first-letter:capitalize">{medal}</span> Bracket {count.toLocaleString()}
						times!
					</p>
				</div>
			</Popover.Mobile>
		{/each}
	</div>
	<div class="my-4 flex w-full flex-wrap justify-evenly gap-2 md:flex-row md:gap-4">
		{#each earnedMedals.slice(2) as [medal, count] (medal)}
			<Popover.Mobile triggerRootClass="flex-1 basis-48" triggerClass="w-full">
				{#snippet trigger()}
					<div class="w-full">
						{#if ranks[medal] > -1}
							<a
								href="/leaderboard/{medal}medals/{page.params.id}-{profile}"
								class="xs:justify-center flex flex-1 basis-48 flex-row items-center justify-center gap-3 rounded-md bg-primary-foreground p-2 hover:bg-muted"
							>
								<img src="/images/medals/{medal}.webp" alt="Medal" class="pixelated h-12 w-12 p-1" />

								<div class="flex flex-col">
									<span class="text-xl leading-none">{medals[medal].toLocaleString()}</span>
									<span class="text-2xl leading-none">{count.toLocaleString()}</span>
								</div>

								<span class="rounded-md bg-card px-1 py-0.5">
									<span class="text-sm">#</span><span class="text-md xs:text-lg sm:text-xl"
										>{ranks[medal]}</span
									>
								</span>
							</a>
						{:else}
							<div
								class="xs:justify-center flex flex-1 basis-48 flex-row items-center justify-center gap-3 rounded-md bg-primary-foreground p-2 hover:bg-muted"
							>
								<img src="/images/medals/{medal}.webp" alt="Medal" class="pixelated h-12 w-12 p-1" />

								<div class="flex flex-col">
									<span class="text-xl leading-none">{medals[medal].toLocaleString()}</span>
									<span class="text-2xl leading-none">{count.toLocaleString()}</span>
								</div>

								<div></div>
							</div>
						{/if}
					</div>
				{/snippet}
				<div>
					<div class="flex flex-col">
						<span>{medals[medal].toLocaleString()} - Medals in inventory</span>
						<span>{count.toLocaleString()} - Placements in {medal} bracket</span>
					</div>
				</div>
			</Popover.Mobile>
		{/each}
	</div>
</div>
