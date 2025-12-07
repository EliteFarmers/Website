<script lang="ts">
	import { page } from '$app/stores';

	// Mock accounts
	const accounts = [
		{ ign: 'MyPlayerName', uuid: '1234' },
		{ ign: 'AltAccount', uuid: '5678' },
	];

	const year = $page.params.year;
</script>

<div class="flex h-screen w-full flex-col items-center justify-center bg-gray-900 p-8 text-white">
	<h1 class="mb-8 text-4xl font-bold">Select Account</h1>

	<div class="grid w-full max-w-md gap-4">
		{#each accounts as account}
			<a
				href="/replay/{year}/{account.ign}"
				class="flex items-center gap-4 rounded-xl bg-white/10 p-4 transition-colors hover:bg-white/20"
			>
				<img
					src={`https://mc-heads.net/avatar/${account.ign}`}
					alt={account.ign}
					class="h-12 w-12 rounded-lg"
				/>
				<span class="text-xl font-bold">{account.ign}</span>
			</a>
		{/each}
	</div>
</div>
