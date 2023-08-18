<script lang="ts">
    import Graph from '$comp/charts/graph.svelte';
	import Skillgraph from '$comp/charts/skillgraph.svelte';
	import type { components } from '$lib/api/api';
	import { onMount } from 'svelte';
    import type { PageData } from './$types';
    
    export let data: PageData;

    // Remove duplicate data points
    $: filteredCollections = [] as components['schemas']['CropCollectionsDataPointDto'][];
    $: filteredSkills = [] as components['schemas']['SkillsDataPointDto'][];

    onMount(() => {
        const sortedCollections = data.collectionGraph?.sort((a, b) => (b?.timestamp ?? 0) - (a?.timestamp ?? 0)) ?? [];
        const collections = sortedCollections.filter((point, index) => {
            const nextPoint = sortedCollections[index + 1];
            if (!nextPoint) return true;
            return JSON.stringify(point.crops) !== JSON.stringify(nextPoint.timestamp);
        });

        filteredCollections = getIncreases(collections).filter(point => Object.keys(point ?? {}).length > 0);

        const sortedSkills = data.skillGraph?.sort((a, b) => (b?.timestamp ?? 0) - (a?.timestamp ?? 0)) ?? [];
        const skills = sortedSkills.filter((point, index) => {
            const nextPoint = sortedSkills[index + 1];
            if (!nextPoint) return true;
            return JSON.stringify(point.skills) !== JSON.stringify(nextPoint.timestamp);
        });

        filteredSkills = getIncreases(skills).filter(point => Object.keys(point ?? {}).length > 0);
    });

    function getIncreases(data: components['schemas']['CropCollectionsDataPointDto'][] | components['schemas']['SkillsDataPointDto'][]) {
        const sortedData = data.sort((a, b) => (b?.timestamp ?? 0) - (a?.timestamp ?? 0));
        return sortedData.map((point, index) => {
            if (index === 0) return point;

            const lastPoint = sortedData[index - 1];

            const key = Object.keys(point).find(key => key !== 'timestamp') as keyof typeof point;
            
            const values = Object.entries(point[key] ?? {}) as [string, number][];
            const prevValues = (lastPoint[key] ?? {}) as Record<string, number>;

            const increases = values.map(([name, value]) => {
                return [name, (value ?? 0) - (prevValues[name] ?? 0)];
            });

            return {
                ...point,
                crops: Object.fromEntries(increases.filter(([_, value]) => +value > 0)),
            };
        });
    }
</script>

<main class="flex flex-col gap-2 justify-center items-center my-16">
    <h1 class="text-4xl">{data.account.name} | {data.selectedProfile.profileName}</h1>
    <p>Discord ID: {data.account.discordId}</p>
    <p>Discord: {data.account.discordUsername}</p>

    <div class="flex flex-col gap-4 w-full">
        <Graph points={data.collectionGraph ?? []} />
        <Skillgraph points={data.skillGraph ?? []} />
    </div>

    <div class="flex flex-col md:flex-row gap-4">
        <div class="flex flex-col gap-2">
            <h3>Collection Data Points</h3>
            {#each filteredCollections as point}
                <div class="flex flex-col gap-4 bg-gray-100 dark:bg-zinc-800 rounded-md p-2">
                    <p>{new Date((point.timestamp ?? 0) * 1000).toLocaleString()}</p>
                    {#each Object.entries(point.crops ?? {}) as [crop, value]}
                        <p>{crop}: {value}</p>
                    {/each}
                </div>
            {/each}
        </div>
        <div class="flex flex-col gap-2">
            <h3>Skill Data Points</h3>
            {#each filteredSkills as point}
                <div class="flex flex-col gap-4 bg-gray-100 dark:bg-zinc-800 rounded-md p-2">
                    <p>{new Date((point.timestamp ?? 0) * 1000).toLocaleString()}</p>
                    <p>Farming: {point.skills?.['farming'].toLocaleString()}</p>
                    <p>Taming: {point.skills?.['taming'].toLocaleString()}</p>
                </div>
            {/each}
        </div>
    </div>
</main>
