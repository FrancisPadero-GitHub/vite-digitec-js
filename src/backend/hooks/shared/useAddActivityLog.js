import { supabase } from "../../supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const insertActivityLog = async ({ action, type }) => {
  //get current authenticated user 
  const { data: { user }, error: authError } = await supabase.auth.getUser(); 
  if (authError || !user) throw new Error("User not authenticated");

  // map auth uuid to member_id
  const { data: memberData, error: memberError } = await supabase
    .from("members")
    .select("member_id")
    .eq("login_id", user.id)
    .single();
  
  if (memberError || !memberData) throw new Error("Failed to fetch member info");

  const { member_id: memberID } = memberData;

  // insert to activity_logs table
  const { data, error } = await supabase
    .from("activity_logs")
    .insert([
      {
        action_member_id: memberID,
        action,
        type
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const useAddActivityLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertActivityLog,
    onSuccess: (data) => {
      console.log("Activity logged:", data);
      queryClient.invalidateQueries({queryKey: ["activity_logs"],
        exact: false
      });
    },
    onError: (error) => {
      console.error("Error logging activity:", error.message);
    },
  });
};
