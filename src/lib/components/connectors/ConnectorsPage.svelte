<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';

	import { WEBUI_NAME, mobile, showSettings, showSidebar, tools, user } from '$lib/stores';
	import { getAdminConfig, updateAdminConfig } from '$lib/apis/auths';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import SidebarIcon from '$lib/components/icons/Sidebar.svelte';
	import Search from '$lib/components/icons/Search.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';

	import YourConnectors from './YourConnectors.svelte';
	import ConnectorDirectory from './ConnectorDirectory.svelte';
	import ConnectorDetailModal from './ConnectorDetailModal.svelte';
	import AddCustomConnectorModal from './AddCustomConnectorModal.svelte';
	import { CATALOG_VERIFIED_AT } from './catalog';
	import { catalogIdOf, clearReturnFlag, refreshTools } from './connectors';
	import type { CatalogConnector } from './types';

	const i18n = getContext('i18n') as any;

	let tab: 'yours' | 'discover' = 'yours';
	let query = '';
	let highlightToolId: string | null = null;

	let selected: CatalogConnector | null = null;
	let showDetail = false;
	let showCustom = false;

	let adminConfigLoaded = false;
	let webuiUrl = '';
	let webuiUrlDraft = '';
	let savingUrl = false;

	$: isAdmin = $user?.role === 'admin';
	$: mcpToolIds = (($tools ?? []) as any[])
		.map((tool) => String(tool.id))
		.filter((id) => id.startsWith('server:mcp:'));
	$: addedCatalogIds = mcpToolIds.map(catalogIdOf).filter((id): id is string => id !== null);

	const showAdded = (toolId: string) => {
		highlightToolId = toolId;
		tab = 'yours';
		query = '';
	};

	// Fields the backend leaves alone when they are missing; never resend them from here.
	const UNTOUCHED_ADMIN_FIELDS = [
		'ENABLE_MFA',
		'MFA_ALLOW_OAUTH_BYPASS',
		'MFA_ALLOW_TRUSTED_HEADER_BYPASS',
		'ENABLE_LOGIN_FORM',
		'ENABLE_ENCRYPTED_CHANNELS',
		'ENABLE_APPS',
		'I18N',
		'SKILL_CONTENT_MAX_CHARS',
		'SKILL_PREVIEW_MAX_CHARS'
	];

	const saveWebuiUrl = async () => {
		savingUrl = true;
		try {
			const value = webuiUrlDraft.trim().replace(/\/$/, '');
			// Re-read so settings changed elsewhere in the meantime are not reverted.
			const fresh = await getAdminConfig(localStorage.token);
			if (!fresh) throw $i18n.t('Could not load the admin settings.');
			const body = { ...fresh, WEBUI_URL: value };
			UNTOUCHED_ADMIN_FIELDS.forEach((field) => delete body[field]);

			const res = await updateAdminConfig(localStorage.token, body);
			if (!res) throw $i18n.t('Failed to update settings');
			if (res.sessions_revoked) {
				localStorage.removeItem('token');
				window.location.href = '/auth?state=logout&form=signin';
				return;
			}
			webuiUrl = res.WEBUI_URL ?? value;
			toast.success($i18n.t('WebUI URL saved'));
		} catch (err) {
			toast.error(`${err}`);
		} finally {
			savingUrl = false;
		}
	};

	onMount(async () => {
		// A sign-in that never came back must not redirect a later one.
		clearReturnFlag();

		const params = $page.url.searchParams;
		if (params.get('tab') === 'discover') tab = 'discover';
		const connected = params.get('connected');
		const failed = params.get('failed');
		if (connected || failed) {
			highlightToolId = connected ?? failed;
			tab = 'yours';
		}
		if (failed) {
			toast.error(
				$i18n.t('Sign-in did not complete: {{ERROR}}', {
					ERROR: params.get('error') || $i18n.t('Unknown error')
				})
			);
		}

		await refreshTools().catch(() => {});

		if (isAdmin) {
			const adminConfig = await getAdminConfig(localStorage.token).catch(() => null);
			adminConfigLoaded = adminConfig !== null;
			webuiUrl = adminConfig?.WEBUI_URL ?? '';
			webuiUrlDraft = webuiUrl || window.location.origin;
		}
	});
</script>

<svelte:head>
	<title>{$i18n.t('Connectors')} • {$WEBUI_NAME}</title>
</svelte:head>

<div
	class="flex h-screen max-h-[100dvh] w-full max-w-full flex-col transition-width duration-200 ease-in-out {$showSidebar
		? 'md:max-w-[calc(100%-var(--sidebar-width))]'
		: ''}"
