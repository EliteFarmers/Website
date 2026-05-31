<script lang="ts">
	import { createContentReportCommand, type ContentReportTargetType } from '$lib/remote/reports.remote';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Label } from '$ui/label';
	import { Textarea } from '$ui/textarea';

	interface Props {
		open: boolean;
		targetType: ContentReportTargetType;
		targetId: number;
		onOpenChange: (open: boolean) => void;
		onSubmitted?: () => void;
	}

	let { open, targetType, targetId, onOpenChange, onSubmitted }: Props = $props();

	let reason = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state('');

	let targetLabel = $derived(targetType === 'guide' ? 'guide' : 'comment');

	async function submit() {
		if (!reason.trim()) return;
		isSubmitting = true;
		errorMessage = '';

		try {
			const result = await createContentReportCommand({
				targetType,
				targetId,
				reason: reason.trim(),
			});

			if (result.error) {
				errorMessage = result.error;
				return;
			}

			reason = '';
			onSubmitted?.();
			onOpenChange(false);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Report {targetLabel}</Dialog.Title>
			<Dialog.Description>
				Reports are manually reviewed. Please provide as much detail as possible to help our moderators
				understand the issue with this {targetLabel}.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-3 py-3">
			<div class="flex flex-col gap-2">
				<Label for="report-reason">Reason</Label>
				<Textarea
					id="report-reason"
					bind:value={reason}
					rows={5}
					maxlength={1000}
					placeholder="What should moderators review?"
				/>
			</div>
			{#if errorMessage}
				<p class="text-destructive text-sm">{errorMessage}</p>
			{/if}
			<p class="text-muted-foreground text-xs">
				Please note that submitting a report does not guarantee that the content will be removed. If this is
				something you need a response on, <a href="/contact" class="text-link hover:underline">contact us</a>
				with more information.
			</p>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => onOpenChange(false)}>Cancel</Button>
			<Button onclick={submit} disabled={isSubmitting || !reason.trim()}>
				{isSubmitting ? 'Submitting...' : 'Submit Report'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
