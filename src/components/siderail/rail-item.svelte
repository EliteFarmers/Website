<script lang="ts">
	import { cn } from '$lib/utils';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		img: string;
		href: string;
		name: string;
		class?: string;
		imgClass?: string;
		absolute?: Snippet;
	}

	let { img, name, href, class: className = '', absolute, imgClass, ...rest }: Props = $props();
</script>

<a
	class={cn('group bg-card shadow-primary inline-block max-w-48 rounded-lg border-2 hover:drop-shadow-lg', className)}
	{href}
	{...rest}
>
	<div class="flex min-h-12 w-full min-w-0 flex-col justify-start">
		<div class="@container-normal relative grid min-h-12 w-full items-center justify-center rounded-md">
			<img src={img} alt={name} class={cn('h-12 w-48 rounded-t-md object-cover', imgClass)} />
			{@render absolute?.()}
		</div>
		<div class="relative flex w-full flex-row items-center justify-between p-2 text-sm font-semibold">
			<p class="inline-block max-w-48 flex-1 truncate px-2">{name}</p>

			<div class="text-muted-foreground group-hover:animate-bounce-horizontal pr-1">
				<ArrowRight size={18} />
			</div>
		</div>
	</div>
</a>
