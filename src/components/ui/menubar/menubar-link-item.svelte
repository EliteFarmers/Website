<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import * as Menubar from "./index";
	import type { Menubar as MenubarPrimitive } from "bits-ui";

	interface Props extends MenubarPrimitive.ItemProps {
		href: HTMLAnchorAttributes["href"];
	}

  	let { href, children, ...rest }: Props = $props();
</script>

<Menubar.Item {...rest}>
	<a {href} class="size-full">
		{@render children?.()}
	</a>
</Menubar.Item>
