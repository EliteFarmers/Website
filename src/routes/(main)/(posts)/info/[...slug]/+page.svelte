<script lang="ts">
	import PostPage from '$comp/posts/post-page.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();
</script>

<PostPage {...data} />