>
	<div class="shrink-0 px-2.5 pt-2 pb-1">
		<div class="flex items-center gap-0.5 md:gap-1">
			{#if $mobile}
				<div class="{$showSidebar ? 'md:hidden' : ''} flex flex-none items-center">
					<Tooltip content={$showSidebar ? $i18n.t('Close Sidebar') : $i18n.t('Open Sidebar')}>
						<button
							class="flex size-7 items-center justify-center text-gray-400 transition"
							aria-label={$showSidebar ? $i18n.t('Close Sidebar') : $i18n.t('Open Sidebar')}
							on:click={() => showSidebar.set(!$showSidebar)}
							type="button"
						>
							<SidebarIcon className="size-4" />
						</button>
					</Tooltip>
				</div>
			{/if}
			<span class="px-1 py-1 text-sm select-none">{$i18n.t('Connectors')}</span>
			<span class="text-sm text-gray-500">{mcpToolIds.length || ''}</span>
		</div>
	</div>

	<div class="min-h-0 flex-1 overflow-y-auto">
		<div class="mx-auto w-full max-w-4xl px-4 pt-4 pb-16 md:px-6">
			<div class="mb-1 flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 class="text-xl text-gray-900 dark:text-white">{$i18n.t('Connectors')}</h1>
					<p class="mt-1 text-xs text-gray-500">
						{$i18n.t(
							'Let the model use your apps and services. Connect once, then turn connectors on per chat in the Integrations menu.'
						)}
					</p>
				</div>
				{#if isAdmin}
					<button
						class="flex h-8 items-center gap-1.5 rounded-xl bg-gray-900 px-3 text-xs text-white transition hover:bg-black dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
						type="button"
						on:click={() => (showCustom = true)}
					>
						<Plus className="size-3.5" strokeWidth="2" />
						{$i18n.t('Add custom connector')}
					</button>
				{/if}
			</div>

			{#if isAdmin && adminConfigLoaded && !webuiUrl}
				<div
					class="mt-4 flex flex-col gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-900 sm:flex-row sm:items-center dark:bg-amber-950/40 dark:text-amber-200"
				>
					<div class="flex-1 leading-relaxed">
						{$i18n.t('Set the public address of this Open WebUI so OAuth sign-in can return here.')}
					</div>
					<div class="flex gap-2">
						<input
							class="w-56 rounded-lg bg-white/70 px-2 py-1 font-mono text-xs outline-hidden dark:bg-black/30"
							bind:value={webuiUrlDraft}
							aria-label={$i18n.t('WebUI URL')}
						/>
						<button
							class="h-7 shrink-0 rounded-lg bg-amber-900 px-2.5 text-xs text-white disabled:opacity-50 dark:bg-amber-200 dark:text-amber-950"
							type="button"
							disabled={savingUrl || !/^https?:\/\//.test(webuiUrlDraft.trim())}
							on:click={saveWebuiUrl}
						>
							{$i18n.t('Save')}
						</button>
					</div>
				</div>
			{/if}

			<div
				class="mt-5 mb-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-end sm:justify-between"
			>
				<div
					class="flex flex-1 gap-4 border-b border-gray-100 dark:border-gray-850"
					role="tablist"
					aria-label={$i18n.t('Connectors')}
				>
					<button
						id="connectors-tab-yours"
						class="-mb-px border-b-2 pb-2 text-sm transition {tab === 'yours'
							? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
							: 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}"
						role="tab"
						aria-selected={tab === 'yours'}
						aria-controls="connectors-panel"
						type="button"
						on:click={() => (tab = 'yours')}
					>
						{$i18n.t('Your connectors')}
					</button>
					<button
						id="connectors-tab-discover"
						class="-mb-px border-b-2 pb-2 text-sm transition {tab === 'discover'
							? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
							: 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}"
						role="tab"
						aria-selected={tab === 'discover'}
						aria-controls="connectors-panel"
						type="button"
						on:click={() => (tab = 'discover')}
					>
						{$i18n.t('Discover')}
					</button>
				</div>
				<div
					class="flex items-center gap-2 rounded-xl bg-gray-50 px-2.5 py-1.5 sm:w-64 dark:bg-gray-850"
				>
					<Search className="size-3.5 text-gray-400" />
					<input
						class="w-full bg-transparent text-xs outline-hidden"
						placeholder={tab === 'discover'
							? $i18n.t('Search connectors')
							: $i18n.t('Search your connectors')}
						bind:value={query}
						aria-label={$i18n.t('Search')}
					/>
				</div>
			</div>

			<div
				id="connectors-panel"
				role="tabpanel"
				aria-labelledby={tab === 'yours' ? 'connectors-tab-yours' : 'connectors-tab-discover'}
			>
				{#if tab === 'yours'}
					<YourConnectors {query} {highlightToolId} onBrowse={() => (tab = 'discover')} />
				{:else}
					<ConnectorDirectory
						{query}
						{addedCatalogIds}
						onSelect={(connector) => {
							selected = connector;
							showDetail = true;
						}}
					/>
					<p class="text-[0.6875rem] leading-relaxed text-gray-500">
						{$i18n.t('Endpoints were checked against each vendor’s documentation on {{DATE}}.', {
							DATE: CATALOG_VERIFIED_AT
						})}
						{isAdmin
							? $i18n.t('Missing one? Add it as a custom connector.')
							: $i18n.t('Missing one? Ask an admin to add it.')}
					</p>
				{/if}
			</div>

			{#if isAdmin}
				<button
					class="mt-8 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"
					type="button"
					on:click={() => showSettings.set('admin:integrations')}
				>
					{$i18n.t('Advanced server settings')} →
				</button>
			{/if}
		</div>
	</div>
</div>

<ConnectorDetailModal
	bind:show={showDetail}
	connector={selected}
	{webuiUrl}
	addedToolIds={selected ? mcpToolIds.filter((id) => catalogIdOf(id) === selected?.id) : []}
	onAdded={showAdded}
/>

<AddCustomConnectorModal bind:show={showCustom} {webuiUrl} onAdded={showAdded} />
