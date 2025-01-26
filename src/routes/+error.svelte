<script lang="ts">
	import { page } from '$app/state';
	import Head from '$comp/head.svelte';

	let message = $derived(page.error?.message ?? 'Unknown error.');
	let status = $derived(page.status);
</script>

<Head title={status.toString()} description={message} />

<h1 class="m-16 p-16 text-center font-mono text-6xl font-bold">{status}</h1>
<h4 class="font-lighter text-center text-2xl">{message}</h4>
<div class="item m-12 mb-32 flex flex-row justify-center gap-4 text-center">
	<a href="/" class="shadow-gray 0 rounded-md bg-muted p-4 shadow-md hover:bg-muted-foreground">Return Home</a>
	<button
		onclick={() => location.reload()}
		class="shadow-gray rounded-md bg-muted p-4 shadow-md hover:bg-muted-foreground">Reload</button
	>
</div>
