<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Post from '$lib/components/Post.svelte';
	import LoadingIcon from '$lib/icons/LoadingIcon.svelte';
	import { onMount } from 'svelte';
	import Comments from '$lib/sections/Comments.svelte';
	import QRCode from 'qrcode';
	import { isLoading } from '$lib/stores/index.js';

	export let data;

	let posts: any[] = [];
	let { session, supabase, profile, userData } = data;
	$: ({ session, supabase, profile, userData } = data);

	let userExists = !!profile;
	let loading = true;

	let isShowCommentsWindowOpen = '';

	const handleShowComments = (id: string) => {
		isShowCommentsWindowOpen = id;
	};

	const loadPosts = async () => {
		const { data } = await supabase
			.from('posts')
			.select()
			.eq('user_id', profile.id)
			.order('created_at', { ascending: false });
		posts = data ?? [];
		loading = false;
	};

	let isFollowedByUser = false;
	let isFollowLoading = true;
	onMount(async () => {
		$isLoading = false;
		await loadPosts();

		const { data: followRecord } = await supabase
			.from('follows')
			.select()
			.eq('follower', userData.id)
			.eq('user', profile.id);
		isFollowedByUser = !!followRecord?.length;

		isFollowLoading = false;
	});

	const handleChangeInFollow = async () => {
		if (isFollowedByUser) {
			isFollowedByUser = false;
			profile.followers--;

			supabase
				.from('users')
				.update({
					followers: profile.followers
				})
				.eq('id', profile.id);

			supabase.from('follows').delete().match({
				follower: userData?.id,
				user: profile.id
			});
		} else {
			isFollowedByUser = true;
			profile.followers++;

			supabase
				.from('users')
				.update({
					followers: profile.followers
				})
				.eq('id', profile.id);

			supabase.from('follows').insert({
				follower: userData?.id,
				user: profile.id
			});
		}
	};

	let file: HTMLInputElement;
	let profileChangeloader = false;
	const handleChangeProfilePic = async () => {
		if (file.files?.length) {
			profileChangeloader = true;
			const { data: fileRes, error: fileErr } = await supabase.storage
				.from('images')
				.upload(`public/${Math.random()}.png`, file.files[0], {
					cacheControl: '3600',
					upsert: true
				});
			if (fileErr || !fileRes) return;

			const { data: publicImageLink } = supabase.storage.from('images').getPublicUrl(fileRes.path);
			let imageUrl = publicImageLink.publicUrl;

			await supabase
				.from('users')
				.update({
					image: imageUrl
				})
				.eq('id', userData.id);

			profile.image = imageUrl;

			profileChangeloader = false;
		}
	};

	let canvasEl: HTMLCanvasElement;
	onMount(() => {
		QRCode.toCanvas(canvasEl, `https://socialzilla.vercel.app/user/${profile.username ?? ''}`, {
			width: 250,
			color: {
				dark: '#fff',
				light: '#00000000'
			}
		});
	});

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
		posts = posts.filter((post) => post.id != id);
		$isLoading = false;
	};
</script>

{#if userExists}
	<section id="user-data">
		<div class="banner">
			<img src="/images/{Math.floor(Math.random() * 4)}.png" alt="" />
		</div>

		<div class="dp">
			{#if userData && profile.id === userData?.id}
				<label class="cursor-pointer" for="profile-pic">
					<input
						disabled={loading}
						type="file"
						id="profile-pic"
						name="profile-pic"
						class="sr-only"
						on:change={handleChangeProfilePic}
						bind:this={file}
						accept="image/png, image/gif, image/jpeg"
					/>
					<img
						src={profile?.image ?? 'https://placehold.co/400x400'}
						alt={'photo of ' + profile?.username}
						referrerpolicy="no-referrer"
					/>
					{#if profileChangeloader}
						<div class="absolute inset-0 bg-black/70 grid place-items-center">
							<LoadingIcon />
						</div>
					{:else}
						<div
							class="absolute bottom-0 inset-x-0 bg-black/70 text-center text-white text-sm font-bold py-2 pb-4"
						>
							Change
						</div>
					{/if}
				</label>
			{:else}
				<img
					src={profile?.image ?? 'https://placehold.co/400x400'}
					alt={'photo of ' + profile?.username}
					referrerpolicy="no-referrer"
				/>
			{/if}
		</div>

		<div class="user-name">
			{profile?.username}
		</div>
		<div class="text-sm text-center mt-2 text-neutral-300">
			Total friends: {profile?.followers}
		</div>

		<div class="w-fit mx-auto">
			<canvas bind:this={canvasEl}> </canvas>
		</div>

		{#if userData && isFollowLoading}
			<Button className="mx-auto mt-6">
				<LoadingIcon />
			</Button>
		{:else if userData && profile.id != userData.id}
			<Button className="mx-auto mt-6" on:click={handleChangeInFollow}>
				{#if isFollowedByUser}
					<svg xmlns="http://www.w3.org/2000/svg" width="14" viewBox="0 0 30 30">
						<path
							d="M 26.980469 5.9902344 A 1.0001 1.0001 0 0 0 26.292969 6.2929688 L 11 21.585938 L 4.7070312 15.292969 A 1.0001 1.0001 0 1 0 3.2929688 16.707031 L 10.292969 23.707031 A 1.0001 1.0001 0 0 0 11.707031 23.707031 L 27.707031 7.7070312 A 1.0001 1.0001 0 0 0 26.980469 5.9902344 z"
							stroke="white"
						></path>
					</svg> Friends
				{:else}Add friend
				{/if}
			</Button>
		{/if}

		{#if loading}
			<div class="my-20 grid place-items-center">
				<LoadingIcon className="w-8 h-8" />
			</div>
		{:else if !posts.length}
			<div class="my-10 text-center">No posts</div>
		{:else}
			<div class="mx-auto max-w-2xl">
				<div class="posts !mt-20">
					{#each posts as post}
						<Post
							{handleDeletepost}
							openComments={handleShowComments}
							{supabase}
							{userData}
							data={{ ...post, userName: profile.username, session }}
						/>
					{/each}
				</div>
			</div>
		{/if}
	</section>
{:else}
	<div class="text-2xl text-center text-white my-10">User doesn't exists</div>
{/if}

{#if isShowCommentsWindowOpen}
	<Comments
		{supabase}
		postId={isShowCommentsWindowOpen}
		onClose={() => (isShowCommentsWindowOpen = '')}
		userId={userData?.id ?? ''}
	/>
{/if}
