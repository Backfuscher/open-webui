<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { Writable } from 'svelte/store';
	import type { i18n as i18nType } from 'i18next';

	import { settings, tools, user } from '$lib/stores';
	import { getTools } from '$lib/apis/tools';
	import { deleteOAuthSession } from '$lib/apis/auths';
	import { initiateOAuthRedirect } from '$lib/apis/configs';
	import { updateUserSettings } from '$lib/apis/users';
	import { resolveLocalizedResource } from '$lib/utils/localizedContent';

	import Spinner from '$lib/components/common/Spinner.svelte';
	import Switch from '$lib/components/common/Switch.svelte';
	import ChevronDown from '$lib/components/icons/ChevronDown.svelte';
	import McpToolList from '../MessageInput/InputMenu/McpToolList.svelte';

	const i18n = getContext<Writable<i18nType>>('i18n');

	// Opens the admin tab where servers are added and edited.
	export let onManage: (() => void) | null = null;

	let loading = false;
	let expanded: string[] = [];

	$: connectors = (($tools ?? []) as any[]).filter((tool) =>
		String(tool.id).startsWith('server:mcp:')
	);
	$: defaultToolIds = ($settings?.tools ?? []) as string[];

	const serverIdOf = (toolId: string) => toolId.split(':').at(-1) ?? toolId;

	const refresh = async () => {
		loading = true;
		try {
			tools.set(await getTools(localStorage.token));
		} finally {
			loading = false;
		}
	};

	const toggleDefault = async (toolId: string) => {
		const next = defaultToolIds.includes(toolId)
			? defaultToolIds.filter((id) => id !== toolId)
			: [...defaultToolIds, toolId];

		settings.set({ ...$settings, tools: next });
		await updateUserSettings(localStorage.token, { ui: { tools: next } }).catch((err) => {
			toast.error(`${err}`);
		});
	};

	const connect = (toolId: string) => {
		initiateOAuthRedirect({ id: toolId, serverId: serverIdOf(toolId), authType: 'mcp' });
	};

	const disconnect = async (toolId: string) => {
		try {
			await deleteOAuthSession(localStorage.token, `mcp:${serverIdOf(toolId)}`);
			toast.success($i18n.t('OAuth session disconnected'));
			expanded = expanded.filter((id) => id !== toolId);
			await refresh();
		} catch (err) {
			toast.error(`${err ?? $i18n.t('Failed to disconnect')}`);
		}
	};

	onMount(() => {
		if ($tools === null) {
			refresh();
		}
	});
</script>

<div class="flex h-full flex-col text-sm">
	<h2 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
		{$i18n.t('Connectors')}
	</h2>
	<p class="mb-4 text-[0.6875rem] leading-relaxed text-gray-400 dark:text-gray-600">
		{$i18n.t(
			'MCP servers available to you. Choose which ones start enabled in new chats and which of their tools the model may use.'
		)}
	</p>

	<div class="flex flex-1 min-h-0 flex-col gap-2 overflow-y-auto scrollbar-hover pr-1.5">
		{#if $tools === null}
			<div class="flex h-full justify-center">
				<div class="my-auto"><Spinner className="size-6" /></div>
			</div>
		{:else if connectors.length === 0}
			<div class="text-[0.6875rem] leading-relaxed text-gray-400 dark:text-gray-600">
				{$i18n.t('No connectors available.')}
			</div>
		{:else}
			{#each connectors as connector (connector.id)}
				{@const needsAuth = connector.authenticated === false}
				{@const isExpanded = expanded.includes(connector.id)}
				<div class="rounded-xl border border-gray-100 dark:border-gray-850">
					<div class="flex items-center gap-3 px-3 py-2.5">
						<div
							class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium uppercase text-gray-600 dark:bg-gray-850 dark:text-gray-300"
							aria-hidden="true"
						>
							{(connector.name ?? '?').slice(0, 1)}
						</div>

						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<span class="truncate text-sm text-gray-900 dark:text-white">
									{resolveLocalizedResource(connector, $i18n.language, 'name')}
								</span>
								{#if connector.authenticated !== undefined}
									<span class="flex shrink-0 items-center gap-1 text-[0.6875rem] text-gray-500">
										<span
											class="size-1.5 rounded-full {needsAuth ? 'bg-amber-500' : 'bg-green-500'}"
										></span>
										{needsAuth ? $i18n.t('Auth required') : $i18n.t('Connected')}
									</span>
								{/if}
							</div>
							{#if connector.meta?.description}
								<div class="truncate text-xs text-gray-500">
									{resolveLocalizedResource(connector, $i18n.language, 'description')}
								</div>
							{/if}
						</div>

						{#if needsAuth}
							<button
								class="h-7 shrink-0 rounded-lg bg-gray-900 px-2.5 text-xs text-white transition hover:bg-black dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
								type="button"
								on:click={() => connect(connector.id)}
							>
								{$i18n.t('Connect')}
							</button>
						{:else}
							{#if connector.authenticated === true}
								<button
									class="h-7 shrink-0 rounded-lg px-2 text-xs text-gray-500 transition hover:bg-black/5 hover:text-gray-900 dark:hover:bg-white/5 dark:hover:text-white"
									type="button"
									on:click={() => disconnect(connector.id)}
								>
									{$i18n.t('Disconnect')}
								</button>
							{/if}

							<button
								class="flex h-7 shrink-0 items-center gap-1 rounded-lg px-2 text-xs text-gray-500 transition hover:bg-black/5 hover:text-gray-900 dark:hover:bg-white/5 dark:hover:text-white"
								type="button"
								aria-expanded={isExpanded}
								on:click={() => {
									expanded = isExpanded
										? expanded.filter((id) => id !== connector.id)
										: [...expanded, connector.id];
								}}
							>
								{$i18n.t('Tools')}
								<ChevronDown
									className="size-3 transition-transform {isExpanded ? 'rotate-180' : ''}"
								/>
							</button>
						{/if}
					</div>

					{#if !needsAuth}
						<div
							class="flex items-center justify-between gap-3 border-t border-gray-100 px-3 py-2 dark:border-gray-850"
						>
							<span class="text-xs text-gray-600 dark:text-gray-400">
								{$i18n.t('Use in new chats')}
							</span>
							<Switch
								state={defaultToolIds.includes(connector.id)}
								ariaLabel={$i18n.t('Use in new chats')}
								on:change={() => toggleDefault(connector.id)}
							/>
						</div>
					{/if}

					{#if isExpanded}
						<div class="border-t border-gray-100 px-1 py-2 dark:border-gray-850">
							<McpToolList toolId={connector.id} variant="settings" />
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>

	<div class="shrink-0 flex items-center justify-between pt-3 text-xs text-gray-500">
		<button
			class="hover:text-gray-900 dark:hover:text-white transition disabled:opacity-50"
			type="button"
			disabled={loading}
			on:click={refresh}
		>
			{$i18n.t('Refresh')}
		</button>
		{#if $user?.role === 'admin' && onManage}
			<button
				class="hover:text-gray-900 dark:hover:text-white transition"
				type="button"
				on:click={onManage}
			>
				{$i18n.t('Manage servers')} →
			</button>
		{/if}
	</div>
</div>
