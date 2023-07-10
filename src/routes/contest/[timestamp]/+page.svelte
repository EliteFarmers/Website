<script lang="ts">
	import Head from "$comp/head.svelte";
	import { getReadableSkyblockDate } from "$lib/format";
	import type { PageData } from "./$types";

	export let data: PageData;

	$: contests = data.contests;

	console.log(data.contests);
</script>

<Head 
	title="Contests | {getReadableSkyblockDate(contests[0].timestamp ?? 0)}" 
	description="View all known participations of these Jacob contests!"
></Head>

<div class="flex flex-col items-center justify-center">
	<h1 class="text-3xl font-bold text-center text-gray-900 dark:text-zinc-400">
		{getReadableSkyblockDate(contests[0].timestamp ?? 0)}
	</h1>
	<div class="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-3">
		{#each contests as contest}
			<div class="flex flex-col items-center justify-start p-4 space-y-2 bg-white rounded-md shadow-md dark:bg-zinc-800">
				<h2 class="text-xl font-bold text-center text-gray-900 dark:text-zinc-400">
					{contest.crop ?? 'Not Found'}
				</h2>
				<div class="flex flex-col justify-center space-y-2">
					{#each contest.participations?.sort((a, b) => (b?.collected ?? 0) - (a?.collected ?? 0)) ?? [] as participant}
						<a
							href={`/stats/${participant.playerName}/`}
							class="text-lg font-bold text-center hover:underline"
						>
							<div class="flex flex-row justify-start items-start gap-4">
								<span>#{participant.position !== -1 ? (participant.position ?? 0) + 1 : '???'}</span>
								<span>{participant.playerName}</span>
								<span class="w-full text-right">{participant.collected?.toLocaleString()}</span>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>