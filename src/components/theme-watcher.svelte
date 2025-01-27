<svelte:head>
	<script>
		const localStorageSavedTheme = localStorage.getItem('theme');
		if (localStorageSavedTheme) {
			document.documentElement.className = localStorageSavedTheme.trim();
		} else {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			document.documentElement.className = prefersDark ? 'dark' : 'light';
		}
	</script>
</svelte:head>
