<script lang="ts">
	import type { EmojiClickEvent } from 'emoji-picker-element/shared';
	import type { Attachment } from 'svelte/attachments';

	interface Props {
		selected?: string | null;
		name?: string;
		onChange?: (emoji: string | null) => void;
	}

	let { selected = $bindable(null), name, onChange }: Props = $props();

	const init: Attachment = (element) => {
		import('emoji-picker-element');
		const picker = document.createElement('emoji-picker');

		const listener = (event: EmojiClickEvent) => {
			const emoji = event.detail.unicode;
			selected = emoji ?? null;
			onChange?.(selected);
		};

		picker.addEventListener('emoji-click', listener);

		element.appendChild(picker);

		return () => {
			picker.removeEventListener('emoji-click', listener);
		};
	};
</script>

<span class="sr-only">Emoji Picker</span>
<div {@attach init}>
	{#if name}
		<input type="hidden" {name} value={selected ?? ''} />
	{/if}
</div>

<style>
	:global(emoji-picker) {
		width: 100%;
		--background: var(--color-card);
		--border-radius: 0.5rem;
		--border-color: transparent;
	}

	@media screen and (max-width: 360px) {
		:global(emoji-picker) {
			--num-columns: 6;
			--category-emoji-size: 1.125rem;
		}
	}
</style>
