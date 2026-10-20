<script lang="ts">
	import { getContext } from 'svelte';

	import { user } from '$lib/stores';
	import Modal from '$lib/components/common/Modal.svelte';
	import XMark from '$lib/components/icons/XMark.svelte';

	import ConnectorIcon from './ConnectorIcon.svelte';
	import ConnectForm from './ConnectForm.svelte';
	import { CATEGORIES } from './catalog';
	import type { CatalogConnector, ConnectorAuth } from './types';

	const i18n = getContext('i18n') as any;

	export let show = false;
	export let connector: CatalogConnector | null = null;
	export let webuiUrl = '';
	// Tool ids of connections already created from this entry.
	export let addedToolIds: string[] = [];
	export let onAdded: (toolId: string) => void = () => {};

	let adding = false;

	$: if (!show) adding = false;
	$: authOptions = connector
		? ([connector.auth, connector.alternativeAuth].filter(Boolean) as ConnectorAuth[])
		: [];
	$: categoryLabel = CATEGORIES.find((c) => c.id === connector?.category)?.label ?? '';

	$: signInLabel = (type: ConnectorAuth['type']) =>
		({
			none: $i18n.t('Not required'),
			oauth: $i18n.t('Each person signs in'),
			oauth_static: $i18n.t('Sign-in with an OAuth app you create'),
			bearer: $i18n.t('API key')
		})[type];
</script>

<Modal bind:show size="md">
	{#if connector}
		<div class="px-5 pt-4 pb-5 text-sm">
			<div class="flex items-start gap-3">
				<ConnectorIcon name={connector.name} size="lg" />
				<div class="min-w-0 flex-1">
					<div class="text-base text-gray-900 dark:text-white">{connector.name}</div>
					<div class="text-xs text-gray-500">{connector.tagline}</div>
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

			<p class="mt-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
				{connector.description}
			</p>

			{#if connector.examples.length}
				<div class="mt-4">
					<div class="mb-1.5 text-xs text-gray-500">{$i18n.t('Things to try')}</div>
					<ul class="flex flex-col gap-1">
						{#each connector.examples as example}
							<li
								class="rounded-xl bg-gray-50 px-3 py-1.5 text-xs text-gray-700 dark:bg-gray-850 dark:text-gray-300"
							>
								“{example}”
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<dl class="mt-4 grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1.5 text-xs">
				<dt class="text-gray-500">{$i18n.t('Category')}</dt>
				<dd class="text-gray-800 dark:text-gray-200">{$i18n.t(categoryLabel)}</dd>
				<dt class="text-gray-500">{$i18n.t('Made by')}</dt>
				<dd class="text-gray-800 dark:text-gray-200">{connector.publisher}</dd>
				<dt class="text-gray-500">{$i18n.t('Sign-in')}</dt>
				<dd class="text-gray-800 dark:text-gray-200">
					{authOptions.map((a) => signInLabel(a.type)).join(' · ')}
				</dd>
				<dt class="text-gray-500">{$i18n.t('Server URL')}</dt>
				<dd class="truncate font-mono text-gray-800 dark:text-gray-200">{connector.url}</dd>
				<dt class="text-gray-500">{$i18n.t('Documentation')}</dt>
				<dd>
					<a
						class="text-gray-800 underline decoration-gray-300 underline-offset-4 hover:text-gray-950 dark:text-gray-200 dark:decoration-gray-700 dark:hover:text-white"
						href={connector.docsUrl}
						target="_blank"
						rel="noopener noreferrer">{new URL(connector.docsUrl).hostname} ↗</a
					>
				</dd>
			</dl>

			{#if connector.setupNote}
				<p
					class="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
				>
					{connector.setupNote}
				</p>
			{/if}

			<p class="mt-4 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
				{$i18n.t(
					'Connectors are run by their makers, not by Open WebUI. Only connect services you trust. The model can read and change data through the tools you enable.'
				)}
			</p>

			<div class="mt-4 border-t border-gray-100 pt-4 dark:border-gray-850">
				{#if $user?.role !== 'admin'}
					<p class="text-xs text-gray-500">
						{addedToolIds.length
							? $i18n.t('This connector is available. Find it under "Your connectors".')
							: $i18n.t('Ask an admin to add this connector.')}
					</p>
				{:else if adding}
					<ConnectForm
						name={connector.name}
						description={connector.tagline}
						url={connector.url}
						catalogId={connector.id}
						{authOptions}
						{webuiUrl}
						onAdded={(toolId) => {
							show = false;
							onAdded(toolId);
						}}
					/>
				{:else}
					<div class="flex items-center justify-between gap-3">
						<span class="text-xs text-gray-500">
							{addedToolIds.length
								? $i18n.t('Already added. You can add it again, e.g. for a second account.')
								: ''}
						</span>
						<button
							class="h-8 shrink-0 rounded-xl bg-gray-900 px-3.5 text-xs text-white transition hover:bg-black dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
							type="button"
							on:click={() => (adding = true)}
						>
							{addedToolIds.length ? $i18n.t('Add again') : $i18n.t('Add connector')}
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</Modal>
