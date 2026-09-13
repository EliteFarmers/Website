<script lang="ts">
	import type { UserBadgeDto } from '$lib/api';
	import GripHorizontal from '@lucide/svelte/icons/grip-horizontal';
	import { dragHandle } from 'svelte-dnd-action';

	interface Props {
		badge: UserBadgeDto;
		visible: boolean;
		order: number;
		useAltImage: boolean;
		onselect: (id: number, useAltImage: boolean) => void;
	}

	let { badge, visible, order, useAltImage, onselect }: Props = $props();

	const id = $derived(badge.id);
	const defaultImage = $derived(badge.defaultImage ?? badge.image);
</script>

<div class="flex flex-wrap items-center gap-2 p-2">
	<input type="hidden" name="badge.{id}" value={id} />
	<input type="hidden" name="badge.{id}.visible" value={visible ? 'true' : 'false'} />
	<input type="hidden" name="badge.{id}.order" value={order} />
	<input type="hidden" name="badge.{id}.useAltImage" value={useAltImage ? 'true' : 'false'} />
	<div use:dragHandle class="cursor-move rounded-md p-2 pl-2">
		<GripHorizontal size={16} />
	</div>
	{#if badge.altImage?.url}
		<fieldset class="flex shrink-0 gap-1 rounded-lg bg-muted p-0.5">
			<legend class="sr-only">Artwork for {badge.name}</legend>
			{#each [{ label: 'Default', image: defaultImage, value: false }, { label: 'Alt', image: badge.altImage, value: true }] as option (option.label)}
				<label class="relative cursor-pointer" title={option.label}>
					<input
						type="radio"
						class="peer sr-only"
						name="artwork.{id}"
						checked={useAltImage === option.value}
						onchange={() => onselect(id, option.value)}
					/>
					<span
						class="flex size-12 items-center justify-center rounded-md p-1 transition-colors peer-checked:bg-background peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-muted hover:bg-background/50"
					>
						{#if option.image?.url}
							<img src={option.image.url} alt="" class="size-12 object-contain" width="48" height="48" />
						{/if}
						<span class="sr-only">{option.label}</span>
					</span>
				</label>
			{/each}
		</fieldset>
	{:else if defaultImage?.url}
		<img src={defaultImage.url} alt={badge.name} class="size-12 shrink-0 object-contain" width="48" height="48" />
	{/if}
	<p class="min-w-0 flex-1 text-lg wrap-break-word">{badge.name}</p>
</div>
