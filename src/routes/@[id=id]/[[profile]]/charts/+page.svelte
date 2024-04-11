<script lang="ts">
    import CropGraph from '$comp/charts/crop-graph.svelte';
    import type { PageData } from './$types';
    
    export let data: PageData;

    $: crops = data.crops?.reduce<Record<string, { date: string, value: number }[]>>((acc, curr) => {
        for (const [ crop, value] of Object.entries(curr.crops ?? {})) {
            acc[crop] ??= [];
            acc[crop].push({
                date: (curr.timestamp ?? 0) + '',
                value: value ?? 0
            });
        }
        return acc;
    }, {}) ?? [];

</script>

<CropGraph data={crops['wheat']} />
<CropGraph data={crops['mushroom']} crop="mushroom" />