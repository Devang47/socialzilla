export const load = async ({ locals: { supabase, getSession }, url, params }) => {
	const session = await getSession();

	const { id } = params;

	const { data: postData } = await supabase.from('posts').select().eq('id', id).single();

	const userData = ((
		await supabase
			.from('users')
			.select()
			.eq('email', session?.user.email)
	).data || [])[0];

	return { session, postData, userData };
};
