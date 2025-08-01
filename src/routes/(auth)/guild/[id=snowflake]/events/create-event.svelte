<script lang="ts">
	import { enhance } from '$app/forms';
	import { EventMode, EventType } from '$lib/utils';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import * as Tabs from '$ui/tabs';
	import { Textarea } from '$ui/textarea';

	interface Props {
		open?: boolean;
	}

	let { open = $bindable(false) }: Props = $props();
	let type = $state(EventType.FarmingWeight);
	let teams = $state(EventMode.Solo);
	let disabled = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.ScrollContent>
		<Dialog.Title>Create New Event</Dialog.Title>
		<p class="my-4">
			Events cannot be deleted after being created, be sure that you want to do this. You are able to edit the
			event after creation or while waiting for approval.
		</p>
		<form
			method="post"
			class="mx-1 flex flex-col gap-2"
			use:enhance={() => {
				disabled = true;
				return async ({ result, update }) => {
					disabled = false;
					if (result.type === 'success') open = false;
					update();
				};
			}}
		>
			<div class="space-y-2">
				<Label>Event Name</Label>
				<Input name="title" placeholder="Farming Weight Challenge" maxlength={64} required />
			</div>

			<input type="hidden" name="teams" bind:value={teams} />
			<Tabs.Root bind:value={teams} class="my-4 flex flex-col items-center justify-center">
				<Tabs.List class="gap-2 self-center text-center">
					<Tabs.Trigger value={EventMode.Solo}>Solo Event</Tabs.Trigger>
					<Tabs.Trigger value={EventMode.Teams}>Custom Team Event</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value={EventMode.Solo}>
					<div class="flex flex-col items-center gap-2">
						<p class="text-center">Will create a solo event. (no teams)</p>
					</div>
				</Tabs.Content>
				<Tabs.Content value={EventMode.Teams}>
					<div class="flex flex-col gap-2">
						<p class="text-center">Users will be able to create and join their own teams.</p>

						<div class="space-y-2">
							<Label>Max Team Size</Label>
							<Input name="maxTeamSize" type="number" min="1" max="10" />
						</div>
					</div>
				</Tabs.Content>
			</Tabs.Root>

			<div class="space-y-2">
				<Label>Event Description</Label>
				<Textarea
					name="description"
					placeholder="Farm as much as you can in 24 hours!"
					maxlength={1024}
					required
				/>
			</div>
			<div class="space-y-2">
				<Label>Event Rules</Label>
				<Textarea name="rules" placeholder="No cheating." maxlength={1024} required />
			</div>
			<div class="space-y-2">
				<Label>Event Prizes</Label>
				<Textarea name="prizes" placeholder="First Place: $20 in Gems!" maxlength={1024} />
			</div>
			<div class="mt-4 space-y-2">
				<Label>Event Start Time</Label>
				<Input name="startDate" type="datetime-local" required />
			</div>
			<div class="space-y-2">
				<Label>Event End Time</Label>
				<Input name="endDate" type="datetime-local" required />
			</div>
			<div class="mb-4 space-y-2">
				<Label>Join Until Time</Label>
				<Input name="joinDate" type="datetime-local" />
			</div>

			<input type="hidden" name="type" bind:value={type} />
			<Tabs.Root bind:value={type} class="my-4 flex flex-col items-center justify-center">
				<Tabs.List class="gap-2 self-center text-center">
					<Tabs.Trigger value={EventType.FarmingWeight}>Farming Weight</Tabs.Trigger>
					<Tabs.Trigger value={EventType.Medals}>Medals</Tabs.Trigger>
					<Tabs.Trigger value={EventType.Pests}>Pests</Tabs.Trigger>
					<Tabs.Trigger value={EventType.Collections}>Collections</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value={EventType.FarmingWeight}>
					<div class="flex flex-col items-center gap-2">
						<p class="text-center">Creating a new event for farming weight!</p>
						<!-- <div class="flex flex-col gap-1">
							<div class="flex items-center gap-2">
								<Checkbox name="cropWeights" bind:checked={sendUpdates} />
								<Label for="enableUpdates">Send update messages</Label>
							</div>
						</div> -->
					</div>
				</Tabs.Content>
				<Tabs.Content value={EventType.Medals}>
					<div class="flex flex-col items-center gap-2">
						<p class="text-center">Creating a new event for jacob medals!</p>
					</div>
				</Tabs.Content>
				<Tabs.Content value={EventType.Pests}>
					<div class="flex flex-col items-center gap-2">
						<p class="text-center">Creating a new event for pest kills!</p>
					</div>
				</Tabs.Content>
				<Tabs.Content value={EventType.Collections}>
					<div class="flex flex-col items-center gap-2">
						<p class="text-center">Creating a new event for arbitrary collections!</p>
					</div>
				</Tabs.Content>
			</Tabs.Root>

			<Button formaction="?/create" type="submit" class="mt-8" {disabled}>Create</Button>
			<p class="text-muted-foreground text-base leading-relaxed">
				Having any trouble with this? Please contact "kaeso.dev" on Discord and I'll help you out! Thanks.
			</p>
		</form>
	</Dialog.ScrollContent>
</Dialog.Root>
