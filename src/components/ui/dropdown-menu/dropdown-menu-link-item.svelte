<script lang="ts">
	import type { DropdownMenu as DropdownPrimitive } from 'bits-ui';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import * as Dropdown from './index';

	interface Props extends DropdownPrimitive.ItemProps {
		href: HTMLAnchorAttributes['href'];
	}

	let { href, children, ...rest }: Props = $props();
</script>

<Dropdown.Item {...rest}>
	{#snippet child({ props })}
		<a {...props} {href}>
			{@render children?.()}
		</a>
	{/snippet}
</Dropdown.Item>
