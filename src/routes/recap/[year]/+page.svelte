<script lang="ts">
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="flex h-screen w-full flex-col items-center justify-center bg-gray-900 p-8 text-white">
	<h1 class="mb-8 text-4xl font-bold">Select Account</h1>

	<div class="grid w-full max-w-md gap-4">
		{#each data.accounts ?? [] as account (account.id)}
			<a
				href="/recap/{data.year}/{account.name}"
				class="flex items-center gap-4 rounded-xl bg-white/10 p-4 transition-colors hover:bg-white/20"
			>
				<PlayerHead uuid={account.id} class="h-12 w-12" />
				<span class="text-xl font-bold">{account.name}</span>
			</a>
		{/each}
	</div>
</div>
