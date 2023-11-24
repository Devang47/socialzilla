<script lang="ts">
	import { goto } from '$app/navigation';
	import Post from '$lib/components/Post.svelte';
	import Comments from '$lib/sections/Comments.svelte';
	import { isLoading } from '$lib/stores/index.js';
	import { getAuthorDetails } from '$lib/utils/post.js';

	export let data;

	let { session, supabase, postData, userData } = data;
	$: ({ session, supabase, postData, userData } = data);

	let postExists = !!postData;

	let isShowCommentsWindowOpen = '';
	const handleShowComments = (id: string) => {
		isShowCommentsWindowOpen = id;
	};

	const handleDeletepost = async (id: string) => {
		$isLoading = true;
		await supabase.from('comments').delete().match({
			post_id: id
		});
		await supabase.from('likes').delete().match({
			post_id: id
		});
		await supabase.from('posts').delete().match({
			id: id
		});
		$isLoading = false;
		goto('/', { replaceState: true });
	};
</script>

<svelte:head>
	<title>Post | Socialzilla</title>
</svelte:head>

{#if postExists}
	<section class="posts !mt-40 max-w-xl mx-auto">
		{#await getAuthorDetails(supabase, postData.user_id) then data}
			<Post
				{handleDeletepost}
				openComments={handleShowComments}
				{supabase}
				{userData}
				data={{ ...postData, userName: data, session }}
			/>
		{/await}
	</section>
{:else}
	<div class="text-2xl text-center text-white my-10">Post doesn't exists</div>
{/if}

{#if isShowCommentsWindowOpen}
	<Comments
		{supabase}
		postId={isShowCommentsWindowOpen}
		onClose={() => (isShowCommentsWindowOpen = '')}
		userId={userData?.id ?? ''}
	/>
{/if}
