<svelte:head>
	<script>
		if (localStorage.getItem('theme')) {
			document.documentElement.className = localStorage.getItem('theme').trim();
		} else {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			document.documentElement.className = prefersDark ? 'dark' : 'light';
		}
	</script>
</svelte:head>
