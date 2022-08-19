<script context="module" lang="ts">
	throw new Error("@migration task: Replace error load function (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3293209)");

	// import type { Load } from './$types';

	// export const load: Load = ({ error, status }) => {
	// 	return {
	// 		props: {
	// 			error: status,
	// 			message: error?.message ?? 'Unknown error.'
	// 		}
	// 	};
	// }
</script>

<script lang="ts">
	export let error: string;
	export let message: string;
</script>

<svelte:head>
	<title>{error}</title>
</svelte:head>

<h1 class="text-center font-bold text-6xl p-16 m-16 font-mono">{error}</h1>
<h4 class="text-center font-lighter text-2xl">{message}</h4>
<div class="text-center m-12">
	<a href="/" class="p-4 shadow-md shadow-gray bg-gray-300 hover:bg-gray-200">Return Home</a>
</div>
