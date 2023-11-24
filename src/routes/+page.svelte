<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Post from '$lib/components/Post.svelte';
	import Comments from '$lib/sections/Comments.svelte';
	import CreatePost from '$lib/sections/CreatePost.svelte';
	import { isLoading } from '$lib/stores/index.js';
	import { getAuthorDetails } from '$lib/utils/post';
	export let data;

	let { supabase, session, userData, posts } = data;

	let isCreateTweetModalOpen = false;
	let isShowCommentsWindowOpen = '';

	const handleShowComments = (id: string) => {
		isShowCommentsWindowOpen = id;
	};

	const handlePostCreate = async (status?: string) => {
		if (status === 'refresh') {
			$isLoading = true;
			const { data } = await supabase
				.from('posts')
				.select()
				.order('created_at', { ascending: false });
			posts = data;
			$isLoading = false;
		}
		isCreateTweetModalOpen = false;
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

		posts = posts.filter((post: any) => post.id != id);
		$isLoading = false;
	};
</script>

<section>
	<div class="container">
		{#if session?.user}
			<div class="ml-auto px-5 mt-10 w-fit">
				<Button on:click={() => (isCreateTweetModalOpen = true)}>Create +</Button>
			</div>
		{/if}

		<h3 class="px-4 text-left mt-10 font-medium">Latest posts on Socialzilla:</h3>
		<div class="posts !mt-4">
			{#each posts as post}
				{#await getAuthorDetails(supabase, post.user_id) then data}
					<Post
						{handleDeletepost}
						openComments={handleShowComments}
						{supabase}
						{userData}
						data={{ ...post, userName: data, session }}
					/>
				{/await}
			{/each}
		</div>
	</div>
</section>

{#if isCreateTweetModalOpen && session?.user}
	<CreatePost onClose={handlePostCreate} {supabase} {userData} />
{/if}

{#if isShowCommentsWindowOpen}
	<Comments
		{supabase}
		postId={isShowCommentsWindowOpen}
		onClose={() => (isShowCommentsWindowOpen = '')}
		userId={userData?.id ?? ''}
	/>
{/if}

<style lang="postcss">
	.container {
		@apply max-w-2xl mx-auto mt-[87px] py-5 sm:px-8 pb-20  h-full overflow-hidden relative w-full;
	}
</style>
