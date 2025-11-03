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
		metadata: {
			title: string;
			description: string;
		};
		children: Snippet<[unknown]>;
	};
	let { children, metadata, ...rest }: Props = $props();
</script>

<Head title={metadata.title} description={metadata.description} />

<div class="mt-8 mb-16 flex w-full flex-row items-center justify-center md:mt-16 md:mb-32">
	<div class="mx-2 w-full max-w-4xl sm:mx-4">
		{@render children({ metadata, title: metadata.title, description: metadata.description, ...rest })}
	</div>
</div>
