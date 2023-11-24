<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import { signInWithEmail } from '$lib/utils/auth.js';

	let username = '';
	let email = '';
	let password = '';

	export let data;

	let { supabase } = data;
	$: ({ supabase } = data);

	let error = '';
	let disabled = false;

	const handleUserLogin = async () => {
		error = '';
		disabled = true;

		if (!email) error = 'No email given!';
		if (!password) error = 'No password given!';

		if (!!error) return (disabled = false);

		const res = await signInWithEmail(supabase, email, password);
		if (res.error) {
			console.log(res.error);
			error = res.error.toString();
			disabled = false;
			return;
		}

		goto('/');
	};
</script>

<svelte:head>
	<title>Login to Socialzilla</title>
</svelte:head>

<section id="products" class="mt-12">
	<div class="container mx-auto w-10/12 max-w-[1100px] py-10 md:py-20">
		<h2 class="text-left text-2xl font-bold underline-offset-4 lg:text-3xl lg:underline-offset-8">
			Login to <span
				class="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
				>Socialzilla
			</span>:
		</h2>
		<div class="col-8 form-widget mt-10 max-w-sm">
			<div class="">
				<label for="email" class="block font-medium text-gray-300 text-sm">Email:</label>
				<div class="mt-2">
					<input
						{disabled}
						type="email"
						name="email"
						id="email"
						bind:value={email}
						class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md py-2 px-4 bg-neutral-800 text-white"
						placeholder="you@example.com"
					/>
				</div>
			</div>

			<div class="mt-4">
				<label for="password" class="block font-medium text-gray-300 text-sm">Password:</label>
				<div class="mt-2">
					<input
						{disabled}
						type="password"
						name="password"
						id="password"
						placeholder="Password"
						bind:value={password}
						class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md py-2 px-4 bg-neutral-800 text-white"
					/>
				</div>
			</div>

			<div class="error text-red-500 my-4">
				{error}
			</div>

			<div class="mt-8">
				<Button {disabled} on:click={handleUserLogin}>Login</Button>
			</div>

			<div class="mt-8">
				<a href="/signup" class="underline text-neutral-200"> Signup instead </a>
			</div>
		</div>
	</div>
</section>
