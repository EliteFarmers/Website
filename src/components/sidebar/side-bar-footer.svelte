<script lang="ts">
	import UserDropdown from '$comp/sidebar/user-dropdown.svelte';
	import * as Sidebar from '$ui/sidebar';
	import SidebarNotifications from './sidebar-notifications.svelte';
</script>

<Sidebar.Footer>
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<SidebarNotifications />
		</Sidebar.MenuItem>
	</Sidebar.Menu>
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<UserDropdown />
		</Sidebar.MenuItem>
	</Sidebar.Menu>
</Sidebar.Footer>
