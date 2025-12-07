<script lang="ts">
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
	import SummarySlide from '$comp/replay/slides/SummarySlide.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<WrappedContainer>
	<IntroSlide data={data.wrapped.player} year={data.wrapped.year} />
	<ActivitySlide data={data.wrapped.player} />
	<ContestSlide data={data.wrapped.contests} />
	<ShopSlide hasPurchased={data.wrapped.shop.hasPurchased} />
	<EventSlide data={data.wrapped.events} />
	<CollectionSlide data={data.wrapped.collections} />
	<PestSlide data={data.wrapped.pests} />
	<SkillSlide data={data.wrapped.skills} />
	<LeaderboardSlide data={data.wrapped.leaderboards} />
	<GlobalStatsSlide data={data.wrapped.global} />
	<SummarySlide data={data.wrapped} />
</WrappedContainer>
