<script lang="ts">
	import { Button } from '$ui/button';
	import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
	import { X } from '@lucide/svelte';
	import { watch } from 'runed';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import { getWalkthroughContext } from './ctx';

	let {
		targetId,
		placement = 'bottom',
		onUpdateRect,
		contentSnippet,
		padding = 0,
	}: {
		targetId: string;
		placement?: 'top' | 'bottom' | 'left' | 'right';
		onUpdateRect: (rect: { top: number; left: number; width: number; height: number }) => void;
		contentSnippet?: Snippet<[unknown]>;
		padding?: number;
	} = $props();

	const ctx = getWalkthroughContext();

	let tooltipEl = $state<HTMLElement | undefined>(undefined);
	let arrowEl = $state<HTMLElement | undefined>(undefined);

	let actualPlacement = $state<'top' | 'bottom' | 'left' | 'right'>('bottom');

	function mountTooltip(element: HTMLElement) {
		tooltipEl = element;
		document.body.appendChild(element);
		return () => {
			if (tooltipEl === element) {
				tooltipEl = undefined;
			}
			if (element.parentNode) {
				element.parentNode.removeChild(element);
			}
		};
	}

	function mountArrow(element: HTMLElement) {
		arrowEl = element;
		return () => {
			if (arrowEl === element) {
				arrowEl = undefined;
			}
		};
	}

	watch(
		[() => tooltipEl, () => arrowEl, () => targetId, () => placement, () => padding],
		([currentTooltip, currentArrow, currentTargetId, currentPlacement, currentPadding]) => {
			if (!currentTooltip || !currentTargetId) return;
			const targetEl = document.getElementById(currentTargetId);
			if (!targetEl) return;

			const applySpotlight = () => {
				const rect = targetEl.getBoundingClientRect();
				onUpdateRect({
					top: rect.top - currentPadding,
					left: rect.left - currentPadding,
					width: rect.width + currentPadding * 2,
					height: rect.height + currentPadding * 2,
				});
			};

			const middleware = [
				offset(12),
				flip({ padding: 12 }),
				shift({ padding: 12, crossAxis: true }),
			] as ReturnType<typeof offset>[];
			if (currentArrow) middleware.push(arrow({ element: currentArrow }));

			applySpotlight();

			const rect = targetEl.getBoundingClientRect();
			const isVisible =
				rect.top >= 0 &&
				rect.left >= 0 &&
				rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
				rect.right <= (window.innerWidth || document.documentElement.clientWidth);

			if (!isVisible) {
				targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}

			const stop = autoUpdate(targetEl, currentTooltip, () => {
				applySpotlight();

				computePosition(targetEl, currentTooltip, {
					placement: currentPlacement,
					middleware,
					strategy: 'fixed',
				}).then(({ x, y, placement: finalPlacement, middlewareData }) => {
					Object.assign(currentTooltip.style, {
						left: `${x}px`,
						top: `${y}px`,
						position: 'fixed',
						display: 'block',
					});

					actualPlacement = finalPlacement.split('-')[0] as 'top' | 'bottom' | 'left' | 'right';

					if (currentArrow && middlewareData.arrow) {
						const { x: arrowX, y: arrowY } = middlewareData.arrow;
						const staticSide = {
							top: 'bottom',
							right: 'left',
							bottom: 'top',
							left: 'right',
						}[finalPlacement.split('-')[0]];

						Object.assign(currentArrow.style, {
							left: arrowX != null ? `${arrowX}px` : '',
							top: arrowY != null ? `${arrowY}px` : '',
							right: '',
							bottom: '',
							[staticSide as string]: '-4px',
						});
					}
				});
			});

			return () => stop();
		}
	);

	let arrowClasses = $derived.by(() => {
		const side = actualPlacement.split('-')[0];
		const base = 'absolute h-2 w-2 rotate-45 bg-popover';
		if (side === 'top') return `${base} border-b border-r`;
		if (side === 'bottom') return `${base} border-t border-l`;
		if (side === 'left') return `${base} border-t border-r`;
		if (side === 'right') return `${base} border-b border-l`;
		return `${base} border-t border-l`;
	});
</script>

<div
	{@attach mountTooltip}
	role="dialog"
	class="fixed top-0 left-0 z-9999 w-max max-w-[calc(100vw-0.75rem)] outline-none"
	transition:fade={{ duration: 200 }}
>
	{#if contentSnippet}
		{@render contentSnippet(ctx)}
	{:else}
		<div class="bg-popover text-popover-foreground relative w-87.5 rounded-lg border shadow-xl">
			<div {@attach mountArrow} class={arrowClasses}></div>

			<div class="p-4">
				<div class="flex items-start justify-between gap-4">
					<div class="space-y-1">
						<h4 class="leading-none font-semibold">{ctx.currentStep()?.title}</h4>
						<p class="text-muted-foreground text-sm">{ctx.currentStep()?.description}</p>
					</div>
					<Button variant="ghost" size="icon" class="-mt-1 -mr-2 h-6 w-6 shrink-0" onclick={ctx.close}>
						<X class="h-4 w-4" />
					</Button>
				</div>
				<div class="flex items-center justify-between pt-4">
					<span class="text-muted-foreground text-xs">
						Step {ctx.currentStepIndex() + 1}
					</span>
					<div class="flex gap-2">
						{#if ctx.currentStepIndex() > 0}
							<Button variant="outline" size="sm" onclick={ctx.prev}>Back</Button>
						{/if}
						<Button size="sm" onclick={ctx.next}>
							{ctx.isLastStep() ? 'Finish' : 'Next'}
						</Button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
