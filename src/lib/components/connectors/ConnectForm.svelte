<script lang="ts">
	import { getContext, onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';

	import Spinner from '$lib/components/common/Spinner.svelte';
	import SensitiveInput from '$lib/components/common/SensitiveInput.svelte';

	import type { ConnectorAuth } from './types';
	import {
		addConnector,
		pendingConnectionId,
		redirectUrlFor,
		startSignIn,
		testConnection,
		type Audience,
		type AuthType,
		type NewConnector
	} from './connectors';

	const i18n = getContext('i18n') as any;

	export let name: string;
	export let description = '';
	export let url: string;
	export let catalogId: string | undefined = undefined;
	// First entry is the default choice.
	export let authOptions: ConnectorAuth[];
	// Public URL of this Open WebUI (Admin Settings). OAuth needs it.
	export let webuiUrl = '';
	// Custom servers must be acknowledged before adding.
	export let requireTrust = false;
	// Tools found while detecting the sign-in method.
	export let previewTools: string[] | null = null;
	export let onAdded: (toolId: string) => void = () => {};

	let selected: ConnectorAuth = authOptions[0] ?? { type: 'none' };
	let audience: Audience = 'me';
	let key = '';
	let clientId = '';
	let clientSecret = '';
	let serverUrl = '';
	let trusted = false;

	let working = false;
	let error = '';
	let canForce = false;
	let foundTools: string[] | null = previewTools;
	let destroyed = false;

	onDestroy(() => (destroyed = true));

	const connectionId = pendingConnectionId(catalogId, name);

	$: isOAuth = selected.type === 'oauth' || selected.type === 'oauth_static';
	$: redirectUrl = webuiUrl ? redirectUrlFor(webuiUrl, connectionId) : '';

	// Prefill the authorization server only when the choice changes, so it can be cleared.
	let prefilledFor: ConnectorAuth | null = null;
	$: if (selected !== prefilledFor) {
		prefilledFor = selected;
		serverUrl = selected.type === 'oauth_static' ? (selected.serverUrl ?? '') : '';
	}

	$: authLabel = (type: AuthType) =>
		({
			none: $i18n.t('No sign-in'),
			oauth: $i18n.t('Each person signs in'),
			oauth_static: $i18n.t('Own OAuth app'),
			bearer: $i18n.t('API key')
		})[type];

	$: missing =
		(selected.type === 'bearer' && !key.trim()) ||
		(selected.type === 'oauth_static' && (!clientId.trim() || !clientSecret.trim())) ||
		(isOAuth && !webuiUrl) ||
		(requireTrust && !trusted);

	const buildConnector = (): NewConnector => ({
		name,
		description,
		url,
		catalogId,
		connectionId,
		audience,
		auth: selected.type,
		key,
		clientId,
		clientSecret,
		serverUrl,
		scope: 'scope' in selected ? selected.scope : undefined
	});

	const submit = async (force = false) => {
		if (working) return;
		error = '';
		canForce = false;
		working = true;
		let redirecting = false;

		try {
			const connector = buildConnector();
			const alreadyTested = selected.type === 'none' && previewTools !== null;

			if (!force && !alreadyTested && (selected.type === 'none' || selected.type === 'bearer')) {
				try {
					foundTools = await testConnection(connector);
				} catch (err) {
					if (destroyed) return;
					error = `${err ?? ''}`.includes('Failed to create MCP client')
						? $i18n.t(
								'Could not connect. Check the URL and key. The Open WebUI server, not your browser, opens this connection.'
							)
						: `${err}`;
					canForce = true;
					return;
				}
			}

			const toolId = await addConnector(connector);

			if (destroyed) {
				toast.success($i18n.t('{{NAME}} added', { NAME: name }));
				return;
			}

			if (isOAuth) {
				toast.success($i18n.t('{{NAME}} added. Opening sign-in…', { NAME: name }));
				redirecting = true;
				startSignIn(toolId);
				return;
			}

			toast.success($i18n.t('{{NAME}} added', { NAME: name }));
			onAdded(toolId);
		} catch (err) {
			if (!destroyed) error = `${err}`;
		} finally {
			// Keep the button disabled while the browser leaves for the sign-in page.
			if (!redirecting) working = false;
		}
	};

	const copy = async (text: string) => {
		await navigator.clipboard.writeText(text).catch(() => {});
		toast.success($i18n.t('Copied to clipboard'));
	};

	const segmentClass = (active: boolean) =>
		`h-7 rounded-lg px-2.5 text-xs transition ${
			active
				? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
				: 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-850 dark:text-gray-300 dark:hover:bg-gray-800'
		}`;
</script>

<div class="flex flex-col gap-3">
	{#if authOptions.length > 1}
		<div role="group" aria-label={$i18n.t('How to connect')}>
			<div class="mb-1 text-xs text-gray-500">{$i18n.t('How to connect')}</div>
			<div class="flex flex-wrap gap-1">
				{#each authOptions as option}
					<button
						class={segmentClass(selected.type === option.type)}
						type="button"
						aria-pressed={selected.type === option.type}
						on:click={() => (selected = option)}
					>
						{authLabel(option.type)}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	{#if selected.type === 'oauth'}
		<p class="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
			{$i18n.t(
				'Each person signs in with their own account. You will be sent to {{NAME}} to approve access.',
				{ NAME: name }
			)}
		</p>
	{:else if selected.type === 'none'}
		<p class="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
			{$i18n.t('No account needed. The connector works right after adding it.')}
		</p>
	{:else if selected.type === 'bearer'}
		<div>
			<div class="mb-1 flex items-center justify-between text-xs text-gray-500">
				<label for="connector-key-{connectionId}">{selected.keyLabel || $i18n.t('API key')}</label>
				{#if selected.keyUrl}
					<a
						class="underline decoration-gray-300 underline-offset-4 hover:text-gray-900 dark:decoration-gray-700 dark:hover:text-white"
						href={selected.keyUrl}
						target="_blank"
						rel="noopener noreferrer">{$i18n.t('Get a key')} ↗</a
					>
				{/if}
			</div>
			<SensitiveInput
				id="connector-key-{connectionId}"
				bind:value={key}
				placeholder={$i18n.t('Paste the key')}
				outerClassName="flex flex-1 rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-850"
				inputClassName="w-full bg-transparent text-sm outline-hidden"
				required={false}
			/>
			<p class="mt-1 text-[0.6875rem] leading-relaxed text-gray-500">
				{$i18n.t(
					'Sent as "Authorization: Bearer <key>". Everyone who can use this connector acts with this key.'
				)}
			</p>
		</div>
	{:else if selected.type === 'oauth_static'}
		<p class="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
			{$i18n.t(
				'{{NAME}} needs an OAuth app that you create in its developer settings, using the redirect URL below.',
				{ NAME: name }
			)}
			{#if selected.setupUrl}
				<a
					class="underline decoration-gray-300 underline-offset-4 hover:text-gray-900 dark:decoration-gray-700 dark:hover:text-white"
					href={selected.setupUrl}
					target="_blank"
					rel="noopener noreferrer">{$i18n.t('Open setup guide')} ↗</a
				>
			{/if}
		</p>
	{/if}

	{#if isOAuth}
		{#if webuiUrl}
			<div>
				<div class="mb-1 text-xs text-gray-500">{$i18n.t('Redirect URL')}</div>
				<div class="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-850">
					<code class="min-w-0 flex-1 truncate text-xs">{redirectUrl}</code>
					<button
						class="shrink-0 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"
						type="button"
						on:click={() => copy(redirectUrl)}
					>
						{$i18n.t('Copy')}
					</button>
				</div>
			</div>
		{:else}
			<p
				class="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
			>
				{$i18n.t(
					'Sign-in needs the public address of this Open WebUI. Set the WebUI URL at the top of the Connectors page first.'
				)}
			</p>
		{/if}
	{/if}

	{#if selected.type === 'oauth_static'}
		<div class="flex flex-col gap-2">
			<label class="flex flex-col gap-1">
				<span class="text-xs text-gray-500">{$i18n.t('Client ID')}</span>
				<input
					class="w-full rounded-xl bg-gray-50 px-3 py-2 text-sm outline-hidden dark:bg-gray-850"
					bind:value={clientId}
					autocomplete="off"
				/>
			</label>
			<div class="flex flex-col gap-1">
				<label class="text-xs text-gray-500" for="connector-secret-{connectionId}">
					{$i18n.t('Client secret')}
				</label>
				<SensitiveInput
					id="connector-secret-{connectionId}"
					bind:value={clientSecret}
					outerClassName="flex flex-1 rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-850"
					inputClassName="w-full bg-transparent text-sm outline-hidden"
					required={false}
				/>
			</div>
			<label class="flex flex-col gap-1">
				<span class="text-xs text-gray-500">
					{$i18n.t('Authorization server URL (optional)')}
				</span>
				<input
					class="w-full rounded-xl bg-gray-50 px-3 py-2 text-sm outline-hidden dark:bg-gray-850"
					bind:value={serverUrl}
					autocomplete="off"
				/>
			</label>
		</div>
	{/if}

	{#if foundTools?.length}
		<p class="text-xs text-gray-600 dark:text-gray-400">
			{$i18n.t('Found {{COUNT}} tools: {{NAMES}}', {
				COUNT: foundTools.length,
				NAMES: foundTools.slice(0, 6).join(', ') + (foundTools.length > 6 ? ', …' : '')
			})}
		</p>
	{/if}

	<div role="group" aria-label={$i18n.t('Who can use it')}>
		<div class="mb-1 text-xs text-gray-500">{$i18n.t('Who can use it')}</div>
		<div class="flex gap-1">
			<button
				class={segmentClass(audience === 'me')}
				type="button"
				aria-pressed={audience === 'me'}
				on:click={() => (audience = 'me')}
			>
				{$i18n.t('Only me')}
			</button>
			<button
				class={segmentClass(audience === 'everyone')}
				type="button"
				aria-pressed={audience === 'everyone'}
				on:click={() => (audience = 'everyone')}
			>
				{$i18n.t('Everyone')}
			</button>
		</div>
		<p class="mt-1 text-[0.6875rem] leading-relaxed text-gray-500">
			{audience === 'me'
				? $i18n.t('Other admins can see and use it too. You can change this later.')
				: $i18n.t('Every user can turn it on in their chats. You can change this later.')}
		</p>
	</div>

	{#if requireTrust}
		<label class="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
			<input type="checkbox" class="mt-0.5" bind:checked={trusted} />
			<span>
				{$i18n.t(
					'I trust this server. It can see what the model sends to it and its answers reach the model.'
				)}
			</span>
		</label>
	{/if}

	{#if error}
		<p
			class="rounded-xl bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700 dark:bg-red-950/40 dark:text-red-300"
			role="alert"
		>
			{error}
		</p>
	{/if}

	<div class="flex items-center justify-end gap-2">
		{#if canForce}
			<button
				class="h-8 rounded-xl px-3 text-xs text-gray-600 transition hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/5"
				type="button"
				disabled={working}
				on:click={() => submit(true)}
			>
				{$i18n.t('Add anyway')}
			</button>
		{/if}
		<button
			class="flex h-8 items-center gap-2 rounded-xl bg-gray-900 px-3.5 text-xs text-white transition hover:bg-black disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
			type="button"
			disabled={working || missing}
			on:click={() => submit()}
		>
			{#if working}<Spinner className="size-3.5" />{/if}
			{isOAuth ? $i18n.t('Add and sign in') : $i18n.t('Add connector')}
		</button>
	</div>
</div>
