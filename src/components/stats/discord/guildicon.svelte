<script lang="ts">
	import type { components } from '$lib/api/api';
	export let guild: components['schemas']['GuildDetailsDto'] | undefined;
	export let size = 12;

	let className: string | undefined | null = undefined;
	export { className as class };
</script>

{#if !guild?.icon}
	<div
		class="w-{size} h-{size} rounded-full flex items-center justify-center select-none bg-blend-darken bg-black {className}"
	>
		<p>
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
		class="w-{size} h-{size} rounded-full {className}"
		src={`https://cdn.discordapp.com/icons/${guild?.id}/${guild?.icon}.${
			guild?.icon.startsWith('a_') ? 'gif' : 'webp'
		}?size=96`}
		alt="Server Icon"
	/>
{/if}
