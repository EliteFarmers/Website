<script lang="ts">
	import Head from '$comp/head.svelte';
    import Contest from '$comp/stats/jacob/contest.svelte';
    import type { PageData } from './$types';
    
    export let data: PageData;

    $: contests = data.contests.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));

    console.log(data.contests?.length);
</script>

<Head
    title="Jacob's Contests"
    description="Jacob's Contests"
/>

{#each contests ?? [] as contest (`${(contest.timestamp ?? 0)}${(contest?.crop ?? 0)}`)}
    <Contest {contest} />
{/each}