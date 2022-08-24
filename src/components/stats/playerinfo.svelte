<script lang="ts">
	import { getRankDefaults } from "$lib/format";
	import type { AccountData, PlayerInfo } from "$lib/skyblock";
	import { page } from "$app/stores";

	export let account: AccountData;
	export let player: PlayerInfo;

	const playerData = player.player;

	const rank = getRankDefaults(playerData.rank ?? playerData.newPackageRank);
	const plus = rank?.plus ?? undefined;
	const plusColor = rank?.plusColor;

</script>

<section class="md:flex justify-middle p-4 m-4 bg-gray-100">
	<div class="flex md:w-1/2 justify-items-middle justify-center">
		<!-- Player avatar image -->
		<div class="flex justify-end align-middle md:w-1/4">
			<div class="mx-8 mb-2">
				<img class="w-16" src={`https://mc-heads.net/body/${account.id}`} alt="User's Minecraft appearance" />
			</div>
		</div>
		<!-- Player name -->
		<div class="flex justify-start align-middle md:w-1/4">
			<div class="w-[100%]">
				<h1 class="text-2xl cursor-pointer" on:click={() => navigator.clipboard.writeText(account.id)}>
					{#if rank && plus} 
						<span style="color: {rank.color};">{rank?.tag}</span><span style="color: {plusColor};">{plus}</span>&nbsp;{account.name}
					{:else if rank}
						<span style="color: {rank.color};">{rank?.tag}</span>&nbsp;{account.name}
					{:else} 
						{account.name}
					{/if}
				</h1>
				<h4 class="text-lg">{playerData.socialMedia?.links?.DISCORD ?? ''}</h4>
				<!-- Buttons to link to other websites -->
				<div class="flex justify-start -ml-2">
					<a class="p-3 px-4 m-2 bg-gray-200 rounded-lg" href="https://sky.shiiyu.moe{$page.url.pathname}">SkyCrypt</a>
					<a class="p-3 px-4 m-2 bg-gray-200 rounded-lg" href="https://plancke.io/hypixel/player/stats/{account.name}">Plancke</a>
				</div>
			</div>
		</div>
	</div>

	<slot />
</section>