import type { SupabaseClient } from '@supabase/supabase-js';

export const getAuthorDetails = async (supabase: SupabaseClient, userId: number) => {
	const { data } = await supabase.from('users').select('username').eq('id', userId);

	if (!data) return null;
	return data[0].username;
};

export const getCurrentUser = async (supabase: SupabaseClient, email: string) => {
	const { data } = await supabase.from('users').select('username').eq('email', email);

	if (!data) return null;
	console.log(data);
	return data;
};
