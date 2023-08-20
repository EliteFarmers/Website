<script lang="ts">
	import type { components } from '$lib/api/api';

	export let member: components['schemas']['EventMemberDto'];
</script>

<div class="flex items-center justify-between flex-row gap-4 max-w-2xl w-full space-y-2 text-black dark:text-white">
	<div class="flex flex-row gap-4">
		<slot />
		<img
			src="https://mc-heads.net/avatar/{member.playerUuid}"
			class="w-8 aspect-square rounded-sm"
			alt="Player Head"
		/>
		<p class="text-lg">{member.playerName}</p>
	</div>
	<div class="flex flex-row gap-4">
		{#if member.notes || member.status === 2}
			<p>{member.notes || (member.status === 2 ? 'Member Left' : '')}</p>
		{/if}
		<p class="font-semibold text-xl">{(+(member.amountGained ?? 0)).toLocaleString()}</p>
	</div>
</div>
