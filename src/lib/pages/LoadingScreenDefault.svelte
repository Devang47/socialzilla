<script lang="ts">
	import LoadingIcon from '$lib/icons/LoadingIcon.svelte';
	import { fade } from 'svelte/transition';
</script>

<section
	transition:fade={{ duration: 0.3 }}
	class="fixed inset-0 z-[999] flex h-full w-full items-center justify-center bg-black"
>
	<div class="container w-fit rounded bg-neutral-800 p-3.5">
		<LoadingIcon />
	</div>
</section>
