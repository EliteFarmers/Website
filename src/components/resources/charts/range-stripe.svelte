<script lang="ts">
	import { Debounced } from 'runed';

	interface Props {
		points: number;
		start?: number;
		end?: number;
		debouncedStart?: number;
		debouncedEnd?: number;
		minWindow?: number;
		debounceMs?: number;
	}

	let {
		points,
		start = $bindable(0),
		end = $bindable(0),
		debouncedStart = $bindable(0),
		debouncedEnd = $bindable(0),
		minWindow = 12,
		debounceMs = 100,
	}: Props = $props();

	type DragMode = 'none' | 'move' | 'start' | 'end';

	let trackEl = $state<HTMLDivElement | null>(null);
	let dragMode = $state<DragMode>('none');
	let dragPointerId = $state<number | null>(null);
	let dragStartX = $state(0);
	let dragOriginStart = $state(0);
	let dragOriginEnd = $state(0);
	let prevTotalPoints = $state(-1);
	const debouncedRange = new Debounced(() => ({ start, end }), () => debounceMs);

	const totalPoints = $derived(Math.max(0, points));
	const resolvedMinWindow = $derived.by(() => {
		if (totalPoints <= 0) return 0;
		return Math.max(2, Math.min(minWindow, totalPoints));
	});

	const leftPercent = $derived.by(() => (totalPoints > 0 ? (start / totalPoints) * 100 : 0));
	const widthPercent = $derived.by(() => (totalPoints > 0 ? ((end - start) / totalPoints) * 100 : 100));

	$effect(() => {
		if (totalPoints <= 0) {
			start = 0;
			end = 0;
			return;
		}

		const defaultRange = start === 0 && end === 0;
		if (defaultRange) {
			start = 0;
			end = totalPoints;
			return;
		}

		start = clamp(start, 0, totalPoints);
		end = clamp(end, 0, totalPoints);

		if (start > end) {
			const temp = start;
			start = end;
			end = temp;
		}

		if (end - start < resolvedMinWindow) {
			const desiredEnd = start + resolvedMinWindow;
			if (desiredEnd <= totalPoints) {
				end = desiredEnd;
			} else {
				end = totalPoints;
				start = Math.max(0, end - resolvedMinWindow);
			}
		}
	});

	$effect(() => {
		return () => {
			stopDrag();
			debouncedRange.cancel();
		};
	});

	$effect(() => {
		const current = debouncedRange.current;
		debouncedStart = current.start;
		debouncedEnd = current.end;
	});

	$effect(() => {
		if (totalPoints !== prevTotalPoints) {
			prevTotalPoints = totalPoints;
			debouncedRange.setImmediately({ start, end });
			debouncedStart = start;
			debouncedEnd = end;
		}
	});

	function clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, value));
	}

	function beginDrag(event: PointerEvent, mode: DragMode) {
		if (!trackEl || totalPoints <= 0) return;

		dragMode = mode;
		dragPointerId = event.pointerId;
		dragStartX = event.clientX;
		dragOriginStart = start;
		dragOriginEnd = end;

		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerUp);
	}

	function stopDrag() {
		dragMode = 'none';
		dragPointerId = null;
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', onPointerUp);
		window.removeEventListener('pointercancel', onPointerUp);
	}

	function onPointerMove(event: PointerEvent) {
		if (!trackEl || dragMode === 'none' || dragPointerId !== event.pointerId) return;

		const rect = trackEl.getBoundingClientRect();
		if (rect.width <= 0) return;

		const deltaRatio = (event.clientX - dragStartX) / rect.width;
		const deltaPoints = Math.round(deltaRatio * totalPoints);

		if (dragMode === 'move') {
			const windowSize = Math.max(resolvedMinWindow, dragOriginEnd - dragOriginStart);
			const maxStart = Math.max(0, totalPoints - windowSize);
			const nextStart = clamp(dragOriginStart + deltaPoints, 0, maxStart);
			start = nextStart;
			end = nextStart + windowSize;
			return;
		}

		if (dragMode === 'start') {
			const maxStart = Math.max(0, dragOriginEnd - resolvedMinWindow);
			start = clamp(dragOriginStart + deltaPoints, 0, maxStart);
			return;
		}

		const minEnd = Math.min(totalPoints, dragOriginStart + resolvedMinWindow);
		end = clamp(dragOriginEnd + deltaPoints, minEnd, totalPoints);
	}

	function onPointerUp(event: PointerEvent) {
		if (dragPointerId !== event.pointerId) return;
		stopDrag();
	}

	function onTrackPointerDown(event: PointerEvent) {
		if (!trackEl || totalPoints <= 0) return;

		const rect = trackEl.getBoundingClientRect();
		if (rect.width <= 0) return;

		const windowSize = Math.max(resolvedMinWindow, end - start);
		const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
		const center = Math.round(ratio * totalPoints);

		let nextStart = center - Math.floor(windowSize / 2);
		nextStart = clamp(nextStart, 0, Math.max(0, totalPoints - windowSize));

		start = nextStart;
		end = nextStart + windowSize;
		beginDrag(event, 'move');
	}

	function onTrackKeyDown(event: KeyboardEvent) {
		if (totalPoints <= 0) return;

		const step = event.shiftKey ? Math.max(5, Math.round(totalPoints * 0.05)) : 1;
		const windowSize = Math.max(resolvedMinWindow, end - start);
		const maxStart = Math.max(0, totalPoints - windowSize);

		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			const nextStart = clamp(start - step, 0, maxStart);
			start = nextStart;
			end = nextStart + windowSize;
			return;
		}

		if (event.key === 'ArrowRight') {
			event.preventDefault();
			const nextStart = clamp(start + step, 0, maxStart);
			start = nextStart;
			end = nextStart + windowSize;
			return;
		}

		if (event.key === 'Home') {
			event.preventDefault();
			start = 0;
			end = windowSize;
			return;
		}

		if (event.key === 'End') {
			event.preventDefault();
			start = maxStart;
			end = maxStart + windowSize;
		}
	}
