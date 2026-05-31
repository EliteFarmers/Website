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
			<Dialog.Title>Report {targetType.toLowerCase()}</Dialog.Title>
			<Dialog.Description>
				Reports are manually reviewed. This system will cover more site content later; right now it is used for
				guides and comments.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-3 py-3">
			<div>
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
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => onOpenChange(false)}>Cancel</Button>
			<Button onclick={submit} disabled={isSubmitting || !reason.trim()}>
				{isSubmitting ? 'Submitting...' : 'Submit Report'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
