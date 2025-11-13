
import { supabase } from "../../supabase";
import { useMutation } from "@tanstack/react-query";

/**
 * useResetPass - Hook to update user password after clicking reset link
 * @returns {object} mutation object from TanStack Query
 */
export function useResetPass() {
	const mutation = useMutation({
		mutationFn: async (newPassword) => {
			const { error } = await supabase.auth.updateUser({
				password: newPassword
			});
			if (error) throw error;
			return true;
		},
	});
	return mutation;
}
