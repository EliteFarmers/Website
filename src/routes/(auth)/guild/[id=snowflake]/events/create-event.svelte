<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Textarea } from '$ui/textarea';
	import * as Dialog from '$ui/dialog';
	import * as Tabs from '$ui/tabs';
	import { EventType } from '$lib/utils';

	export let open = false;
	let type = EventType.FarmingWeight;
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="overflow-scroll max-h-[80%]">
		<Dialog.Title>Create New Event</Dialog.Title>
		<p>Events cannot be deleted after being created (right now), be sure that you want to do this.</p>
		<form
			method="post"
			class="flex flex-col gap-2"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result) open = false;
					update();
				};
			}}
		>
			<div class="space-y-2">
				<Label>Event Name</Label>
				<Input name="title" placeholder="Farming Weight Challenge" maxlength={64} />
			</div>
			<div class="space-y-2">
				<Label>Event Description</Label>
				<Textarea name="description" placeholder="Farm as much as you can in 24 hours!" maxlength={1024} />
			</div>
			<div class="space-y-2">
				<Label>Event Rules</Label>
				<Textarea name="rules" placeholder="No cheating." maxlength={1024} />
			</div>
			<div class="space-y-2">
				<Label>Event Prizes</Label>
				<Textarea name="prizes" placeholder="First Place: $20 in Gems!" maxlength={1024} />
			</div>
			<div class="space-y-2 mt-4">
				<Label>Event Start Time</Label>
				<Input name="startDate" type="datetime-local" />
			</div>
			<div class="space-y-2">
				<Label>Event End Time</Label>
				<Input name="endDate" type="datetime-local" />
			</div>
			<div class="space-y-2 mb-4">
				<Label>Join Until Time</Label>
				<Input name="joinDate" type="datetime-local" />
			</div>

			<input type="hidden" name="type" bind:value={type} />

			<Tabs.Root bind:value={type} class="flex flex-col justify-center my-4 items-center">
				<Tabs.List class="gap-2 self-center text-center">
					<Tabs.Trigger value={EventType.FarmingWeight}>Farming Weight</Tabs.Trigger>
					<Tabs.Trigger value={EventType.Medals}>Medals</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value={EventType.FarmingWeight}>
					<div class="flex flex-col gap-2 items-center">
						<p class="text-center">Creating a new event for farming weight.</p>
						<!-- <div class="flex flex-col gap-1">
							<div class="flex items-center gap-2">
								<Checkbox name="cropWeights" bind:checked={sendUpdates} />
								<Label for="enableUpdates">Send update messages</Label>
							</div>
						</div> -->

						<Button formaction="?/create" type="submit" class="mt-8">Create</Button>
					</div>
				</Tabs.Content>
				<Tabs.Content value={EventType.Medals}>
					<div class="flex flex-col gap-2 items-center">
						<p class="text-center">Creating a new event for medals.</p>

						<Button formaction="?/create" type="submit" class="mt-8">Create</Button>
					</div>
				</Tabs.Content>
			</Tabs.Root>

			<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
				Having any trouble with this? Please contact "kaeso.dev" on Discord and I'll help you out! Thanks.
			</p>
		</form>
	</Dialog.Content>
</Dialog.Root>
