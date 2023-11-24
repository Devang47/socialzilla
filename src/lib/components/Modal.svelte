<script lang="ts">
	import { clickOutside } from '$lib/utils/useClickOutside';
	import clsx from 'clsx';
	import { fade, scale } from 'svelte/transition';

	export let onClose: () => void;
	export let className = '';
</script>

<section transition:fade={{ duration: 200 }}>
	<div
		transition:scale={{ start: 0.9, opacity: 0, duration: 200 }}
		use:clickOutside={onClose}
		class={clsx('modal', className)}
	>
		<slot />
	</div>
</section>

<style lang="postcss">
	section {
		@apply bg-black/80 flex items-center justify-center fixed inset-0 w-full h-full z-50;
	}

	.modal {
		@apply px-8 py-5 bg-neutral-800 rounded-xl w-fit h-fit min-h-[300px];
	}
</style>
