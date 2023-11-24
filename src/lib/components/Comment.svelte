<script lang="ts">
	import { clickOutside } from '$lib/utils/useClickOutside';
	import { slide } from 'svelte/transition';

	let optionsMenuOpen = false;
	export let userId: string;
	export let data: any;

	export let handleDeleteComment: (id: string) => void;
</script>

<div class="relative">
	<div class="text-neutral-100 font-medium flex items-center gap-4">
		<span>
			{data.userName}
		</span>
		<div class="published-date text-neutral-400 text-xs">
			{new Date(data.created_at).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			})} at
			{new Date(data.created_at).toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: '2-digit'
			})}
		</div>
	</div>
	<div class="text-neutral-300 text-sm mt-1.5">
		{data.content}
	</div>

	{#if userId && data.user_id === userId}
		<button
			class="options !top-0 !right-0"
			on:click|stopPropagation={() => (optionsMenuOpen = true)}
		>
			{#each new Array(2) as _}
				<span />
			{/each}

			{#if optionsMenuOpen}
				<div
					use:clickOutside={() => {
						optionsMenuOpen = false;
					}}
					class="options-menu"
					transition:slide={{ duration: 200 }}
				>
					<button on:click|self={() => handleDeleteComment(data.id)}>Delete</button>
				</div>
			{/if}
		</button>
	{/if}
</div>
