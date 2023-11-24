<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Comment from '$lib/components/Comment.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingIcon from '$lib/icons/LoadingIcon.svelte';
	import { getAuthorDetails } from '$lib/utils/post';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { onMount } from 'svelte';

	export let supabase: SupabaseClient;
	export let onClose = () => {};
	export let userId: string;
	export let postId: string;

	let loading = false;
	let comments: {
		user_id: string;
		post_id: string;
		id: string;
	}[] = [];
	let content = '';
	let formError = '';

	const handleDeleteComment = async (id: string) => {
		loading = true;
		await supabase.from('comments').delete().match({ id });

		await loadComments();
		loading = false;
	};

	const loadComments = async () => {
		const { data } = await supabase
			.from('comments')
			.select()
			.eq('post_id', postId)
			.order('created_at', { ascending: false });
		comments = data ?? [];
		loading = false;
	};

	const addComment = async () => {
		if (!content.trim()) return;
		loading = true;

		const { data } = await supabase.from('comments').insert({
			user_id: userId,
			content: content,
			post_id: postId
		});
		content = '';

		await loadComments();

		loading = false;
	};

	onMount(() => {
		loadComments();
	});
</script>

<Modal className="!max-w-[90vw] !w-[32rem]  !min-h-[400px] !px-2" {onClose}>
	<h2 class="text-2xl font-bold px-3">Comments</h2>

	<div class="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 px-3">
		<input
			disabled={loading}
			bind:value={content}
			class="px-4 py-2 rounded-md w-full text-sm"
			type="text"
			placeholder="Add comment ..."
		/>
		<Button bind:disabled={loading} on:click={addComment}>Comment</Button>
	</div>

	<div class="error text-red-500 my-4">
		{formError}
	</div>

	{#if loading}
		<div class="h-32 grid place-items-center">
			<LoadingIcon />
		</div>
	{:else if !comments.length}
		<div class="my-10 text-center">No comments</div>
	{:else}
		<div class="grid grid-cols-1 px-4 overflow-scroll h-full max-h-[400px] gap-6 mt-8">
			{#each comments as comment}
				{#await getAuthorDetails(supabase, Number(comment.user_id)) then data}
					<Comment data={{ ...comment, userName: data }} {userId} {handleDeleteComment} />
				{/await}
			{/each}
		</div>
	{/if}
</Modal>
