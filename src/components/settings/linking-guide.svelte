<script lang="ts">
	import Button from '$ui/button/button.svelte';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import { onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';

	interface Props {
		username: string;
	}

	let { username }: Props = $props();

	const steps = [
		{ id: 0, img: '/images/linking/step1.png', cursor: { x: 50, y: 50, hidden: true }, delay: 500 },
		{
			id: 1,
			img: '/images/linking/step1.png',
			cursor: { x: 50, y: 37, hidden: true },
			delay: 700,
			zoom: 2,
			origin: { x: 50, y: 100 },
		},
		{
			id: 2,
			img: '/images/linking/step2.png',
			cursor: { x: 48, y: 37 },
			zoom: 2.8,
			origin: { x: 50, y: 38 },
		},
		{
			id: 3,
			img: '/images/linking/step3.png',
			cursor: { x: 48, y: 37 },
			delay: 500,
			zoom: 2.8,
			origin: { x: 50, y: 38 },
		},
		{
			id: 4,
			img: '/images/linking/step4.png',
			cursor: { x: 56, y: 42 },
			zoom: 2.8,
			origin: { x: 50, y: 38 },
		},
		{
			id: 5,
			img: '/images/linking/step5.png',
			cursor: { x: 56, y: 42 },
			delay: 500,
			zoom: 2.8,
			origin: { x: 50, y: 38 },
		},
		{
			id: 6,
			img: '/images/linking/step6.png',
			cursor: { x: 50, y: 50, hidden: true },
			delay: 300,
			zoom: 2,
			origin: { x: 0, y: 100 },
		},
		{
			id: 7,
			img: '/images/linking/step7.png',
			cursor: { x: 50, y: 50, hidden: true },
			zoom: 4,
			origin: { x: 0, y: 100 },
			delay: 2000,
		},
		{
			id: 8,
			img: '/images/linking/step8.png',
			cursor: { x: 50, y: 50, hidden: true },
			zoom: 2.3,
			origin: { x: 0, y: 100 },
		},
	];

	let currentStep = $state(0);
	let previousStep = $state(0);

	// Preload all images
	if (typeof window !== 'undefined') {
		steps.forEach((step) => {
			const img = new Image();
			img.src = step.img;
		});
	}

	const cursor = new Tween(
		{ x: 50, y: 50 },
		{
			duration: 800,
			easing: cubicOut,
		}
	);

	const zoom = new Tween(1, {
		duration: 800,
		easing: cubicOut,
	});

	const origin = new Tween(
		{ x: 50, y: 50 },
		{
			duration: 800,
			easing: cubicOut,
		}
	);

	let displayedText = $state('');

	async function playSequence() {
		for (let i = 0; i < steps.length; i++) {
			previousStep = currentStep;
			currentStep = i;

			const step = steps[i];
			// Move cursor to step position
			await Promise.all([
				cursor.set({ x: step.cursor.x, y: step.cursor.y }),
				zoom.set(step.zoom ?? 1),
				origin.set(step.origin ?? { x: 50, y: 50 }),
			]);

			if (i === steps.length - 2) {
				for (let i = 0; i <= username.length; i++) {
					displayedText = username.slice(0, i);
					await new Promise((r) => setTimeout(r, 100));
				}
			}

			// Wait for step delay if it exists
			if (step.delay) {
				await new Promise((r) => setTimeout(r, step.delay));
			}
		}
	}

	onMount(() => {
		playSequence();
	});
</script>

<div class="@container relative aspect-video w-full max-w-2xl overflow-hidden rounded-lg">
	<div
		class="@container size-full"
		style="transform: scale({zoom.current}); transform-origin: {origin.current.x}% {origin.current.y}%;"
	>
		{#each steps as step (step.id)}
			<img
				src={step.img}
				alt="Game UI"
				class="absolute inset-0 h-full w-full object-cover transition-opacity duration-100"
				class:opacity-0={currentStep !== step.id && previousStep !== step.id}
				style="z-index: {currentStep === step.id ? 2 : previousStep === step.id ? 1 : 0};"
			/>
		{/each}

		<img
			src="/images/linking/cursor.png"
			alt="Cursor"
			class="pointer-events-none absolute z-10 drop-shadow-lg"
			style="height: 3cqw; left: {cursor.current.x}%; top: {cursor.current.y}%;{steps[currentStep].cursor.hidden
				? ' display: none;'
				: ''}"
		/>

		{#if currentStep === steps.length - 1}
			<div
				class="absolute bottom-[6.75cqw] left-[27.7%] z-10 font-mono text-[1.4cqw] leading-0 text-[#f8a600] @lg:bottom-[6.9cqw]"
			>
				{username}<span class="text-[#54fc54]">!</span>
			</div>
		{/if}
	</div>
	{#if currentStep === steps.length - 2}
		<div class="absolute bottom-[5.5cqw] left-[2.2%] font-mono text-[5cqw] leading-0 text-white">
			{displayedText}<span class="animate-pulse">_</span>
		</div>
	{/if}

	{#if currentStep === steps.length - 1}
		<div
			class="absolute top-0 right-0 bottom-0 left-0 size-full bg-linear-to-b from-black to-transparent opacity-50"
		></div>
		<div class="absolute top-0 right-0 left-0 flex w-full flex-row items-center justify-between gap-1 p-2">
			<p class="text-left text-sm text-white">
				You may have to wait a few minutes for the changes to take effect here!
			</p>
			<Button
				variant="outline"
				onclick={() => {
					currentStep = 0;
					previousStep = 0;
					displayedText = '';
					playSequence();
				}}
			>
				<RotateCw class="size-4" />
				Replay
			</Button>
		</div>
	{/if}
</div>
