<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { InputEvents } from './index.js';
	import { cn } from '$lib/utils.js';
	import type { Action } from 'svelte/action';

	type $$Props = HTMLInputAttributes;
	type $$Events = InputEvents;

	interface Props {
		class?: $$Props['class'];
		value?: $$Props['value'];
		// Fixed in Svelte 5, but not backported to 4.x.
		readonly?: $$Props['readonly'];
		[key: string]: any
	}

	let { class: className = undefined, value = $bindable(undefined), readonly = undefined, ...rest }: Props = $props();

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
	use:validator={value}
	{...rest}
/>
