<script lang="ts">
	import '$lib/styles/tailwind.scss';
	import '$lib/styles/posts.scss';
	import '$lib/styles/profile.scss';

	import { afterNavigate, invalidate } from '$app/navigation';
	import { Toaster } from 'svelte-french-toast';
	import { onMount } from 'svelte';
	import { isLoading } from '$lib/stores/index.js';
	import LoadingScreenDefault from '$lib/pages/LoadingScreenDefault.svelte';
	import clsx from 'clsx';
	import { navigating } from '$app/stores';

	export let data;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	$isLoading = true;
	onMount(() => {
		$isLoading = false;
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});

	let userData: any;
	onMount(async () => {
		userData = ((await supabase.from('users').select().eq('email', session?.user.email)).data ||
			[])[0];
	});

	afterNavigate(async () => {
		$isLoading = false;
	});

	let searchInput: string = '';
	let searchResults: any[] | null = [];
	const handleSearchUsers = async () => {
		if (!searchInput.trim()) {
			searchBoxOpen = false;
			return;
		} else searchBoxOpen = true;

		const { data: users } = await supabase
			.from('users')
			.select()
			.like('username', `%${searchInput.toLowerCase()}%`);
		const { data: posts } = await supabase
			.from('posts')
			.select()
			.like('content', `%${searchInput.toLowerCase()}%`);
		searchResults = [...(users || []), ...(posts || [])];
	};
	let searchBoxOpen = false;
	let openMobileMenu = false;
</script>

<svelte:head>
	<title>Socialzilla</title>
</svelte:head>

{#if $isLoading}
	<LoadingScreenDefault />
{/if}

<Toaster />

<div class="fixed top-0 inset-x-0 z-30">
	<div class="relative bg-black/70 border-b-white/20 backdrop-blur-lg">
		<div class="max-w-7xl mx-auto px-4 sm:px-6">
			<div class="flex justify-between items-center py-4">
				<div class="flex justify-start">
					<a href="/">
						<span class="sr-only">Workflow</span>
						<div
							class="font-sans text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
						>
							Socialzilla
						</div>
					</a>
				</div>

				<div class="block md:hidden z-50">
					<button
						class="text-white p-1 rounded px-2"
						on:click={() => (openMobileMenu = !openMobileMenu)}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 50 50">
							<path
								stroke="white"
								d="M 0 9 L 0 11 L 50 11 L 50 9 Z M 0 24 L 0 26 L 50 26 L 50 24 Z M 0 39 L 0 41 L 50 41 L 50 39 Z"
							></path>
						</svg>
					</button>
				</div>

				<div
					class={clsx(
						openMobileMenu
							? 'fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-start pt-32 gap-4 md:relative md:flex-row'
							: 'hidden',
						'md:flex-row md:flex md:justify-between md:w-full md:pl-20'
					)}
				>
					<div class="relative w-full max-w-[80vw] md:w-[30vw] mx-auto md:mx-0">
						<input
							class="px-4 py-2.5 pl-10 w-full rounded-md bg-neutral-800 text-white text-[15px]"
							placeholder="Search users or posts"
							type="text"
							bind:value={searchInput}
							on:input={handleSearchUsers}
							on:focusin={() => (searchBoxOpen = true)}
							on:focusout={() => {
								if (!searchInput.trim()) searchBoxOpen = false;
							}}
						/>

						{#if searchBoxOpen}
							<div
								class="absolute top-[100%] left-0 w-full bg-neutral-900 pt-4 py-2 rounded-b-md border-t border-neutral-600"
							>
								<span class="text-sm px-4"> Results: </span>

								{#if !searchResults || !searchResults.length}
									<div class="px-4 text-sm py-2">No results</div>
								{:else}
									<div class="grid grid-cols-1 gap-2 mt-2 max-h-[250px] overflow-y-scroll px-4">
										{#each searchResults as entity}
											<a
												href={entity.username ? `/user/${entity.username}` : `/post/${entity.id}`}
												target="_blank"
												class="py-2 px-4 bg-white/5 rounded-md truncate flex items-center justify-between"
											>
												<span> {entity.username ?? entity.content} </span>

												{#if entity.username}
													<span
														class="bg-green-400/30 text-white text-xs rounded ml-auto py-0.5 px-1 font-medium"
													>
														User
													</span>
												{:else}
													<span
														class="bg-red-400/30 text-white text-xs rounded ml-auto py-0.5 px-1 font-medium"
													>
														Post
													</span>
												{/if}
											</a>
										{/each}
									</div>
								{/if}
							</div>
						{/if}

						<div class="absolute left-3 top-3 pointer-events-none">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 50 50">
								<path
									stroke="white"
									d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z"
								></path>
							</svg>
						</div>
					</div>

					<div class="flex mt-10 md:mt-0 items-center justify-end gap-3 md:gap-4 font-semibold">
						{#if !session}
							<a
								href="/login"
								class="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
							>
								Login
							</a>
						{:else}
							<a
								href={`/user/${userData?.username}`}
								class="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-neutral-800"
							>
								Account
							</a>
							<a
								href="/logout"
								class="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700"
							>
								Logout
							</a>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<slot />
