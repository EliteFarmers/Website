<script lang="ts" module>
	export interface HoistTarget {
		id: string;
		label: string;
	}
</script>

<script lang="ts">
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';

	interface Props {
		open: boolean;
		targets: HoistTarget[];
		initialTarget?: string | null;
		onOpenChange: (open: boolean) => void;
		onSubmit: (targetId: string) => void;
	}

	let { open, targets, initialTarget, onOpenChange, onSubmit }: Props = $props();

	let selectedTarget = $state('');

	$effect(() => {
		selectedTarget = initialTarget || targets[0]?.id || '';
	});

	function submit() {
		if (!selectedTarget) return;
		onSubmit(selectedTarget);
		onOpenChange(false);
	}
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Hoist Comment</Dialog.Title>
			<Dialog.Description>Choose where this correction should appear in the guide.</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-2 py-3">
			<Label>Guide section</Label>
			<Select.Root type="single" bind:value={selectedTarget}>
				<Select.Trigger class="w-full">
					{targets.find((target) => target.id === selectedTarget)?.label || 'Select section'}
				</Select.Trigger>
				<Select.Content>
					{#each targets as target (target.id)}
						<Select.Item value={target.id}>{target.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => onOpenChange(false)}>Cancel</Button>
			<Button onclick={submit} disabled={!selectedTarget}>Hoist</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
