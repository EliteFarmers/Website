<script lang="ts">
	import type { Menubar as MenubarPrimitive } from 'bits-ui';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import * as Menubar from './index';

	interface Props extends MenubarPrimitive.ItemProps {
		href: HTMLAnchorAttributes['href'];
	}

	let { href, children, ...rest }: Props = $props();
</script>

<Menubar.Item {...rest}>
	<a {href} class="size-full">
		{@render children?.()}
	</a>
</Menubar.Item>
