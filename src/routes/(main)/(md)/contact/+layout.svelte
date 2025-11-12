<script lang="ts">
	import RenderHtml from '$comp/markdown/render-html.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<div class="mt-8 mb-16 flex w-full flex-row items-center justify-center md:mt-16 md:mb-32">
	<div class="mx-2 w-full max-w-4xl sm:mx-4">
		{@render children?.()}
		<RenderHtml content={data.contact} />
	</div>
</div>
