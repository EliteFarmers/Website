<script lang="ts">
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// Escape client side navigation and redirect to the admin panel
	onMount(() => {
		if (dev) {
			goto('/');
		}
		window.location.href = window.location.href;
	});
</script>
