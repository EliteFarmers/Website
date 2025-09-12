<script module>
	import Head from '$comp/head.svelte';
	import type { Snippet } from 'svelte';
	export {
		a,
		blockquote,
		h1,
		h2,
		h3,
		h4,
		h5,
		h6,
		hr,
		img,
		li,
		ol,
		p,
		pre,
		table,
		td,
		th,
		tr,
		ul,
	} from '../default/index.js';
</script>

<script lang="ts">
	type Props = {
		title: string;
		description: string;
		source: string;
		component: string;
		radix: string;
		children: Snippet<[unknown]>;
	};
	let { title, description, source, component, radix, children }: Props = $props();
</script>

<Head {title} {description} />

{@render children({ title, description, source, component, radix })}
