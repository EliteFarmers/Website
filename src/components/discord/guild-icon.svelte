<script lang="ts">
	import type { components } from '$lib/api/api';

	interface Props {
		guild: Partial<components['schemas']['GuildDetailsDto']> | undefined;
		size?: keyof typeof sizes;
		class?: string | undefined | null;
	}

	let { guild, size = 12, class: className = undefined }: Props = $props();

	const sizes = {
		8: 'w-8 h-8',
		10: 'w-10 h-10',
		12: 'w-12 h-12',
		16: 'w-16 h-16',
		20: 'w-20 h-20',
		24: 'w-24 h-24',
		28: 'w-28 h-28',
		32: 'w-32 h-32',
	};

	let errored = $state(false);
</script>

{#if !guild?.icon?.url || errored}
	<div
		class="{sizes[
			size
		]} bg-muted flex aspect-square items-center justify-center rounded-md bg-blend-darken select-none {className ??
			''}"
	>
		<p class="text-muted-foreground mb-0.5 leading-none">
			{guild?.name
				?.split(' ')
				.slice(0, 3)
				.map((word) => word[0])
				.join('')}
		</p>
	</div>
{:else}
	<img
		loading="lazy"
		class="w-{size} h-{size} rounded-md {className ?? ''}"
		src={guild.icon.url}
		alt="Server Icon"
		onerror={() => (errored = true)}
	/>
{/if}
