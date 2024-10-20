<script lang="ts">
	import ExternalLink from 'lucide-svelte/icons/external-link';

	export let href: string;
	export let text: string | undefined = undefined;
	export let icon = true;
</script>

<a {href} class="inline-block text-blue-500 decoration-blue-500">
	<span class="flex flex-row items-center gap-1">
		{#if text}
			<span>{text}</span>
		{:else}
			<span>
				<slot />
			</span>
		{/if}
		{#if icon}
			<ExternalLink size={16} class="mt-0.5" />
		{/if}
	</span>
</a>
