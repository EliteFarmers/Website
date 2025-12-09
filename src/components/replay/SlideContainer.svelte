<script lang="ts">
	import { getRecapContext } from '$lib/stores/recap.svelte';
	import { onMount, type Snippet } from 'svelte';

	let { children, body }: { children: Snippet; body: Snippet } = $props();

	const context = getRecapContext();

	let currentSlideIndex = $state(0);
	let slides = $state<HTMLElement[]>([]);
	let container: HTMLElement;
	let autoAdvanceEnabled = $state(true);
	let progress = $state(0);
	let timer: NodeJS.Timeout;
	let progressInterval: NodeJS.Timeout;
	let isLoading = $derived(context.loading);

	function startTimer() {
		clearInterval(timer);
		clearInterval(progressInterval);
		progress = 0;

		if (!autoAdvanceEnabled || currentSlideIndex >= slides.length - 1) return;

		const duration = 5000;
		const step = 50;

		timer = setTimeout(() => {
			nextSlide();
		}, duration);

		progressInterval = setInterval(() => {
			progress += (step / duration) * 100;
			if (progress >= 100) progress = 100;
		}, step);
	}

	function nextSlide() {
		if (currentSlideIndex < slides.length - 1) {
			currentSlideIndex++;
			startTimer();
		} else {
			// End of slides
			clearInterval(timer);
			clearInterval(progressInterval);
			progress = 100;
		}
	}

	function prevSlide() {
		if (currentSlideIndex > 0) {
			currentSlideIndex--;
			autoAdvanceEnabled = false; // Cancel auto-progression
			clearInterval(timer);
			clearInterval(progressInterval);
			progress = 0;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (isLoading) return;
		if (event.key === 'ArrowRight' || event.key === ' ') {
			nextSlide();
			autoAdvanceEnabled = false;
			startTimer();
		} else if (event.key === 'ArrowLeft') {
			prevSlide();
		}
	}

	onMount(() => {
		startTimer();
		return () => {
			clearInterval(timer);
			clearInterval(progressInterval);
		};
	});

	$effect(() => {
		if (container && !isLoading) {
			const children = Array.from(container.children).filter((c) => c.tagName === 'DIV') as HTMLElement[];
			// Update local state for progress bar if children count changed (though typically static)
			if (children.length !== slides.length) {
				slides = children;
			}

			children.forEach((child, index) => {
				child.style.transform = `translateX(${(index - currentSlideIndex) * 100}%)`;
				child.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
				child.style.position = 'absolute';
				child.style.top = '0';
				child.style.left = '0';
				child.style.width = '100%';
				child.style.height = '100%';

				if (index !== currentSlideIndex) {
					child.style.transform += ' scale(0.9)';
					child.style.opacity = '0';
					child.style.pointerEvents = 'none'; // Prevent interaction with hidden slides
				} else {
					child.style.opacity = '1';
					child.style.pointerEvents = 'auto';
				}
			});
		}
	});

	function onContainerMount(node: HTMLElement) {
		container = node;
		const children = Array.from(container.children).filter((c) => c.tagName === 'DIV') as HTMLElement[];
		slides = children;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="fixed inset-0 z-50 overflow-hidden bg-black text-white">
	<!-- Story Progress Bar -->
	<div class="absolute top-0 left-0 z-20 flex w-full gap-1 p-2 px-4 pt-4">
		{#each { length: slides.length }, i (i)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="h-1 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/30 transition-all hover:h-1.5"
				onclick={() => {
					currentSlideIndex = i;
					startTimer();
				}}
			>
				<div
					class="h-full bg-white transition-all ease-linear"
					style:width={i < currentSlideIndex || (i === slides.length - 1 && i === currentSlideIndex)
						? '100%'
						: i === currentSlideIndex
							? `${progress}%`
							: '0%'}
					style:transition-duration={i === currentSlideIndex ? '50ms' : '300ms'}
				></div>
			</div>
		{/each}
	</div>

	<!-- Slides Container -->
	<div use:onContainerMount class="relative h-full w-full">
		{@render children()}
	</div>

	{@render body()}

	<!-- Navigation Controls -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="absolute top-0 left-0 z-10 h-full w-1/3 cursor-pointer" onclick={prevSlide}></div>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="absolute top-0 right-0 z-10 h-full w-1/3 cursor-pointer" onclick={nextSlide}></div>
</div>
