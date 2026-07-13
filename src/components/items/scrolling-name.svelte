<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		class?: string;
		children?: Snippet;
	}

	let { title = undefined, class: className, children }: Props = $props();

	function trackOverflow(node: HTMLElement) {
		const track = node.firstElementChild as HTMLElement | null;
		const update = () => {
			const contentWidth = track?.scrollWidth ?? node.scrollWidth;
			const overflow = contentWidth - node.clientWidth;
			const duration = Math.min(1.4, Math.max(0.75, overflow / 120));

			node.classList.toggle('scrolling-name--overflowing', overflow > 1);
			node.style.setProperty('--scrolling-name-scroll-distance', `${Math.min(0, -overflow)}px`);
			node.style.setProperty('--scrolling-name-scroll-duration', `${duration}s`);
		};

		const resizeObserver = new ResizeObserver(update);
		resizeObserver.observe(node);

		if (track) {
			resizeObserver.observe(track);
		}

		requestAnimationFrame(update);

		return {
			destroy() {
				resizeObserver.disconnect();
			},
		};
	}
</script>

<span use:trackOverflow class={cn('scrolling-name', className)} {title}>
	<span class="scrolling-name__track">
		{@render children?.()}
	</span>
</span>

<style>
	.scrolling-name {
		display: inline-block;
		width: fit-content;
		max-width: 100%;
		overflow: hidden;
		vertical-align: bottom;
	}

	.scrolling-name__track {
		display: inline-block;
		min-width: max-content;
		white-space: nowrap;
		will-change: transform;
	}

	.scrolling-name--overflowing {
		-webkit-mask-image: linear-gradient(to right, #000 calc(100% - 1.25rem), transparent);
		mask-image: linear-gradient(to right, #000 calc(100% - 1.25rem), transparent);
	}

	.scrolling-name--overflowing:hover .scrolling-name__track,
	.scrolling-name--overflowing:focus-within .scrolling-name__track {
		animation: scrolling-name-scroll var(--scrolling-name-scroll-duration, 1.25s) ease-in-out infinite alternate;
	}

	@keyframes scrolling-name-scroll {
		to {
			transform: translateX(var(--scrolling-name-scroll-distance, 0px));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scrolling-name--overflowing:hover .scrolling-name__track,
		.scrolling-name--overflowing:focus-within .scrolling-name__track {
			animation: none;
		}
	}
</style>
