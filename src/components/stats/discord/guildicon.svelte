<script lang="ts">
	import type { components } from '$lib/api/api';
	export let guild: components['schemas']['GuildDetailsDto'] | undefined;
	export let size = 12;

	let className: string | undefined | null = undefined;
	export { className as class };
</script>

{#if !guild?.icon?.url}
	<div
		class="w-{size} h-{size} rounded-full flex items-center justify-center select-none bg-blend-darken bg-black {className}"
	>
		<p class="text-white leading-none">
			{guild?.name
				?.split(' ')
				.slice(0, 3)
				.map((word) => word[0])
				.join('')}
		</p>
	</div>
{:else}
	<img loading="lazy" class="w-{size} h-{size} rounded-full {className}" src={guild.icon.url} alt="Server Icon" />
{/if}
