<script lang="ts">
	export let text: string; 
	let show = false;
</script>

<section on:mouseenter={() => show = true} on:mouseleave={() => show = false}>
	<slot />
	<div class="absolute" hidden={!show}>
		<div class="bg-gray-300 rounded-lg text-body p-3 top-2">
			{text}
		</div>
	</div>
</section>