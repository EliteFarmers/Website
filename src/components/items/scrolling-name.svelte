<script module lang="ts">
	type OverflowEntry = {
		node: HTMLElement;
		track: HTMLElement | null;
		visible: boolean;
		lastOverflow?: boolean;
		lastDistance?: number;
		lastDuration?: number;
	};

	const targetOwners = new WeakMap<Element, OverflowEntry>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const pending = new Set<OverflowEntry>();
	let resizeObserver: ResizeObserver | undefined;
	let intersectionObserver: IntersectionObserver | undefined;
	let frame = 0;

	function ensureObservers() {
		if (!resizeObserver && typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver((entries) => {
				for (const { target } of entries) {
					const owner = targetOwners.get(target);
					if (owner?.visible) queueMeasurement(owner);
				}
			});
		}
		if (!intersectionObserver && typeof IntersectionObserver !== 'undefined') {
			intersectionObserver = new IntersectionObserver(
				(entries) => {
					for (const { target, isIntersecting } of entries) {
						const owner = targetOwners.get(target);
						if (!owner) continue;
						owner.visible = isIntersecting;
						if (isIntersecting) queueMeasurement(owner);
					}
				},
				{ rootMargin: '200px' }
			);
		}
	}

	function queueMeasurement(entry: OverflowEntry) {
		pending.add(entry);
		if (!frame) frame = requestAnimationFrame(flushMeasurements);
	}

	function flushMeasurements() {
		frame = 0;
		const measurements = [...pending]
			.filter((entry) => entry.visible && entry.node.isConnected)
			.map((entry) => {
				const contentWidth = entry.track?.scrollWidth ?? entry.node.scrollWidth;
				const overflow = contentWidth - entry.node.clientWidth;
				return {
					entry,
					overflowing: overflow > 1,
					distance: Math.min(0, -overflow),
					duration: Math.min(1.4, Math.max(0.75, overflow / 120)),
				};
			});
		pending.clear();

		for (const { entry, overflowing, distance, duration } of measurements) {
			if (entry.lastOverflow !== overflowing) {
				entry.node.classList.toggle('scrolling-name--overflowing', overflowing);
				entry.lastOverflow = overflowing;
			}
			if (entry.lastDistance !== distance) {
				entry.node.style.setProperty('--scrolling-name-scroll-distance', `${distance}px`);
				entry.lastDistance = distance;
			}
			if (entry.lastDuration !== duration) {
				entry.node.style.setProperty('--scrolling-name-scroll-duration', `${duration}s`);
				entry.lastDuration = duration;
			}
		}
	}
</script>

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
		const entry: OverflowEntry = { node, track, visible: !('IntersectionObserver' in globalThis) };
		ensureObservers();
		targetOwners.set(node, entry);
		resizeObserver?.observe(node);
		intersectionObserver?.observe(node);
		if (track) {
			targetOwners.set(track, entry);
			resizeObserver?.observe(track);
		}
		if (entry.visible) queueMeasurement(entry);

		return {
			destroy() {
				pending.delete(entry);
				resizeObserver?.unobserve(node);
				intersectionObserver?.unobserve(node);
				if (track) resizeObserver?.unobserve(track);
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
	}

	.scrolling-name--overflowing {
		-webkit-mask-image: linear-gradient(to right, #000 calc(100% - 1.25rem), transparent);
		mask-image: linear-gradient(to right, #000 calc(100% - 1.25rem), transparent);
	}

	.scrolling-name--overflowing:hover .scrolling-name__track,
	.scrolling-name--overflowing:focus-within .scrolling-name__track {
		will-change: transform;
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
