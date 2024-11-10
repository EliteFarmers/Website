<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import * as Dropdown from "./index";
	import type { DropdownMenu as DropdownPrimitive } from "bits-ui";

	interface Props extends DropdownPrimitive.ItemProps {
		href: HTMLAnchorAttributes["href"];
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
