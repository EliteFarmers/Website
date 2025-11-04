<script lang="ts">
	import { browser } from '$app/environment';
	import { getCountdownParts } from '$lib/format';
	import { cn } from '$lib/utils';
	import NumberFlow, { NumberFlowGroup } from '@number-flow/svelte';
	import { onMount, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		start: number;
		end: number;
		starting?: Snippet;
		ending?: Snippet;
	}

	let { start, end, starting, ending, ...rest }: Props = $props();

	let time = $state(Date.now());
	let ms = $derived.by(() => (start > time ? start - time : end - time));
	let interval: NodeJS.Timeout | undefined;
	let started = $derived(start <= time);

	onMount(() => {
		interval = setInterval(() => {
			time = Date.now();
		}, 500);

		return () => stopInterval();
	});

	function visibilityChange() {
		if (document.hidden) {
			time = Date.now();
			stopInterval();
		} else {
			interval = setInterval(() => {
				time = Date.now();
			}, 500);
		}
	}

	function stopInterval() {
		if (interval) {
			clearInterval(interval);
			interval = undefined;
		}
	}

	let counter = $derived.by(() => getCountdownParts(ms));
</script>

<svelte:document on:visibilitychange={visibilityChange} />

{#if started}
	{@render ending?.()}
{:else}
	{@render starting?.()}
{/if}

{#if browser}
	<NumberFlowGroup>
		<div
			style="font-variant-numeric: tabular-nums; --number-flow-char-height: 0.85em"
			{...rest}
			class={cn('flex w-full flex-row items-center font-mono text-sm', rest.class)}
		>
			<div
				class="flex min-w-4 flex-1 flex-col items-center justify-center gap-1 {counter.days > 0
					? ''
					: 'text-muted'}"
			>
				<div class="">
					<NumberFlow
						trend={-1}
						value={counter.days}
						digits={{ 1: { max: 5 } }}
						format={{ minimumIntegerDigits: 2 }}
					/>
				</div>
				<!-- <span class="text-sm font-normal text-muted-foreground">Days</span> -->
			</div>
			<div
				class="flex min-w-4 flex-1 flex-col items-center justify-center gap-1 {counter.hours <= 0 &&
				counter.days <= 0
					? 'text-muted'
					: ''}"
			>
				<div class="">
					<NumberFlow
						trend={-1}
						digits={{ 1: { max: 2 } }}
						value={counter.hours}
						format={{ minimumIntegerDigits: 2 }}
					/>
				</div>
				<!-- <span class="text-sm font-normal text-muted-foreground">Hours</span> -->
			</div>
			<div
				class="flex min-w-4 flex-1 flex-col items-center justify-center gap-1 {counter.minutes <= 0 &&
				counter.hours <= 0 &&
				counter.days <= 0
					? 'text-muted'
					: ''}"
			>
				<div class="">
					<NumberFlow
						trend={-1}
						value={counter.minutes}
						digits={{ 1: { max: 5 } }}
						format={{ minimumIntegerDigits: 2 }}
					/>
				</div>
				<!-- <span class="text-sm font-normal text-muted-foreground">Minutes</span> -->
			</div>
			<div
				class="flex min-w-4 flex-1 flex-col items-center justify-center gap-1 {counter.seconds <= 0 &&
				counter.minutes <= 0 &&
				counter.hours <= 0 &&
				counter.days <= 0
					? 'text-muted'
					: ''}"
			>
				<div class="">
					<NumberFlow
						trend={-1}
						value={counter.seconds}
						digits={{ 1: { max: 5 } }}
						format={{ minimumIntegerDigits: 2 }}
					/>
				</div>
				<!-- <span class="text-sm font-normal text-muted-foreground">Seconds</span> -->
			</div>
		</div>
	</NumberFlowGroup>
{/if}
