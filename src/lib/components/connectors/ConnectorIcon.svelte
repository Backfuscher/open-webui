<script lang="ts">
	export let name = '';
	export let size: 'md' | 'lg' = 'md';

	// Monogram with a stable color per name; no third-party logo requests.
	const PALETTE = [
		'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
		'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
		'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
		'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
		'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
		'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
		'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
		'bg-gray-100 text-gray-700 dark:bg-gray-850 dark:text-gray-300'
	];

	const hash = (text: string) =>
		[...text].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);

	$: color = PALETTE[hash(name.toLowerCase()) % PALETTE.length];
	$: letter = (name.trim()[0] ?? '?').toUpperCase();
	$: sizeClass = size === 'lg' ? 'size-12 text-lg rounded-xl' : 'size-9 text-sm rounded-lg';
</script>

<div
	class="flex shrink-0 items-center justify-center font-medium select-none {sizeClass} {color}"
	aria-hidden="true"
>
	{letter}
</div>
