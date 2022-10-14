<script lang="ts">
	let show = false;

	const on = (e: MouseEvent) => {
		show = true;
		// move(e);
	};
	const off = () => (show = false);

	function move(e: MouseEvent) {
		const tooltip = e.target as HTMLElement;
		if (!tooltip) return;

		// Move the tooltip to ensure it's always fully on screen
		const { clientWidth, clientHeight } = tooltip;
		const { clientX, clientY } = e;
		const { innerWidth, innerHeight } = window;

		console.log({ clientWidth }, { clientHeight }, { clientX }, { clientY }, { innerWidth }, { innerHeight });

		// If the tooltip is too wide, move it to the left
		if (clientX + clientWidth > innerWidth) {
			tooltip.style.left = `${clientX - clientWidth}px`;
		} else {
			tooltip.style.left = `${clientX}px`;
		}

		// If the tooltip is too tall, move it up
		if (clientY + clientHeight > innerHeight) {
			tooltip.style.top = `${clientY - clientHeight}px`;
		} else {
			tooltip.style.top = `${clientY}px`;
		}

		// If the tooltip is too tall and too wide, move it up and to the left
		if (clientX + clientWidth > innerWidth && clientY + clientHeight > innerHeight) {
			tooltip.style.top = `${clientY - clientHeight}px`;
			tooltip.style.left = `${clientX - clientWidth}px`;
		}
	}
</script>

<div class="dropdown absolute" on:mouseenter={on} on:mouseleave={off} on:mousedown={on}>
	<div class="z-10" hidden={!show}>
		<div class="bg-gray-300 rounded-lg text-body p-3 top-2">
			<slot />
		</div>
	</div>
</div>

<style lang="postcss">
	.dropdown {
		@apply absolute top-0 left-0 min-h-full min-w-full z-10;
	}

	.dropdown > * {
		@apply relative;
	}
</style>
