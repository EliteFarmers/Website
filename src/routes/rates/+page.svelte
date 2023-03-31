<script lang="ts">
	import { Input } from '@smui/textfield';
	import Card from '@smui/card';
	import Fab from '@smui/fab';
	import Paper from '@smui/paper';
	import { Icon } from '@smui/common';
	import { goto } from '$app/navigation';

	let enteredText: string;

	function doSearch() {
		goto(`/optimize/${enteredText}`);
	}

	function handleKeyDown(event: unknown) {
		if ((event as KeyboardEvent).key === 'Enter') {
			doSearch();
		}
	}
</script>

<section class="flex flex-col my-16 items-center">
	<div class="flex flex-col items-center gap-8 mx-8 w-full sm:w-4/5 md:w-3/5 xl:1/2">
		<h1 class="text-3xl">Farming Optimizer</h1>
		<p>View what peak efficiency looks like!</p>
		<div class="flex flex-row items-center align-middle w-5/6 sm:w-4/5 md:w-3/5 xl:1/2">
			<Paper class="flex flex-row flex-1 !p-2 !pt-3" elevation={6}>
				<Icon class="material-icons">search</Icon>
				<Input
				  bind:value={enteredText}
				  on:keydown={handleKeyDown}
				  placeholder="Player Name"
				  class="ml-4"
				/>
			</Paper>
			<Fab
				on:click={doSearch}
				disabled={!enteredText || enteredText === ''}
				color="primary"
				mini
				class="flex flex-shrink-0 m-4 align-middle items-center justify-center h-full"
			  >
				<Icon class="material-icons">arrow_forward</Icon>
			</Fab>
		</div>
	</div>

	<div class="flex flex-col items-center mt-16 mx-8 w-full sm:w-4/5 md:w-3/5 xl:1/2">
		<h2 class="text-2xl">Changelog</h2>

		<ul class="w-5/6 sm:w-4/5 md:w-3/5 xl:1/2">
			<Card class="my-4 p-4 w-full">
				<h3 class="text-xl">{new Date(1679853951000).toLocaleDateString()}</h3>
				<p>Initial release! Contains farming changes on the Alpha server.</p>
			</Card>
		</ul>
	</div>

</section>