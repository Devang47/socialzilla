import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ locals: { supabase, getSession } }) => {
	let session = await getSession();

	const { data: posts } = await supabase
		.from('posts')
		.select()
		.order('created_at', { ascending: false });
	const userData = ((
		await supabase
			.from('users')
			.select()
			.eq('email', session?.user.email)
	).data || [])[0];
	console.log(posts);
	return { posts, userData };
};
