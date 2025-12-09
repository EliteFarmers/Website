<script lang="ts">
	import { page } from '$app/state';
	import Head from '$comp/head.svelte';
	import WrappedContainer from '$comp/replay/WrappedContainer.svelte';
	import ActivitySlide from '$comp/replay/slides/ActivitySlide.svelte';
	import CollectionSlide from '$comp/replay/slides/CollectionSlide.svelte';
	import ContestSlide from '$comp/replay/slides/ContestSlide.svelte';
	import EventSlide from '$comp/replay/slides/EventSlide.svelte';
	import GlobalStatsSlide from '$comp/replay/slides/GlobalStatsSlide.svelte';
	import IntroSlide from '$comp/replay/slides/IntroSlide.svelte';
	import LeaderboardSlide from '$comp/replay/slides/LeaderboardSlide.svelte';
	import PestSlide from '$comp/replay/slides/PestSlide.svelte';
	import ShopSlide from '$comp/replay/slides/ShopSlide.svelte';
	import SkillSlide from '$comp/replay/slides/SkillSlide.svelte';
	import StreakSlide from '$comp/replay/slides/StreakSlide.svelte';
	import SummarySlide from '$comp/replay/slides/SummarySlide.svelte';
	import { Button } from '$ui/button';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Head title="{data.ign}'s {data.year} Recap" description="View {data.ign}'s {data.year} highlights on Elite." />

<WrappedContainer
	profileName={data.profileName}
	playerUuid={data.playerUuid}
	profileUuid={data.profileUuid}
	year={data.year}
>
	{#snippet noperms()}
		<div class="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gray-900 p-8 text-white">
			<h1 class="mb-4 text-4xl font-bold">Recap is Private</h1>
			<p class="max-w-lg text-center text-lg text-gray-400">
				This player's recap is set to private. They can change this setting at the end of their recap to share
				it with others! If this is your recap, please log in to view it!
			</p>
			<div class="flex flex-row flex-wrap items-center justify-between gap-2">
				<Button class="mt-6" href="/recap" variant="outline">Go Back</Button>
				<Button
					class="mt-6"
					href="/login?redirect={encodeURIComponent(page.url.pathname + page.url.search + page.url.hash)}"
					>Log In</Button
				>
			</div>
		</div>
	{/snippet}

	<IntroSlide />
	<ActivitySlide />
	<ContestSlide />
	<ShopSlide />
	<EventSlide />
	<CollectionSlide />
	<PestSlide />
	<SkillSlide />
	<StreakSlide />
	<LeaderboardSlide />
	<GlobalStatsSlide />
	<SummarySlide />
</WrappedContainer>
