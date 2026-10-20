<script lang="ts">
	import { getContext } from 'svelte';

	import Modal from '$lib/components/common/Modal.svelte';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import XMark from '$lib/components/icons/XMark.svelte';

	import ConnectForm from './ConnectForm.svelte';
	import { detectAuth, type AuthType } from './connectors';
	import type { ConnectorAuth } from './types';

	const i18n = getContext('i18n') as any;

	export let show = false;
	export let webuiUrl = '';
	export let onAdded: (toolId: string) => void = () => {};

	let step: 'details' | 'detecting' | 'connect' = 'details';
	let name = '';
	let url = '';
	let description = '';
	let detected: AuthType = 'oauth';
	let previewTools: string[] | null = null;

	let detectRun = 0;

	$: if (!show) reset();

	const reset = () => {
		// Invalidates a detection that is still running.
		detectRun += 1;
		step = 'details';
		name = '';
		url = '';
		description = '';
		previewTools = null;
	};

	$: urlValid = /^https?:\/\/[^\s/]+/.test(url.trim());
	$: localhostWarning = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/.test(url.trim());

	const ALL: Record<AuthType, ConnectorAuth> = {
		none: { type: 'none' },
		oauth: { type: 'oauth' },
		bearer: { type: 'bearer', keyLabel: '', keyUrl: '' },
		oauth_static: { type: 'oauth_static', setupUrl: '' }
	};

	$: authOptions = [
		ALL[detected],
		...(['oauth', 'none', 'bearer', 'oauth_static'] as AuthType[])
			.filter((type) => type !== detected)
			.map((type) => ALL[type])
	];

	$: detectedText = {
		none: $i18n.t('This server works without sign-in.'),
		oauth: $i18n.t('This server uses OAuth sign-in.'),
		bearer: $i18n.t(
			'This server needs a key, or could not be reached. Check the URL if you expected something else.'
		),
		oauth_static: $i18n.t('This server needs an OAuth app.')
	}[detected];

	const detect = async () => {
		const run = ++detectRun;
		step = 'detecting';
		const result = await detectAuth(name.trim(), url.trim());
		if (run !== detectRun || !show) return;
		detected = result.auth;
		previewTools = result.tools ?? null;
		step = 'connect';
	};
</script>

<Modal bind:show size="sm">
	<div class="px-5 pt-4 pb-5 text-sm">
		<div class="mb-3 flex items-center justify-between">
			<div class="text-base text-gray-900 dark:text-white">
				{$i18n.t('Add custom connector')}
			</div>
			<button
				class="rounded-lg p-1 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
				aria-label={$i18n.t('Close')}
				type="button"
				on:click={() => (show = false)}
			>
				<XMark className="size-5" />
			</button>
		</div>

		{#if step === 'details'}
			<form class="flex flex-col gap-3" on:submit|preventDefault={detect}>
				<label class="flex flex-col gap-1">
					<span class="text-xs text-gray-500">{$i18n.t('Name')}</span>
					<input
						class="w-full rounded-xl bg-gray-50 px-3 py-2 text-sm outline-hidden dark:bg-gray-850"
						placeholder={$i18n.t('e.g. Company wiki')}
						bind:value={name}
						required
					/>
				</label>
				<label class="flex flex-col gap-1">
					<span class="text-xs text-gray-500">{$i18n.t('Remote MCP server URL')}</span>
					<input
						class="w-full rounded-xl bg-gray-50 px-3 py-2 font-mono text-sm outline-hidden dark:bg-gray-850"
						placeholder="https://mcp.example.com/mcp"
						bind:value={url}
						type="url"
						required
						autocomplete="off"
					/>
				</label>
				<label class="flex flex-col gap-1">
					<span class="text-xs text-gray-500">{$i18n.t('Description (optional)')}</span>
					<input
						class="w-full rounded-xl bg-gray-50 px-3 py-2 text-sm outline-hidden dark:bg-gray-850"
						bind:value={description}
					/>
				</label>

				<p class="text-[0.6875rem] leading-relaxed text-gray-400 dark:text-gray-600">
					{$i18n.t(
						'The Open WebUI server opens this connection, not your browser. Use the Streamable HTTP endpoint, usually ending in /mcp.'
					)}
				</p>
				{#if localhostWarning}
					<p
						class="rounded-xl bg-amber-50 px-3 py-2 text-[0.6875rem] leading-relaxed text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
					>
						{$i18n.t(
							'If Open WebUI runs in Docker, localhost is the container itself. Use host.docker.internal or the host’s IP address instead.'
						)}
					</p>
				{/if}

				<div class="flex justify-end">
					<button
						class="h-8 rounded-xl bg-gray-900 px-3.5 text-xs text-white transition hover:bg-black disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
						type="submit"
						disabled={!name.trim() || !urlValid}
					>
						{$i18n.t('Continue')}
					</button>
				</div>
			</form>
		{:else if step === 'detecting'}
			<div class="flex items-center gap-2 py-8 text-xs text-gray-500">
				<Spinner className="size-4" />
				{$i18n.t('Checking how {{NAME}} signs in…', { NAME: name })}
			</div>
		{:else}
			<div class="mb-3 rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-850">
				<div class="text-sm text-gray-900 dark:text-white">{name}</div>
				<div class="truncate font-mono text-xs text-gray-500">{url}</div>
				<div class="mt-1 text-xs text-gray-600 dark:text-gray-400">
					{detectedText}
				</div>
			</div>

			<ConnectForm
				{name}
				{description}
				url={url.trim()}
				{authOptions}
				{webuiUrl}
				{previewTools}
				requireTrust
				onAdded={(toolId) => {
					show = false;
					onAdded(toolId);
				}}
			/>

			<button
				class="mt-2 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"
				type="button"
				on:click={() => (step = 'details')}
			>
				← {$i18n.t('Back')}
			</button>
		{/if}
	</div>
</Modal>
