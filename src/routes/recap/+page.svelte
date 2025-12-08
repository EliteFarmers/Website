<script lang="ts">
	import Head from '$comp/head.svelte';
</script>

<Head title="Elite Farmers Recap" description="Check out your recap for the past year!" />

<div class="flex h-screen w-full flex-col items-center justify-center bg-gray-900 p-8 text-white">
	<h1 class="mb-8 text-4xl font-bold">Elite Farmers Recap</h1>

	<div class="grid w-full max-w-md gap-4">
		<a
			href="/recap/2025"
			class="flex flex-col items-center rounded-lg border border-gray-700 bg-gray-800 p-6 hover:bg-gray-700"
		>
			<h2 class="mb-2 text-2xl font-semibold">2025 Recap</h2>
			<p class="text-center text-gray-400">Discover your farming achievements and highlights from 2025!</p>
		</a>
	</div>
</div>
