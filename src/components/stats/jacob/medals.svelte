<script lang="ts">
	import { page } from '$app/state';
	import { getStatsContext } from '$lib/stores/stats.svelte';

	const ctx = getStatsContext();
	const jacob = $derived(ctx.member.current?.jacob);
	const ranks = $derived(ctx.ranks);

	let medals = $derived({
		gold: jacob?.medals?.gold ?? 0,
		silver: jacob?.medals?.silver ?? 0,
		bronze: jacob?.medals?.bronze ?? 0,
	} as Record<string, number>);

	let earnedMedals = $derived([
		['diamond', jacob?.earnedMedals?.diamond ?? 0],
		['platinum', jacob?.earnedMedals?.platinum ?? 0],
		['gold', jacob?.earnedMedals?.gold ?? 0],
		['silver', jacob?.earnedMedals?.silver ?? 0],
		['bronze', jacob?.earnedMedals?.bronze ?? 0],
	] as [string, number][]);
</script>

<div id="Medals" class="flex w-full max-w-4xl flex-col items-center md:items-start">
	<h3 class="my-2 text-2xl">Jacob Contest Rankings</h3>
	<div class="flex w-full flex-wrap justify-evenly gap-2 md:flex-row md:gap-4">
		{#each earnedMedals.slice(0, 2) as [medal, count] (medal)}
			<div class="flex-1 basis-48">
				{#if ranks[medal + 'medals']?.rank > -1}
					<a
						href="/leaderboard/{medal}medals/{page.params.id}-{ctx.selectedProfile?.profileName}"
						class="xs:justify-center bg-card hover:bg-muted flex flex-1 basis-48 flex-row items-center justify-center gap-3 rounded-md p-2"
					>
						<img src="/images/medals/{medal}.webp" alt="Medal" class="pixelated h-12 w-12 p-1" />

						<span class="text-2xl">{count.toLocaleString()}</span>

						<span class="bg-card rounded-md px-1 py-0.5">
							<span class="text-sm">#</span><span class="text-md xs:text-lg sm:text-xl"
								>{ranks[medal + 'medals']?.rank}</span
							>
						</span>
					</a>
				{:else}
					<div
						class="xs:justify-center bg-card flex flex-1 basis-48 flex-row items-center justify-center gap-3 rounded-md p-2"
					>
						<img src="/images/medals/{medal}.webp" alt="Medal" class="pixelated h-12 w-12 p-1" />

						<span class="text-2xl">{count.toLocaleString()}</span>

						<div></div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
	<div class="my-4 flex w-full flex-wrap justify-evenly gap-2 md:flex-row md:gap-4">
		{#each earnedMedals.slice(2) as [medal, count] (medal)}
			<div class="flex-1 basis-48">
				{#if ranks[medal + 'medals']?.rank > -1}
					<a
						href="/leaderboard/{medal}medals/{page.params.id}-{ctx.selectedProfile?.profileName}"
						class="xs:justify-center bg-card hover:bg-muted flex flex-1 basis-48 flex-row items-center justify-center gap-3 rounded-md p-2"
					>
						<img src="/images/medals/{medal}.webp" alt="Medal" class="pixelated h-12 w-12 p-1" />

						<div class="flex flex-col">
							<span class="text-xl leading-none">{medals[medal].toLocaleString()}</span>
							<span class="text-2xl leading-none">{count.toLocaleString()}</span>
						</div>

						<span class="bg-card rounded-md px-1 py-0.5">
							<span class="text-sm">#</span><span class="text-md xs:text-lg sm:text-xl"
								>{ranks[medal + 'medals']?.rank}</span
							>
						</span>
					</a>
				{:else}
					<div
						class="xs:justify-center bg-card flex flex-1 basis-48 flex-row items-center justify-center gap-3 rounded-md p-2"
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
		{/each}
	</div>
</div>
