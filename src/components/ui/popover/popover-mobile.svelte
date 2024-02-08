<script lang="ts">
	import { Root, Trigger, Content } from '$ui/popover';

	let timeout: ReturnType<typeof setTimeout>;

	function mouseEnter() {
		open = true;
		mousePresent = true;
		clearTimeout(timeout);
	}

	let mousePresent = false;

	function mouseLeave() {
		mousePresent = false;
		timeout = setTimeout(() => {
			if (!mousePresent) {
				open = false;
			}
		}, 500);
	}

	export let open = false;
	export let hasContent = true;
</script>

<Root bind:open closeOnOutsideClick={false}>
	<div on:mouseenter={mouseEnter} on:mouseleave={mouseLeave} role="contentinfo">
		<Trigger>
			<slot name="trigger" />
		</Trigger>
	</div>
	{#if hasContent}
		<Content class="p-2 min-w-fit">
			<div on:mouseenter={mouseEnter} on:mouseleave={mouseLeave} role="contentinfo">
				<slot />
			</div>
		</Content>
	{/if}
</Root>
