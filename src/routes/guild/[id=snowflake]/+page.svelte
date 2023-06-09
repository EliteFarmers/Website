<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	//export let data: PageData;
	//export let form: FormData;
</script>

<form method="POST" action="?/create" class="flex w-full mb-16 justify-center items-center" use:enhance>
	<div class="flex flex-col gap-4 items-center justify-center">
		<div class="grid col-span-1 relative w-full gap-1">
			<label for="name" class="required">Event Name</label>
			<input
				id="name"
				type="text"
				name="event_name"
				class="w-full px-4 py-2 border-2 rounded text-black"
				placeholder="Event Name"
				required={true}
			/>
			<label for="description" class="required">Event Description</label>
			<textarea
				id="description"
				name="event_description"
				class="w-full px-4 py-2 border-2 rounded text-black"
				placeholder="Event Description"
				required={true}
			/>
			<label for="type">Event Type</label>
			<select id="type" name="event_type" class="w-full px-4 py-2 border-2 rounded text-black">
				<option value="jacob" selected>Jacob Leaderboard</option>
				<option value="weightgain">Weight Gain</option>
				<option value="collectiongain">Collection Gain</option>
				<option value="weight">Weight Leaderboard</option>
				<option value="collection">Collection Leaderboard</option>
			</select>
			<div class="flex flex-row gap-2 items-center justify-center">
				<div>
					<label for="start">Start Date/Time</label>
					<input
						id="start"
						type="datetime-local"
						name="start_date"
						class="w-full px-4 py-2 border-2 rounded text-black"
						placeholder=""
					/>
				</div>

				<div class="flex flex-row gap-2">
					<div>
						<label for="year">Skyblock Year</label>
						<input
							id="year"
							type="number"
							min="1"
							max="999"
							name="start_sb_year"
							class="w-full px-4 py-2 border-2 rounded text-black"
							placeholder=""
						/>
					</div>
					<div>
						<label for="month">Skyblock Month</label>
						<select id="month" name="start_sb_month" class="w-full px-4 py-2 border-2 rounded text-black">
							<option value="1" selected>Early Spring</option>
							<option value="2">Spring</option>
							<option value="3">Late Spring</option>
							<option value="4">Early Summer</option>
							<option value="5">Summer</option>
							<option value="6">Late Summer</option>
							<option value="7">Early Autumn</option>
							<option value="8">Autumn</option>
							<option value="9">Late Autumn</option>
							<option value="10">Early Winter</option>
							<option value="11">Winter</option>
							<option value="12">Late Winter</option>
						</select>
					</div>
					<div>
						<label for="day">Skyblock Day</label>
						<input
							id="day"
							type="number"
							min="1"
							max="31"
							name="start_sb_day"
							class="w-full px-4 py-2 border-2 rounded text-black"
							placeholder=""
						/>
					</div>
				</div>
			</div>

			<label for="end">End Date/Time</label>
			<input
				id="end"
				type="datetime-local"
				name="end_date"
				class="w-full px-4 py-2 border-2 rounded text-black"
				placeholder="Event Reward"
			/>

			<!--<span class="text-red-600 text-sm absolute bottom-0 select-none">{form?.error ?? ''}</span>-->
		</div>
		<button
			type="submit"
			class="w-full bg-gray-200 p-3 rounded-md dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600"
		>
			Link Account
		</button>
	</div>
</form>

<style lang="postcss">
	/* Add asterick to label with a required field sibling */
	label.required:after {
		content: ' *';
		color: red;
	}
</style>
