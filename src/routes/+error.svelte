<script lang="ts">
	import { page } from '$app/stores';

	$: message = $page.error?.message ?? 'Unknown error.';
	$: status = $page.status;
</script>

<svelte:head>
	<title>{status}</title>
</svelte:head>

<h1 class="text-center font-bold text-6xl p-16 m-16 font-mono">{status}</h1>
<h4 class="text-center font-lighter text-2xl">{message}</h4>
<div class="text-center m-12">
	<a href="/" class="p-4 shadow-md shadow-gray bg-gray-300 hover:bg-gray-200">Return Home</a>
</div>
