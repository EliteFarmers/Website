<script lang="ts">
	import ExternalLinkButton from '$comp/external-link-button.svelte';
	import { env } from '$env/dynamic/public';
	import type { LinkProps } from '../blocks';
	const { PUBLIC_HOST_URL } = env;

	const { children, url }: LinkProps = $props();

	function getSafeUrl(rawUrl: string | undefined) {
		const value = rawUrl?.trim();
		if (!value) return '#';
		if (value.startsWith('/') || value.startsWith('#')) return value;

		try {
			const parsed = new URL(value);
			return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? value : '#';
		} catch {
			return '#';
		}
	}

	const href = $derived(getSafeUrl(url));
	const internal = $derived(
		href.startsWith('/') || href.startsWith('#') || Boolean(PUBLIC_HOST_URL && href.startsWith(PUBLIC_HOST_URL))
	);
	const rel = $derived(!internal ? 'noopener noreferrer' : undefined);
	const target = $derived(!internal ? '_blank' : undefined);
</script>

{#if internal}
	<a {href} {target} {rel} class="text-link font-medium underline underline-offset-4">
		{@render children?.()}
	</a>
{:else}
	<ExternalLinkButton {href} {target} {rel} class="font-medium break-all underline underline-offset-4">
		{@render children?.()}
	</ExternalLinkButton>
{/if}
