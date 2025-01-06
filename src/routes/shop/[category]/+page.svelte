<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<main>
	<h1>{data.category?.title}</h1>
	<!-- <pre>{JSON.stringify(data, undefined, 2)}</pre> -->
</main>
