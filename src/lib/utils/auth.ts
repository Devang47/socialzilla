import type { SupabaseClient } from '@supabase/supabase-js';
import bcryptjs from 'bcryptjs';

export async function signUpNewUser(
	supabase: SupabaseClient,
	email: string,
	password: string,
	username: string
) {
	const { data: isEmailUsed } = await supabase.from('users').select().eq('email', email);
	if (isEmailUsed?.length) return { error: 'email already exists', data: {} };

	const { data: isUsernameUsed } = await supabase.from('users').select().eq('username', username);
	if (isUsernameUsed?.length) return { error: 'username already exists', data: {} };

	await supabase.from('users').insert({ email, username });
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: 'https://socialzilla.vercel.app/'
		}
	});

	return { data, error: error };
}

export async function signInWithEmail(supabase: SupabaseClient, email: string, password: string) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password
	});

	return { data, error };
}
