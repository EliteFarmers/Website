<script lang="ts">
	import type { components } from '$lib/api/api';
	import * as Popover from '$ui/popover';

	interface Props {
		badge: components['schemas']['UserBadgeDto'] | components['schemas']['BadgeDto'];
	}

	let { badge }: Props = $props();
</script>

<Popover.Root>
	<Popover.Trigger>
		{#if badge.image?.url}
			<img src={badge.image.url} class="w-18 h-6 rounded-sm object-cover md:h-8 md:w-24" alt={badge.name} />
		{:else}
			<p>{badge.name}</p>
		{/if}
	</Popover.Trigger>
	<Popover.Content>
		<div class="flex max-w-sm flex-col items-center justify-center gap-1">
			<p class="text-lg font-semibold">{badge.name}</p>
			<p class="text-center">{badge.description}</p>
			{#if 'timestamp' in badge}
				<p class="mt-1 font-semibold">Obtained</p>
				<p>{new Date(+(badge.timestamp ?? 0) * 1000).toLocaleString()}</p>
			{/if}
			<a href="/info#Badges" class="text-blue-500">What is this?</a>
		</div>
	</Popover.Content>
</Popover.Root>
