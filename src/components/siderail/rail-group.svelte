<script lang="ts">
	let { children } = $props();
</script>

<div class="flex flex-col items-start gap-2">
	{@render children?.()}
</div>
