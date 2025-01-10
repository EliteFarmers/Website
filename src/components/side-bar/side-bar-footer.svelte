<script lang="ts">
	import UserDropdown from '$comp/header/user-dropdown.svelte';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import * as Sidebar from '$ui/sidebar';
	import ChevronUp from 'lucide-svelte/icons/chevron-up';
</script>

<Sidebar.Footer>
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<UserDropdown />
		</Sidebar.MenuItem>
	</Sidebar.Menu>
</Sidebar.Footer>