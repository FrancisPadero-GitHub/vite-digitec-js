
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
		onSuccess: () => {
			console.log("Password reset successful");
			sessionStorage.removeItem("recovery_mode"); // removes the recovery mode flag from storage\
			console.log("Recovery mode flag removed from session storage: STATE ", sessionStorage.getItem("recovery_mode"));
		}
	});
	return mutation;
}
