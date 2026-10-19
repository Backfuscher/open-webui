<script context="module" lang="ts">
	// Discovery opens an MCP session, so keep results while the page lives.
	const specsCache: Record<string, { name: string; description?: string }[]> = {};
</script>

<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	import { settings } from '$lib/stores';
	import { getToolSpecs } from '$lib/apis/tools';
	import { updateUserSettings } from '$lib/apis/users';

	import Switch from '$lib/components/common/Switch.svelte';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import Tooltip from '$lib/components/common/Tooltip.svelte';

	const i18n = getContext('i18n') as any;

	export let toolId: string;
	// Whole server is switched off for this chat; individual choices still save.
	export let serverEnabled = true;
	// 'settings' has room for descriptions and larger rows.
	export let variant: 'menu' | 'settings' = 'menu';

	let specs: { name: string; description?: string }[] | null = specsCache[toolId] ?? null;
	let error = '';

	$: disabledTools = new Set<string>($settings?.mcpDisabledTools?.[toolId] ?? []);

	const loadSpecs = async () => {
		error = '';
		try {
			specs = await getToolSpecs(localStorage.token, toolId);
			specsCache[toolId] = specs ?? [];
		} catch (err: any) {
			error = err?.status === 401 ? $i18n.t('Auth required') : $i18n.t('Unable to load tools');
		}
	};

	const toggleTool = async (name: string) => {
		const next = new Set(disabledTools);
		if (next.has(name)) {
			next.delete(name);
		} else {
			next.add(name);
		}
		await saveDisabledTools(next);
	};

	const saveDisabledTools = async (next: Set<string>) => {
		const mcpDisabledTools = { ...($settings?.mcpDisabledTools ?? {}) };
		if (next.size > 0) {
			mcpDisabledTools[toolId] = [...next];
		} else {
			delete mcpDisabledTools[toolId];
		}

		settings.set({ ...$settings, mcpDisabledTools });
		await updateUserSettings(localStorage.token, { ui: { mcpDisabledTools } }).catch((err) => {
			toast.error(`${err}`);
		});
	};

	onMount(() => {
		if (specs === null) {
			loadSpecs();
		}
	});
</script>

<div
	class="flex flex-col gap-0.5 {variant === 'menu'
		? 'ml-5 pl-1.5 border-l border-gray-100 dark:border-gray-800 my-0.5'
		: ''}"
>
	{#if error}
		<div class="flex items-center justify-between px-2 text-xs text-gray-500 h-[1.6875rem]">
			<span class="truncate">{error}</span>
			<button class="underline shrink-0" type="button" on:click={loadSpecs}>
				{$i18n.t('Retry')}
			</button>
		</div>
	{:else if specs === null}
		<div class="flex items-center px-2 h-[1.6875rem]">
			<Spinner className="size-3.5" />
		</div>
	{:else if specs.length === 0}
		<div class="px-2 text-xs text-gray-500 h-[1.6875rem] flex items-center">
			{$i18n.t('No tools found')}
		</div>
	{:else}
		<div class="px-2 text-[0.6875rem] text-gray-500 flex items-center justify-between gap-2">
			<span>
				{$i18n.t('{{COUNT}} of {{TOTAL}} enabled', {
					COUNT: specs.filter((spec) => !disabledTools.has(spec.name)).length,
					TOTAL: specs.length
				})}
			</span>
			{#if specs.length > 1}
				<button
					class="hover:text-gray-700 dark:hover:text-gray-300 transition"
					type="button"
					on:click={(e) => {
						e.stopPropagation();
						saveDisabledTools(
							disabledTools.size > 0 ? new Set() : new Set(specs?.map((spec) => spec.name))
						);
					}}
				>
					{disabledTools.size > 0 ? $i18n.t('Enable all') : $i18n.t('Disable all')}
				</button>
			{/if}
		</div>
		{#each specs as spec (spec.name)}
			<button
				class="flex w-full justify-between gap-2 items-center px-2 text-xs font-normal cursor-pointer rounded-lg hover:bg-gray-50/40 dark:hover:bg-gray-800/40 {variant ===
				'menu'
					? 'h-[1.5rem]'
					: 'py-1.5'} {serverEnabled ? '' : 'opacity-50'}"
				type="button"
				aria-pressed={!disabledTools.has(spec.name)}
				on:click={(e) => {
					e.stopPropagation();
					toggleTool(spec.name);
				}}
			>
				{#if variant === 'settings'}
					<div class="flex-1 min-w-0 text-left">
						<div class="truncate font-mono">{spec.name}</div>
						{#if spec.description}
							<div class="line-clamp-2 text-gray-500">{spec.description}</div>
						{/if}
					</div>
				{:else}
					<Tooltip
						content={spec.description ?? ''}
						allowHTML={false}
						placement="top-start"
						className="flex-1 min-w-0"
					>
						<div class="truncate text-left font-mono">{spec.name}</div>
					</Tooltip>
				{/if}
				<div class="shrink-0" inert>
					<Switch state={!disabledTools.has(spec.name)} />
				</div>
			</button>
		{/each}
	{/if}
</div>
