<script lang="ts">
	import Head from '$comp/head.svelte';
	import type { PlayerLeaderboardEntryWithRankDto } from '$lib/api';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const profile = data.profile;
	const ranks = data.ranks;

	function formatAmount(entry: PlayerLeaderboardEntryWithRankDto) {
		let amount = entry.amount;
		if (entry?.slug.startsWith('skyblockxp')) {
			amount = (entry.amount ?? 0) / 100;
		}
		return amount.toLocaleString(undefined, formatOptions(entry));
	}

	function formatOptions(entry: PlayerLeaderboardEntryWithRankDto) {
		if (entry?.slug.startsWith('skyblockxp')) {
			return {
				maximumFractionDigits: 2,
				minimumFractionDigits: 2,
			};
		}

		return {
			maximumFractionDigits: 1,
		};
	}

	const description = $derived.by(() => {
		const rankList = Object.values(ranks ?? {});
		if (!rankList || rankList.length === 0) {
			return data.description;
		}

		return rankList
			.sort((a, b) => a.rank - b.rank)
			.slice(0, 5)
			.map((rank) => `#${rank.rank} - ${rank.short}\n⠀⤷ ${formatAmount(rank)}`)
			.join('\n')
			.trim();
	});
</script>

<Head
	title="{data.account.formattedName} ({profile?.profileName}) | Ranks"
	{description}
	imageUrl="https://api.elitebot.dev/account/{data.account.id}/face.png"
	canonicalPath="/@{data.account.name}/{encodeURIComponent(profile?.profileName ?? '')}/ranks"
/>

{#each Object.values(data.ranks ?? {}) as rank, i (i)}
	<p>
		<strong>#{rank.rank} {rank.short}</strong>: {rank.amount.toLocaleString(undefined, formatOptions(rank))}
	</p>
{/each}
