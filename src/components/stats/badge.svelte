<script lang="ts">
	import type { components } from '$lib/api/api';
	import * as Popover from '$ui/popover';

	export let badge: components['schemas']['UserBadgeDto'] | components['schemas']['BadgeDto'];
</script>

<Popover.Root>
	<Popover.Trigger>
		{#if badge.image?.url}
			<img src={badge.image.url} class="w-18 h-6 md:w-24 md:h-8 rounded-sm object-cover" alt={badge.name} />
		{:else}
			<p>{badge.name}</p>
		{/if}
	</Popover.Trigger>
	<Popover.Content>
		<div class="flex flex-col gap-1 justify-center items-center max-w-sm">
			<p class="font-semibold text-lg">{badge.name}</p>
			<p class="text-center">{badge.description}</p>
			{#if 'timestamp' in badge}
				<p class="font-semibold mt-1">Obtained</p>
				<p>{new Date(+(badge.timestamp ?? 0) * 1000).toLocaleString()}</p>
			{/if}
			<a href="/info#Badges" class="text-blue-500">What is this?</a>
		</div>
	</Popover.Content>
</Popover.Root>
