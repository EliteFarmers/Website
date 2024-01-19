<script lang="ts">
	import Head from '$comp/head.svelte';
	import Plan from './plan.svelte';

	import { Card } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { error } from '@sveltejs/kit';
	import type { PremiumStatus } from '$lib/discord';
	//export let data: PageData;

	onMount(() => {
		error(404, 'This page is currently under construction!');
	});

	const premium = 'none' as PremiumStatus; //data.premium;
</script>

<Head
	title="Elite Plans"
	description="View the various plans to bring enhanced functionality into your discord servers!"
/>

<section class="flex flex-col justify-center align-middle items-center pb-16">
	<h1 class="text-3xl my-16">Elite Plans</h1>
	<p>View the various plans to bring enhanced functionality into your Discord servers!</p>
	<p>Subscriptions are monthly and done through Ko-Fi, instructions below.</p>
	<div class="flex flex-row gap-8 my-16">
		<Plan name="Free" price={0}>
			<li>Unlimited <span class="text-mono">/stats</span> access</li>
			<li>Full access to data taken from the Hypixel API</li>
		</Plan>
		<Plan
			name="Bronze"
			price={['gold', 'silver', 'bronze'].includes(premium) ? 0 : 1}
			href="https://ko-fi.com/summary/0ae94259-84f4-49fa-bcef-d304ee295bb5"
		>
			<li><span class="text-xl font-semibold font-mono">1</span> Leaderboard Token Monthly</li>
			<li>Discord Roles</li>
			<li class="text-gray-500">+ Free Plan Items</li>
		</Plan>
		<Plan
			name="Silver"
			price={['gold', 'silver'].includes(premium) ? 0 : 3}
			href="https://ko-fi.com/summary/879e22bf-92d1-4b00-8588-d980e3270f17"
		>
			<li><span class="text-xl font-semibold font-mono">2</span> Event Tokens Monthly</li>
			<li><span class="text-xl font-semibold font-mono">4</span> Leaderboard Tokens Monthly</li>
			<li>Discord Roles</li>
			<li class="text-gray-500">+ Free Plan Items</li>
		</Plan>
		<Plan
			name="Gold"
			price={premium !== 'gold' ? 10 : 0}
			href="https://ko-fi.com/summary/f56fc59b-14a5-4e5e-a4ef-fd72ef93c2ae"
		>
			<li><span class="text-xl font-semibold font-mono">5</span> Event Tokens Monthly</li>
			<li>+ Ability to Host Public Events!</li>
			<li><span class="text-xl font-semibold font-mono">10</span> Leaderboard Tokens Monthly</li>
			<li>Discord Roles</li>
			<li class="text-gray-500">+ Free Plan Items</li>
		</Plan>
	</div>
	<p class="mb-16">More features may come at any time! Be sure to check back if you're interested.</p>

	<div class="flex flex-row gap-8 md:w-[70%]">
		<Card class="p-4">
			<h2 class="text-2xl mb-4">What are Tokens?</h2>
			<p>
				Tokens are used to start events and leaderboards available on the site and your Discord server of
				choice! You can redeem these tokens at any time, or gift them to a Discord server to allow them to
				create the event/leaderboard.
			</p>
		</Card>
		<Card class="p-4">
			<h2 class="text-2xl mb-4">What are Tokens?</h2>
			<p>
				Tokens are used to start events and leaderboards available on the site and your Discord server of
				choice! You can redeem these tokens at any time, or gift them to a Discord server to allow them to
				create the event/leaderboard.
			</p>
		</Card>
	</div>
</section>
