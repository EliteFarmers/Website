<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setWalkthroughContext, type Step } from './ctx';
	import WalkthroughContent from './walkthrough-content.svelte';
	import WalkthroughSpotlight from './walkthrough-spotlight.svelte';

	let {
		steps = [],
		open = $bindable(false),
		onComplete,
		children,
		padding,
	}: {
		steps: Step[];
		open: boolean;
		onComplete?: () => void;
		children?: Snippet<[unknown]>;
		padding?: number;
	} = $props();

	let currentStepIndex = $state(0);
	let highlightRect = $state({ top: 0, left: 0, width: 0, height: 0 });

	const isLastStep = $derived(currentStepIndex === steps.length - 1);
	const currentStep = $derived(steps[currentStepIndex]);

	function next() {
		if (!isLastStep) currentStepIndex++;
		else finish();
	}

	function prev() {
		if (currentStepIndex > 0) currentStepIndex--;
	}

	function finish() {
		open = false;
		setTimeout(() => {
			currentStepIndex = 0;
			if (onComplete) onComplete();
		}, 300);
	}

	setWalkthroughContext({
		isOpen: () => open,
		currentStepIndex: () => currentStepIndex,
		currentStep: () => currentStep,
		isLastStep: () => isLastStep,
		next,
		prev,
		close: () => (open = false),
	});
</script>

<WalkthroughSpotlight
	{open}
	top={highlightRect.top}
	left={highlightRect.left}
	width={highlightRect.width}
	height={highlightRect.height}
/>

{#if open && currentStep}
	<WalkthroughContent
		targetId={currentStep.target}
		placement={currentStep.position}
		onUpdateRect={(rect) => (highlightRect = rect)}
		contentSnippet={children}
		{padding}
	/>
{/if}
