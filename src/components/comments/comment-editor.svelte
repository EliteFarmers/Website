<script lang="ts">
	import { Button } from '$ui/button';
	import { Textarea } from '$ui/textarea';

	interface Props {
		value?: string;
		placeholder?: string;
		isLoading?: boolean;
		onSubmit?: (content: string) => void;
		onCancel?: () => void;
		isEditing?: boolean;
	}

	let {
		value = '',
		placeholder = 'What are your thoughts?',
		isLoading = false,
		onSubmit,
		onCancel,
		isEditing = false,
	}: Props = $props();

	let content = $state(value);

	function handleSubmit() {
		if (content.trim() && onSubmit) {
			onSubmit(content.trim());
		}
	}

	function handleCancel() {
		content = value || '';
		onCancel?.();
	}
</script>

<div class="flex flex-col gap-2">
	<Textarea bind:value={content} {placeholder} disabled={isLoading} class="min-h-24 resize-none" />

	<div class="flex flex-row justify-start gap-2">
		<Button onclick={handleSubmit} disabled={isLoading || !content.trim() || content === value} size="sm">
			{isEditing ? 'Save' : 'Post'}
		</Button>

		{#if onCancel}
			<Button variant="outline" onclick={handleCancel} disabled={isLoading} size="sm">Cancel</Button>
		{/if}
	</div>
</div>
