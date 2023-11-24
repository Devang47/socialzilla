import { supabase } from '@supabase/auth-ui-shared';

export const load = async ({ locals: { getSession, supabase } }) => {
	let session = await getSession();

	return {
		session
	};
};
