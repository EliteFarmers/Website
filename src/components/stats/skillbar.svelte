<script lang="ts">
	import { toReadable } from "$lib/format";
	import { onMount } from "svelte";
	import { fade } from 'svelte/transition';

	export let name: string;
	export let progress: {
		level: number,
		ratio: number
		progress: number,
		goal?: number
	}

	let percent = 100;
	let readable = ''; 
	let expanded = '';
	let hovering = false;

	onMount(() => {
		percent = Math.round(progress.ratio * 100);
	
		readable = progress.goal !== undefined  
			? toReadable(progress.progress) + ' / ' + toReadable(progress.goal)
			: toReadable(progress.progress)

		expanded = progress.goal !== undefined  
			? Math.floor(progress.progress).toLocaleString() + ' / ' + Math.floor(progress.goal).toLocaleString()
			: Math.floor(progress.progress).toLocaleString()
	})
</script>

<div class="relative w-[90%]">
	<span>{ name }  <strong>{ progress.level }</strong></span>
	<div class="relative w-[100%] bg-slate-300 h-8 rounded-lg" 
		on:mouseenter={() => hovering = true} 
		on:mouseleave={() => hovering = false}
	>
		<div class="absolute top-0 bottom-0 left-0 bg-orange-300 rounded-lg" style="width: {Math.max(2, percent)}%;" ></div>
		<div class="absolute grid align-middle justify-center w-[100%] h-[100%]">
			<span>{ hovering ? expanded : readable }</span>
		</div>
	</div>
</div>