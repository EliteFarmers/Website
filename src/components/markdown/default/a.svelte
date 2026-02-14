<script lang="ts">
	import ExternalLinkButton from '$comp/external-link-button.svelte';
	import { env } from '$env/dynamic/public';
	import { type PrimitiveAnchorAttributes, cn } from '$lib/utils.js';
	const { PUBLIC_HOST_URL } = env;

	let { class: className, children, href, ...restProps }: PrimitiveAnchorAttributes = $props();

	const internal = $derived(href?.startsWith('/') || href?.startsWith('#') || href?.startsWith(PUBLIC_HOST_URL));
	const emailLink = $derived(href?.startsWith('mailto:'));
	const rel = $derived(!internal ? 'noopener noreferrer' : undefined);
	const target = $derived(!internal ? '_blank' : undefined);
</script>

{#if emailLink}
	<a {href} class={cn('text-link font-medium underline underline-offset-4', className)} {...restProps}>
		{@render children?.()}
	</a>
{:else if internal}
	<a {href} {target} {rel} class={cn('text-link font-medium underline underline-offset-4', className)} {...restProps}>
		{@render children?.()}
	</a>
{:else}
	<ExternalLinkButton
		href={href ?? ''}
		{target}
		{rel}
		class={cn('font-medium underline underline-offset-4', className)}
		{...restProps}
	>
		{@render children?.()}
	</ExternalLinkButton>
{/if}
