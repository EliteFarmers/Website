<script lang="ts">
    import CropGraph from '$comp/charts/crop-graph.svelte';
    import type { PageData } from './$types';
    
    export let data: PageData;

    $: crops = data.crops;

    $: wheat = data.crops?.map((e, i) => ({
        x: e.timestamp ?? 0,
        y: e.crops?.['wheat'] ?? 0,
        crop: 'Wheat'
    })) ?? [];

</script>

<CropGraph data={wheat.map(w => ({ date: w.x + '', value: w.y }))} />