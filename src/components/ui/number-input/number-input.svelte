<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { Action } from 'svelte/action';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		class?: string;
		value?: number;
		onValueChange?: (value: number | undefined) => void;
	}

	let {
		class: className = undefined,
		value = $bindable(undefined),
		onValueChange = undefined,
		...rest
	}: Props = $props();

	let previousN = value;

	const validator: Action<HTMLInputElement, number | undefined> = (node) => {
		return {
			update(v) {
				if (!v) {
					value = undefined;
					previousN = undefined;
					onValueChange?.(undefined);
					return;
				}

				if (isNaN(+v)) {
					value = previousN;
					return;
				}

				if (node.min && isFinite(+node.min) && +v < +node.min) {
					value = +node.min;
					previousN = value;
					onValueChange?.(value);
					return;
				}

				if (node.max && isFinite(+node.max) && +v > +node.max) {
					value = +node.max;
					previousN = value;
					onValueChange?.(value);
					return;
				}

				value = +v;
				previousN = value;
				onValueChange?.(value);
			},
		};
	};
</script>

<input
	class={cn(
		'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	bind:value
	type="text"
	inputmode="numeric"
	use:validator={value}
	{...rest}
/>
