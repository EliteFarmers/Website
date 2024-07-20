<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { InputEvents } from './index.js';
	import { cn } from '$lib/utils.js';
	import type { Action } from 'svelte/action';

	type $$Props = HTMLInputAttributes;
	type $$Events = InputEvents;

	let className: $$Props['class'] = undefined;
	export let value: $$Props['value'] = undefined;
	export { className as class };

	let previousN = value;

	const validator: Action<HTMLInputElement, string> = (node, v) => {
		return {
			update(v) {
				if (!v) {
					value = undefined;
					previousN = 0;
					return;
				}

				if (isNaN(+v)) {
					value = previousN.toString();
					previousN = value;
					return;
				}

				if (node.min && +v < +node.min) {
					value = node.min;
					previousN = value;
					return;
				}

				if (node.max && +v > +node.max) {
					value = node.max;
					previousN = value;
					return;
				}

				value = v;
				previousN = value;
			},
		};
	};

	// Workaround for https://github.com/sveltejs/svelte/issues/9305
	// Fixed in Svelte 5, but not backported to 4.x.
	export let readonly: $$Props['readonly'] = undefined;
</script>

<input
	class={cn(
		'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{readonly}
	bind:value
	type="text"
	inputmode="numeric"
	on:blur
	on:click
	on:focus
	on:focusin
	on:focusout
	on:keydown
	on:keypress
	on:keyup
	on:mouseover
	on:mouseenter
	on:mouseleave
	on:paste
	on:input
	on:change
	on:wheel
	use:validator={value}
	{...$$restProps}
/>
