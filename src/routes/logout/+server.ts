// src/routes/auth/callback/+server.ts
import { redirect } from '@sveltejs/kit';

export const GET = async ({ url, locals: { supabase, getSession } }) => {
	const session = await getSession();
	if (session) {
		await supabase.auth.signOut();
	}
	throw redirect(303, '/');
};
