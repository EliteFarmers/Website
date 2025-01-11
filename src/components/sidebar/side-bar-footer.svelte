<script lang="ts">
	import UserDropdown from '$comp/sidebar/user-dropdown.svelte';
	import * as Sidebar from '$ui/sidebar';
</script>

<Sidebar.Footer>
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<UserDropdown />
		</Sidebar.MenuItem>
	</Sidebar.Menu>
</Sidebar.Footer>
