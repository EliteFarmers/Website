<script lang="ts">
	import ExternalLinkButton from '$comp/external-link-button.svelte';
	import { env } from '$env/dynamic/public';
	import type { LinkProps } from '../blocks';
	const { PUBLIC_HOST_URL } = env;

	const { children, url }: LinkProps = $props();

	const internal = $derived(url?.startsWith('/') || url?.startsWith('#') || url?.startsWith(PUBLIC_HOST_URL));
	const rel = $derived(!internal ? 'noopener noreferrer' : undefined);
	const target = $derived(!internal ? '_blank' : undefined);
</script>

{#if internal}
	<a href={url} {target} {rel} class="text-link font-medium underline underline-offset-4">
		{@render children?.()}
	</a>
{:else}
	<ExternalLinkButton href={url ?? ''} {target} {rel} class="font-medium break-all underline underline-offset-4">
		{@render children?.()}
	</ExternalLinkButton>
{/if}
