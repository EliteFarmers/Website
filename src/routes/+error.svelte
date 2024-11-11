<script lang="ts">
	import { page } from '$app/stores';
	import Head from '$comp/head.svelte';

	let message = $derived($page.error?.message ?? 'Unknown error.');
	let status = $derived($page.status);
</script>

<Head title={status.toString()} description={message} />

<h1 class="text-center font-bold text-6xl p-16 m-16 font-mono">{status}</h1>
<h4 class="text-center font-lighter text-2xl">{message}</h4>
<div class="flex flex-row justify-center gap-4 item text-center m-12 mb-32">
	<a
		href="/"
		class="p-4 shadow-md rounded-md shadow-gray bg-gray-300 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700"
		>Return Home</a
	>
	<button
		onclick={() => location.reload()}
		class="p-4 shadow-md rounded-md shadow-gray bg-gray-300 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700"
		>Reload</button
	>
</div>
