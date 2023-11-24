<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Post from '$lib/components/Post.svelte';
	import Comments from '$lib/sections/Comments.svelte';
	import CreatePost from '$lib/sections/CreatePost.svelte';
	import { isLoading } from '$lib/stores/index.js';
	import { getAuthorDetails } from '$lib/utils/post';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
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

	let newUsersData: any[] = [];
	const getNewUsers = async () => {
		const { data } = await supabase
			.from('users')
			.select()
			.limit(10)
			.order('created_at', { ascending: false });

		newUsersData = data || [];
	};

	let isPlusIconVisible = false;
	onMount(() => {
		getNewUsers();
		window.addEventListener('scroll', () => {
			if (window.scrollY > 350) {
				isPlusIconVisible = true;
			} else isPlusIconVisible = false;
		});
	});
</script>

{#if isPlusIconVisible}
	<button
		on:click={() => (isCreateTweetModalOpen = true)}
		transition:fade={{ duration: 100 }}
		class="bg-neutral-700 hover:bg-neutral-600 border border-white/10 rounded-full p-3 fixed bottom-8 right-8"
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24"
			><path fill="currentColor" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" /></svg
		>
	</button>
{/if}

<section>
	<div class="container">
		<div class="text-neutral-300 font-medium mt-6 px-4">Most active users on Socialzilla:</div>
		<div class="w-full overflow-x-scroll py-4 px-4">
			<div class="flex items-center justify-center gap-6 w-fit whitespace-nowrap">
				{#each newUsersData as user}
					<a href={`/user/${user.username}`}>
						<div
							class="py-4 h-32 w-48 truncate px-6 text-center rounded-md border border-white/20 bg-black/50 backdrop-blur"
						>
							<img
								class="w-14 h-14 rounded-full overflow-hidden mx-auto"
								src={user.image ?? 'https://placehold.co/400x400'}
								alt={user.username}
							/>
							<div class="mt-3 text-neutral-300">
								{user.username}
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>

		{#if session?.user}
			<div class="ml-auto px-5 mt-10 w-fit">
				<Button on:click={() => (isCreateTweetModalOpen = true)}>Create post +</Button>
			</div>
		{/if}

		<h3 class="px-4 text-left mt-10 font-medium text-neutral-300">Latest posts on Socialzilla:</h3>
		<div class="posts !mt-2">
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
		@apply max-w-3xl mx-auto mt-[87px] py-5 sm:px-8 pb-20  h-full overflow-hidden relative w-full;
	}
</style>
