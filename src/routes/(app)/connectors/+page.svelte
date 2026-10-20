<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import { config } from '$lib/stores';
	import ConnectorsPage from '$lib/components/connectors/ConnectorsPage.svelte';

	let allowed = false;

	onMount(() => {
		if ($config?.features?.enable_tool_servers === false) {
			goto('/');
			return;
		}
		allowed = true;
	});
</script>

{#if allowed}
	<ConnectorsPage />
{/if}
