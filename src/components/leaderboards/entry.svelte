<script lang="ts">
	import { page } from '$app/stores';
	import type { LeaderboardEntry } from '$lib/api/elite';
	import { type LeaderboardConfig } from '$lib/constants/leaderboards';

	interface Props {
		entry: LeaderboardEntry;
		highlight?: boolean;
		rank: number;
		formatting?: 'number' | 'decimal';
		leaderboard?: LeaderboardConfig | undefined;
		showLeaderboardName?: boolean;
	}

	let {
		entry,
		highlight = false,
		rank,
		formatting = 'number',
		leaderboard = undefined,
		showLeaderboardName = false
	}: Props = $props();

	let options = $derived({
		maximumFractionDigits: 1,
	} as Intl.NumberFormatOptions);

	$effect(() => {
		if (formatting === 'decimal') {
			options.minimumFractionDigits = 1;
		} else if ($page.params.category === 'skyblockxp') {
			options.minimumFractionDigits = 2;
			options.maximumFractionDigits = 2;
		}
	});

	let { ign, amount, profile } = $derived(entry);
	let pageLink = $derived(entry.members ? entry.members[0].ign : ign);
	let profileLink = $derived(leaderboard?.profile ? entry.uuid : profile);
</script>

<a
	href="/@{encodeURIComponent(pageLink ?? '')}/{encodeURIComponent(profileLink ?? '')}{leaderboard?.subpage ?? ''}"
	class="inline-block w-full hover:shadow-lg hover:bg-muted align-middle py-1 sm:p-1 bg-primary-foreground border-2 max-w-2xl {highlight
		? 'border-yellow-400'
		: 'border-transparent'} rounded-md"
>
	<div class="flex gap-0 md:gap-2 justify-between items-center">
		<div
			class="flex gap-1 sm:gap-2 justify-start align-middle items-center flex-grow mx-2 overflow-hidden whitespace-nowrap text-ellipsis"
		>
			<div class="text-green-800 dark:text-green-300">
				<h1>
					<span class="text-sm xs:text-md sm:text-2xl">#</span><span class="text-lg xs:text-xl sm:text-3xl"
						>{rank}</span
					>
				</h1>
			</div>
			<!-- <Face {ign} base={face?.base} overlay={face?.overlay} /> -->
			<div class="flex flex-col flex-grow overflow-hidden whitespace-nowrap text-ellipsis">
				<p class="inline-block text-sm xs:text-xl sm:text-2xl font-semibold text-start">
					{#if leaderboard?.profile}
						{entry.members?.[0].ign}
					{:else}
						{ign}
					{/if}
				</p>
				{#if leaderboard?.profile && entry.members?.length && entry.members.length > 1}
					<div class="flex flex-row gap-1.5 text-xs xs:text-sm sm:text-md text-start">
						{#each entry.members.slice(1, 3) ?? [] as member}
							<p>{member.ign}</p>
						{/each}
						{#if entry.members.length > 3}
							<p class="font-semibold">+{entry.members.length - 3}</p>
						{/if}
					</div>
				{:else}
					<div
						class="inline overflow-hidden whitespace-nowrap text-ellipsis text-xs xs:text-sm sm:text-md text-start"
					>
						{profile}
					</div>
				{/if}
			</div>
		</div>
		<div class="flex flex-col justify-center align-middle items-end mr-2 md:mx-2">
			<span class="text-sm xs:text-xl sm:text-2xl leading-none">
				{amount?.toLocaleString(undefined, options)}
			</span>
			{#if showLeaderboardName}
				<!-- <span class="text-xs xs:text-sm sm:text-md text-right text-muted-foreground leading-none">
					{leaderboard?.title}
				</span> -->
				<div
					class="text-muted-foreground inline overflow-hidden whitespace-nowrap text-ellipsis text-xs xs:text-sm sm:text-md text-start"
				>
					{leaderboard?.title}
				</div>
			{/if}
		</div>
	</div>
</a>
