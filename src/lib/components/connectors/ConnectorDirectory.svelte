<script lang="ts">
	import { getContext } from 'svelte';

	import { user } from '$lib/stores';

	import ConnectorIcon from './ConnectorIcon.svelte';
	import { CATALOG, CATEGORIES } from './catalog';
	import type { CatalogConnector, ConnectorCategory } from './types';

	const i18n = getContext('i18n') as any;

	export let query = '';
	// Catalog ids that already have a connection.
	export let addedCatalogIds: string[] = [];
	export let onSelect: (connector: CatalogConnector) => void = () => {};

	let category: ConnectorCategory | 'all' = 'all';

	$: q = query.trim().toLowerCase();
	$: matches = CATALOG.filter(
		(c) =>
			(category === 'all' || c.category === category) &&
			(!q || `${c.name} ${c.publisher} ${c.tagline} ${c.description}`.toLowerCase().includes(q))
	);
	$: browsing = !q && category === 'all';
	$: shelves = browsing
		? [
				{ key: 'popular', title: $i18n.t('Popular'), items: CATALOG.filter((c) => c.popular) },
				{
					key: 'no-sign-in',
					title: $i18n.t('Try without sign-in'),
					items: CATALOG.filter((c) => c.auth.type === 'none')
				},
				...CATEGORIES.map((cat) => ({
					key: cat.id,
					title: categoryLabel(cat.id),
					items: CATALOG.filter((c) => c.category === cat.id)
				}))
			].filter((shelf) => shelf.items.length > 0)
		: [{ key: 'results', title: '', items: matches }];

	$: authBadge = (type: string) =>
		({
			none: $i18n.t('No sign-in'),
			oauth: $i18n.t('Sign in'),
			bearer: $i18n.t('API key'),
			oauth_static: $i18n.t('Admin setup')
		})[type] ?? '';

	$: categoryLabel = (id: string) =>
		({
			all: $i18n.t('All'),
			productivity: $i18n.t('Productivity'),
			communication: $i18n.t('Communication'),
			developer: $i18n.t('Developer tools'),
			docs: $i18n.t('Docs & knowledge'),
			search: $i18n.t('Search & web'),
			data: $i18n.t('Data & finance'),
			commerce: $i18n.t('Payments & commerce'),
			design: $i18n.t('Design & websites')
		})[id] ?? id;
</script>

<div class="mb-4 flex flex-wrap gap-1">
	{#each [{ id: 'all', label: 'All' }, ...CATEGORIES] as cat}
		<button
			class="h-7 rounded-lg px-2.5 text-xs transition {category === cat.id
				? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
				: 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-850'}"
			type="button"
			on:click={() => (category = cat.id === 'all' ? 'all' : (cat.id as ConnectorCategory))}
		>
			{categoryLabel(cat.id)}
		</button>
	{/each}
</div>

{#each shelves as shelf (shelf.key)}
	<section class="mb-6">
		{#if shelf.title}
			<h3 class="mb-2 text-xs text-gray-500">{shelf.title}</h3>
		{/if}

		{#if shelf.items.length === 0}
			<div class="py-10 text-center text-xs text-gray-500">
				{$user?.role === 'admin'
					? $i18n.t('No connectors match. You can still add any MCP server as a custom connector.')
					: $i18n.t('No connectors match.')}
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
				{#each shelf.items as connector (connector.id)}
					<button
						class="flex items-start gap-3 rounded-2xl border border-gray-100 px-3.5 py-3 text-left transition hover:bg-gray-50 dark:border-gray-850 dark:hover:bg-gray-850/60"
						type="button"
						on:click={() => onSelect(connector)}
					>
						<ConnectorIcon name={connector.name} />
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-1.5">
								<span class="truncate text-sm text-gray-900 dark:text-white">{connector.name}</span>
								{#if addedCatalogIds.includes(connector.id)}
									<span
										class="shrink-0 rounded-md bg-green-50 px-1.5 text-[0.625rem] text-green-700 dark:bg-green-950/40 dark:text-green-300"
									>
										{$i18n.t('Added')}
									</span>
								{/if}
							</div>
							<div class="line-clamp-2 text-xs text-gray-500">{connector.tagline}</div>
							<div class="mt-1 text-[0.625rem] text-gray-400 dark:text-gray-600">
								{authBadge(connector.auth.type)}
							</div>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</section>
{/each}
