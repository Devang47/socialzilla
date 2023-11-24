<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade, scale, slide } from 'svelte/transition';
	import { clickOutside } from '$lib/utils/useClickOutside';

	import Heart from '$lib/icons/Heart.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { isLoading } from '$lib/stores';
	import type { Session, SupabaseClient } from '@supabase/supabase-js';
	import clsx from 'clsx';
	import toast from 'svelte-french-toast';

	export let openComments: (id: string) => void;
	export let supabase: SupabaseClient;
	export let userData: any;
	export let data: {
		id: number;
		userName: string;
		user_id: string;
		content: string;
		image: string;
		created_at: string;
		session: Session;
		total_likes: number;
	};
	export let handleDeletepost: (id: string) => void;

	let optionsMenuOpen = false;
	let likedByUser: boolean = false;
	onMount(async () => {
		if (!userData) return;

		const { data: likesData } = await supabase
			.from('likes')
			.select()
			.eq('user_id', userData?.id)
			.eq('post_id', data.id);

		likedByUser = (likesData ?? [])?.length > 0 ? true : false;
	});

	const likepost = async () => {
		if (!userData) return toast('You need to login to continue this action!');

		likedByUser = !likedByUser;

		if (!likedByUser) {
			data.total_likes--;

			Promise.all([
				supabase
					.from('posts')
					.update({
						total_likes: data.total_likes
					})
					.eq('id', data.id),
				supabase.from('likes').delete().match({
					user_id: userData?.id,
					post_id: data.id
				})
			]);
		} else {
			data.total_likes++;
			Promise.all([
				supabase
					.from('posts')
					.update({
						total_likes: data.total_likes
					})
					.eq('id', data.id),
				supabase.from('likes').insert({
					user_id: userData.id,
					post_id: data.id
				})
			]);
		}
	};
</script>

<div class="post w-full" in:scale={{ start: 0.9, opacity: 0.8 }} out:fade={{ duration: 300 }}>
	<div class="post-header">
		<a
			href={`/user/${data.userName}`}
			on:click|preventDefault={() => {
				if (window.location.pathname === '/user/' + data.userName) return;
				isLoading.set(true);
				goto('/user/' + data.userName, { replaceState: true });
			}}
		>
			<h2 class="author w-fit">
				{data.userName}
			</h2>
		</a>
		<div class="published-date">
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

	<p>
		{data.content}
	</p>

	{#if data.image}
		<img
			src={data.image}
			alt={'Image here'}
			class="rounded-md w-full min-h-[300px] bg-neutral-600 mt-3"
		/>
	{/if}

	<div class="action-btns">
		<div class="text-sm">
			Likes: {data.total_likes}
		</div>
		<button class={clsx(likedByUser ? 'likedByUser' : '', 'ml-2')} on:click={likepost}>
			<Heart />
		</button>
		<button on:click={() => openComments(String(data.id))}>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" class="!w-[16px]" viewBox="0 0 24 24"
				><path
					fill="currentColor"
					d="M12 2A10 10 0 0 0 2 12a9.89 9.89 0 0 0 2.26 6.33l-2 2a1 1 0 0 0-.21 1.09A1 1 0 0 0 3 22h9a10 10 0 0 0 0-20Zm0 18H5.41l.93-.93a1 1 0 0 0 0-1.41A8 8 0 1 1 12 20Z"
				/></svg
			>
		</button>
	</div>

	{#if userData && data.user_id === userData?.id}
		<button class="options" on:click|stopPropagation={() => (optionsMenuOpen = true)}>
			{#each new Array(3) as _}
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
					<button on:click|self={() => handleDeletepost(String(data.id))}>Delete</button>
				</div>
			{/if}
		</button>
	{/if}
</div>
