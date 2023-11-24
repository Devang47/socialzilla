<script lang="ts">
	import clsx from 'clsx';
	// import Rect1 from '$lib/icons/Rect1.svelte';
	// import Circle1 from '$lib/icons/Circle1.svelte';

	export let large: boolean = false;
	export let className: string = '';
	export let noBgImages: boolean = false;
</script>

<div
	class={clsx(
		'relative overflow-hidden rounded-[12px] border border-white/10 bg-black bg-opacity-[20%] py-4 px-6',
		className
	)}
>
	<slot />
</div>
