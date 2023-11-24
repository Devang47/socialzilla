<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { isLoading } from '$lib/stores';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import toast from 'svelte-french-toast';

	export let supabase: SupabaseClient;
	export let userData: any;
	export let onClose: any;

	let content = '';
	let file: HTMLInputElement;
	let formError = '';
	let loading = false;

	const handleCreatePost = async () => {
		if (!userData) return toast('You need to login to continue this action!');

		loading = true;
		$isLoading = true;
		if (!content.trim()) {
			formError = 'No content';
			loading = false;
			return;
		}
		let imageUrl = null;

		formError = '';
		if (file.files?.length) {
			const { data: fileRes, error: fileErr } = await supabase.storage
				.from('images')
				.upload(`public/${Math.random()}.png`, file.files[0], {
					cacheControl: '3600',
					upsert: true
				});
			if (fileErr || !fileRes) return;

			const { data: publicImageLink } = supabase.storage.from('images').getPublicUrl(fileRes.path);
			imageUrl = publicImageLink.publicUrl;
		}

		const { data, error } = await supabase.from('posts').insert({
			content,
			image: imageUrl,
			user_id: userData.id
		});

		$isLoading = false;
		loading = false;
		content = '';

		onClose('refresh');
	};
</script>

<Modal {onClose}>
	<h2 class="text-2xl font-bold">Create Post</h2>

	<div class="mt-6">
		<textarea
			disabled={loading}
			name="content"
			id="content"
			cols="30"
			rows="5"
			maxlength="100"
			bind:value={content}
			placeholder="Start writing something..."
			class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block border-neutral-600 rounded-md py-2 px-4 bg-neutral-700/50 text-white border w-[400px] max-w-[90vw]"
		></textarea>
		<div class="text-sm mt-2 w-fit ml-auto">
			{content.length} / 100
		</div>

		<div class="">
			<input
				disabled={loading}
				type="file"
				bind:this={file}
				accept="image/png, image/gif, image/jpeg"
			/>
		</div>

		<div class="error text-red-500 my-4">
			{formError}
		</div>

		<div class="mt-10">
			<Button bind:disabled={loading} on:click={handleCreatePost}>Create</Button>
		</div>
	</div>
</Modal>
