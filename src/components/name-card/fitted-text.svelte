<script lang="ts">
	let { text, appearance }: { text: string; appearance: string } = $props();

	function fit(element: HTMLSpanElement) {
		const parent = element.parentElement!;
		let stopped = false;
		let pending = 0;

		function measure() {
			if (stopped) return;
			element.style.fontSize = '';
			const size = parseFloat(getComputedStyle(element).fontSize);
			const scale = Math.min(
				1,
				(parent.clientWidth - 1) / element.scrollWidth,
				parent.clientHeight / element.offsetHeight
			);
			if (scale > 0 && scale < 1) element.style.fontSize = `${size * scale}px`;
		}

		function schedule() {
			if (stopped) return;
			cancelAnimationFrame(pending);
			pending = requestAnimationFrame(measure);
		}

		const observer = new ResizeObserver(schedule);
		observer.observe(parent);
		document.fonts.addEventListener('loadingdone', schedule);
		void document.fonts.ready.then(schedule);
		schedule();

		return () => {
			stopped = true;
			cancelAnimationFrame(pending);
			observer.disconnect();
			document.fonts.removeEventListener('loadingdone', schedule);
		};
	}
</script>

<span class="fit"
	><span
		{@attach (element) => {
			void text;
			void appearance;
			return fit(element);
		}}>{text}</span
	></span
>

<style>
	.fit {
		display: block;
		height: 100%;
		align-content: center;
		line-height: 0;
		min-width: 0;
		max-width: 100%;
	}
	.fit > span {
		display: inline-block;
		white-space: nowrap;
		line-height: 1;
	}
</style>
