<script lang="ts">
	import Usericon from '$comp/stats/discord/usericon.svelte';
	import type { components } from '$lib/api/api';
	import MinecraftAccount from './minecraftAccount.svelte';

	export let account: components['schemas']['AuthorizedAccountDto'] = {};
</script>

<section class="rounded-md flex flex-col align-middle gap-4">
	<div class="flex flex-row items-center gap-4">
		<Usericon user={account} />
		<div class="flex flex-col">
			<h4 class="text-2xl font-semibold">{account.username}</h4>
			<h5 class="text-md text-gray-500 font-semibold">{account.id}</h5>
		</div>
	</div>
	<div class="flex flex-col gap-4">
		{#each account.minecraftAccounts ?? [] as mc (mc.id)}
			<MinecraftAccount {mc} />
		{/each}
	</div>
</section>
