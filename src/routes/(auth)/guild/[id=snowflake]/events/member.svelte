<script lang="ts">
	import type { components } from '$lib/api/api';
	import ExternalLink from 'lucide-svelte/icons/external-link';

	export let member: components['schemas']['EventMemberDto'] | components['schemas']['EventMemberBannedDto'];
</script>

<div
	class="flex justify-start lg:justify-between flex-col lg:flex-row gap-1 lg:gap-4 max-w-2xl w-full space-y-2 text-black dark:text-white"
>
	<div class="flex flex-row gap-2 lg:gap-4">
		<slot />
		<img
			src="https://mc-heads.net/avatar/{member.playerUuid}"
			class="w-8 aspect-square rounded-sm"
			alt="Player Head"
		/>
		<a href="/@{member.playerUuid}" class="text-lg underline flex flex-row items-center gap-1">
			{member.playerName}
			<ExternalLink size={20} />
		</a>
	</div>
	<div class="flex flex-row gap-2 lg:gap-4 items-center">
		{#if 'notes' in member}
			<p>{member.notes || 'Member Left'}</p>
		{/if}
		<p class="font-semibold text-xl">{(+(member.score ?? 0)).toLocaleString()}</p>
	</div>
</div>
