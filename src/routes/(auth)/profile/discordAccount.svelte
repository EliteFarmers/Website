<script lang="ts">
	import type { components } from '$lib/api/api';
	import { Button } from 'flowbite-svelte';
	import MinecraftAccount from './minecraftAccount.svelte';

	export let account: components['schemas']['AuthorizedAccountDto'] = {};
</script>

<section class="bg-gray-200 dark:bg-zinc-800 rounded-md p-4 flex flex-col align-middle gap-4">
	<div class="flex flex-row items-center gap-4">
		<img
			class="w-14 h-14 rounded-full"
			src="https://cdn.discordapp.com/avatars/{account.id}/{account.avatar}.png"
			alt="Discord Avatar"
		/>
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
