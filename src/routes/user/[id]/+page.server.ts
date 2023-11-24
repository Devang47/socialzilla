import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals: { supabase, getSession }, url, params }) => {
	const session = await getSession();

	if (!session) {
		throw redirect(303, '/login');
	}

	const { id } = params;

	const { data: profile } = await supabase.from('users').select().eq('username', id).single();

	const userData = ((
		await supabase
			.from('users')
			.select()
			.eq('email', session?.user.email)
	).data || [])[0];

	return { session, profile, userData };
};
