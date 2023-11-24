<script lang="ts">
	import clsx from 'clsx';

	export let label: string = '';
	export let type: 'button' | 'submit' | 'reset' | null | undefined = 'button';
	export let className: string = '';
	export let primary: boolean = false;
	export let disabled: boolean = false;
</script>

<button
	aria-label={label}
	{type}
	title={label}
	on:click
	class={clsx(
		'custom-border flex items-center justify-center gap-1.5 rounded border border-light-1/40 bg-light-1/10 py-2 px-4 text-center text-sm font-medium text-light-1 duration-75 hover:bg-light-1/20 hover:text-light-1',
		primary && 'primary border-highlight bg-highlight text-white hover:bg-highlight',
		disabled && 'cursor-not-allowed opacity-50',
		className
	)}
	{disabled}
>
	<slot />
</button>
