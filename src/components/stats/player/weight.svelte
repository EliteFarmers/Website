<script lang="ts">
	import { page } from '$app/stores';
	import type { WeightInfo } from '$db/models/users';
	import Profiles from './profiles.svelte';

	export let weightInfo: WeightInfo;
	export let rank: number;

	export let profiles: {
		ign: string;
		selected: { id: string; name: string };
		profiles: { id: string; name: string }[];
	};

	const rankText = rank !== -1 ? `#${rank}` : 'Unranked';

	const weightStr = weightInfo?.farming?.total?.toLocaleString() ?? '0';
</script>

<section class="block">
	<div class="flex items-center gap-2">
		<a
			class="p-2 rounded-md max-w-fit bg-gray-200 dark:bg-zinc-700"
			data-sveltekit-reload
			href={`/stats/${profiles.ign}`}
		>
			{#if rank !== -1}
				<span class="mx-1 text-2xl font-semibold font-mono text-yellow-700 dark:text-yellow-400">
					<span class="text-lg mr-0.5">#</span>{rank}
				</span>
			{:else}
				<span class="mx-1 text-lg font-semibold">
					{rankText}
				</span>
			{/if}
		</a>
		<Profiles {...profiles} />
	</div>

	<div class="object-scale-down">
		<h1 class="text-7xl md:text-8xl">{weightStr}</h1>
	</div>
</section>
