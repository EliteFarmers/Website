<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(async () => {
		//await invalidate('custom:auth');
		goto('/');
	});
</script>

<!-- It took entirely too much time to discover that this page was needed -->
<!-- Why couldn't I just do this in +page.ts -->
