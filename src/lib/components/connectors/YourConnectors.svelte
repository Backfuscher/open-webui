<script lang="ts">
	import { getContext, tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	import { settings, tools, user } from '$lib/stores';
	import { updateUserSettings } from '$lib/apis/users';
	import { resolveLocalizedResource } from '$lib/utils/localizedContent';

	import Switch from '$lib/components/common/Switch.svelte';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';
	import ChevronDown from '$lib/components/icons/ChevronDown.svelte';
	import McpToolList, {
		clearSpecsCache
	} from '$lib/components/chat/MessageInput/InputMenu/McpToolList.svelte';

	import ConnectorIcon from './ConnectorIcon.svelte';
	import { CATALOG } from './catalog';
	import {
		catalogIdOf,
		loadAudiences,
		removeConnector,
		setConnectorAudience,
		signOut,
		startSignIn,
		type Audience
	} from './connectors';

	const i18n = getContext('i18n') as any;

	export let query = '';
	// Connector just signed in or added; shown expanded and highlighted.
	export let highlightToolId: string | null = null;
	export let onBrowse: () => void = () => {};

	let expanded: string[] = [];
	let expandedFor: string | null = null;

	// Open a newly highlighted connector once; the user can collapse it afterwards.
	$: if (highlightToolId && highlightToolId !== expandedFor) {
		expandedFor = highlightToolId;
		if (!expanded.includes(highlightToolId)) expanded = [...expanded, highlightToolId];
	}
	let busy: string | null = null;
	let removeTarget: any = null;
	let showRemoveConfirm = false;
	// Admins only: who can use each connector, by tool id.
	let audiences: Record<string, Audience> = {};

	$: isAdmin = $user?.role === 'admin';

	const refreshAudiences = async () => {
		if (!isAdmin) return;
		audiences = await loadAudiences().catch(() => audiences);
	};

	// Reload when connectors are added or removed while this list is open.
	let audiencesFor: string | null = null;
	$: mcpIdsKey = allConnectors.map((c) => c.id).join(',');
	$: if (isAdmin && mcpIdsKey !== audiencesFor) {
		audiencesFor = mcpIdsKey;
		refreshAudiences();
	}

	$: allConnectors = (($tools ?? []) as any[]).filter((tool) =>
		String(tool.id).startsWith('server:mcp:')
	);
	$: connectors = allConnectors.filter(
		(tool) => !query.trim() || tool.name?.toLowerCase().includes(query.trim().toLowerCase())
	);
	$: defaultToolIds = ($settings?.tools ?? []) as string[];

	const catalogEntry = (toolId: string) => CATALOG.find((c) => c.id === catalogIdOf(toolId));

	const toggleDefault = async (toolId: string) => {
		const next = defaultToolIds.includes(toolId)
			? defaultToolIds.filter((id) => id !== toolId)
			: [...defaultToolIds, toolId];

		settings.set({ ...$settings, tools: next });
		await updateUserSettings(localStorage.token, { ui: { tools: next } }).catch((err) => {
			toast.error(`${err}`);
		});
	};

	const disconnect = async (toolId: string) => {
		busy = toolId;
		try {
			await signOut(toolId);
			clearSpecsCache(toolId);
			expanded = expanded.filter((id) => id !== toolId);
			toast.success($i18n.t('Disconnected'));
		} catch (err) {
			toast.error(`${err ?? $i18n.t('Failed to disconnect')}`);
		} finally {
			busy = null;
		}
	};

	const remove = async (connector: any) => {
		busy = connector.id;
		try {
			await removeConnector(connector.id);
			clearSpecsCache(connector.id);
			toast.success($i18n.t('{{NAME}} removed', { NAME: connector.name }));
		} catch (err) {
			toast.error(`${err}`);
		} finally {
			busy = null;
		}
	};

	const changeAudience = async (toolId: string, audience: Audience) => {
		busy = toolId;
		try {
			await setConnectorAudience(toolId, audience);
			audiences = { ...audiences, [toolId]: audience };
			toast.success(
				audience === 'everyone'
					? $i18n.t('Now available to everyone')
					: $i18n.t('Now limited to admins')
			);
		} catch (err) {
			toast.error(`${err}`);
		} finally {
			busy = null;
		}
	};

	const tryPrompt = (toolId: string, prompt: string) => {
		goto(`/?tools=${encodeURIComponent(toolId)}&q=${encodeURIComponent(prompt)}`);
	};

	$: if (highlightToolId) {
		tick().then(() =>
			document
				.getElementById(`connector-${highlightToolId}`)
				?.scrollIntoView({ block: 'center', behavior: 'smooth' })
		);
	}
</script>

{#if $tools === null}
	<div class="flex justify-center py-16"><Spinner className="size-5" /></div>
{:else if connectors.length === 0}
	<div class="flex flex-col items-center gap-3 py-16 text-center">
		<div class="text-sm text-gray-900 dark:text-white">
			{query.trim() ? $i18n.t('No matching connectors') : $i18n.t('No connectors yet')}
		</div>
		{#if !query.trim()}
			<div class="max-w-sm text-xs text-gray-500">
				{$i18n.t(
					'Connectors give the model tools from other apps and services, like your notes, tasks or code.'
				)}
				{#if !isAdmin}
					{$i18n.t('An admin adds them; you can see what is available.')}
				{/if}
			</div>
			<button
				class="h-8 rounded-xl bg-gray-900 px-3 text-xs text-white transition hover:bg-black dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
				type="button"
				on:click={onBrowse}
			>
				{$i18n.t('Browse connectors')}
			</button>
		{/if}
	</div>
{:else}
	<p class="mb-2 text-[0.6875rem] leading-relaxed text-gray-500">
		{$i18n.t(
			'"Use in new chats" turns a connector on by default, unless the chosen model has its own default tools.'
		)}
	</p>
	<div class="flex flex-col gap-2">
		{#each connectors as connector (connector.id)}
			{@const needsAuth = connector.authenticated === false}
			{@const isExpanded = expanded.includes(connector.id)}
			{@const entry = catalogEntry(connector.id)}
			<div
				id="connector-{connector.id}"
				class="rounded-2xl border transition-colors {highlightToolId === connector.id
					? 'border-gray-300 dark:border-gray-700'
					: 'border-gray-100 dark:border-gray-850'}"
			>
				<div class="flex items-center gap-3 px-3.5 py-3">
					<ConnectorIcon name={connector.name ?? ''} />

					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2">
							<span class="truncate text-sm text-gray-900 dark:text-white">
								{resolveLocalizedResource(connector, $i18n.language, 'name')}
							</span>
							<span class="flex shrink-0 items-center gap-1 text-[0.6875rem] text-gray-500">
								<span class="size-1.5 rounded-full {needsAuth ? 'bg-amber-500' : 'bg-green-500'}"
								></span>
								{#if needsAuth}
									{$i18n.t('Sign-in needed')}
								{:else if connector.authenticated === true}
									{$i18n.t('Connected')}
								{:else}
									{$i18n.t('Ready')}
								{/if}
							</span>
						</div>
						<div class="truncate text-xs text-gray-500">
							{entry?.tagline ??
								resolveLocalizedResource(connector, $i18n.language, 'description') ??
								''}
						</div>
					</div>

					{#if busy === connector.id}
						<Spinner className="size-4" />
					{:else if needsAuth}
						<button
							class="h-7 shrink-0 rounded-lg bg-gray-900 px-2.5 text-xs text-white transition hover:bg-black dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
							type="button"
							aria-label={$i18n.t('Connect {{NAME}}', { NAME: connector.name })}
							on:click={() => startSignIn(connector.id)}
						>
							{$i18n.t('Connect')}
						</button>
					{:else}
						<button
							class="flex h-7 shrink-0 items-center gap-1 rounded-lg px-2 text-xs text-gray-500 transition hover:bg-black/5 hover:text-gray-900 dark:hover:bg-white/5 dark:hover:text-white"
							type="button"
							aria-expanded={isExpanded}
							aria-label={$i18n.t('Tools of {{NAME}}', { NAME: connector.name })}
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
						class="flex items-center justify-between gap-3 border-t border-gray-100 px-3.5 py-2 dark:border-gray-850"
					>
						<span class="text-xs text-gray-600 dark:text-gray-400">
							{$i18n.t('Use in new chats')}
						</span>
						<Switch
							state={defaultToolIds.includes(connector.id)}
							ariaLabel={$i18n.t('Use {{NAME}} in new chats', { NAME: connector.name })}
							on:change={() => toggleDefault(connector.id)}
						/>
					</div>
				{/if}

				{#if isExpanded}
					<div class="border-t border-gray-100 px-1.5 py-2 dark:border-gray-850">
						<McpToolList toolId={connector.id} variant="settings" />
					</div>

					{#if entry?.examples?.length}
						<div class="border-t border-gray-100 px-3.5 py-2.5 dark:border-gray-850">
							<div class="mb-1.5 text-[0.6875rem] text-gray-500">{$i18n.t('Try asking')}</div>
							<div class="flex flex-wrap gap-1.5">
								{#each entry.examples as prompt}
									<button
										class="rounded-xl border border-gray-100 px-2.5 py-1 text-left text-xs text-gray-700 transition hover:bg-gray-50 dark:border-gray-850 dark:text-gray-300 dark:hover:bg-gray-850"
										type="button"
										on:click={() => tryPrompt(connector.id, prompt)}
									>
										{prompt}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				{/if}

				{#if connector.authenticated === true || isAdmin}
					<div
						class="flex items-center justify-end gap-1 border-t border-gray-100 px-2.5 py-1.5 dark:border-gray-850"
					>
						{#if isAdmin && audiences[connector.id]}
							<span class="mr-auto pl-1 text-[0.6875rem] text-gray-500">
								{audiences[connector.id] === 'everyone'
									? $i18n.t('Available to everyone')
									: $i18n.t('Available to admins')}
							</span>
							<button
								class="h-6 rounded-lg px-2 text-xs text-gray-500 transition hover:bg-black/5 hover:text-gray-900 dark:hover:bg-white/5 dark:hover:text-white"
								type="button"
								disabled={busy === connector.id}
								on:click={() =>
									changeAudience(
										connector.id,
										audiences[connector.id] === 'everyone' ? 'me' : 'everyone'
									)}
							>
								{audiences[connector.id] === 'everyone'
									? $i18n.t('Limit to admins')
									: $i18n.t('Share with everyone')}
							</button>
						{/if}
						{#if connector.authenticated === true}
							<button
								class="h-6 rounded-lg px-2 text-xs text-gray-500 transition hover:bg-black/5 hover:text-gray-900 dark:hover:bg-white/5 dark:hover:text-white"
								type="button"
								disabled={busy === connector.id}
								aria-label={$i18n.t('Disconnect {{NAME}}', { NAME: connector.name })}
								on:click={() => disconnect(connector.id)}
							>
								{$i18n.t('Disconnect')}
							</button>
						{/if}
						{#if isAdmin}
							<button
								class="h-6 rounded-lg px-2 text-xs text-gray-500 transition hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300"
								type="button"
								disabled={busy === connector.id}
								aria-label={$i18n.t('Remove {{NAME}}', { NAME: connector.name })}
								on:click={() => {
									removeTarget = connector;
									showRemoveConfirm = true;
								}}
							>
								{$i18n.t('Remove')}
							</button>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<ConfirmDialog
	bind:show={showRemoveConfirm}
	title={$i18n.t('Remove {{NAME}}?', { NAME: removeTarget?.name ?? '' })}
	message={$i18n.t(
		'This removes the connector for everyone who can use it. Their sign-ins to it stop working.'
	)}
	confirmLabel={$i18n.t('Remove')}
	onConfirm={() => {
		if (removeTarget) remove(removeTarget);
	}}
/>
