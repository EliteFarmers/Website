<script lang="ts">
	import Head from '$comp/head.svelte';
	import RenderHtml from '$comp/markdown/render-html.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<Head title="Contact Us" description="Get in touch with us for any inquiries, support, or feedback." />

<div class="mt-8 mb-16 flex w-full flex-row items-center justify-center md:mt-16 md:mb-32">
	<div class="mx-2 w-full max-w-4xl sm:mx-4">
		{@render children?.()}
		<RenderHtml content={data.contact} />
	</div>
</div>