</script>

<div class="mt-3 w-full space-y-2">
	<div
		bind:this={trackEl}
		class="relative h-8 w-full touch-none select-none"
		onpointerdown={onTrackPointerDown}
		onkeydown={onTrackKeyDown}
		role="slider"
		tabindex="0"
		aria-label="Chart range window"
		aria-valuemin={1}
		aria-valuemax={Math.max(1, totalPoints)}
		aria-valuenow={Math.max(1, Math.round((start + end) / 2))}
	>
		<div class="bg-muted absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full"></div>

		<div
			class="bg-primary/30 absolute top-1/2 h-2 -translate-y-1/2 cursor-grab rounded-full active:cursor-grabbing"
			style={`left:${leftPercent}%; width:${Math.max(widthPercent, 0.6)}%;`}
			onpointerdown={(event: PointerEvent) => {
				event.stopPropagation();
				beginDrag(event, 'move');
			}}
			aria-hidden="true"
		></div>

		<button
			type="button"
			class="bg-background border-border absolute top-1/2 h-5 w-3 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded border"
			style={`left:${leftPercent}%;`}
			onpointerdown={(event: PointerEvent) => {
				event.stopPropagation();
				beginDrag(event, 'start');
			}}
			aria-label="Adjust range start"
		></button>
		<button
			type="button"
			class="bg-background border-border absolute top-1/2 h-5 w-3 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded border"
			style={`left:${leftPercent + widthPercent}%;`}
			onpointerdown={(event: PointerEvent) => {
				event.stopPropagation();
				beginDrag(event, 'end');
			}}
			aria-label="Adjust range end"
		></button>
	</div>

	<div class="text-muted-foreground flex justify-between text-xs">
		<span>1</span>
		<span>{Math.max(0, start + 1)}-{end}</span>
		<span>{totalPoints}</span>
	</div>
</div>
