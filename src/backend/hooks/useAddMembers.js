import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";

/**
 * Insert a new member with:
 * 1. Supabase Auth account (via Edge Function, admin auth)
 * 2. Member profile in "members" table
 * 3. Initial payment in "initial_payments" table
 */
const insertMember = async (formData) => {
  // --- Build structured payload ---
  const payload = {
    member: {
      login_id: null,
      f_name: formData.f_name || null,
      m_name: formData.m_name || null,
      l_name: formData.l_name || null,
      account_type: formData.account_type || null,
      account_status: formData.account_status || null,
      address: formData.address || null,
      application_date: formData.application_date || null,
      email: formData.email || null,
      sex: formData.sex || null,
      contact_number: formData.contact_number || null,
      employment_status: formData.employment_status || null,
      birthday: formData.birthday || null,
    },
    payment: {
      membership_fee: formData.membership_fee || null,
      initial_share_capital: formData.initial_share_capital || null,
      fee_status: formData.fee_status || null,
      payment_date: formData.payment_date || null,
      remarks: formData.remarks || null,
    },
  };

  // --- 1. Create Auth user via Edge Function ---
const session = await supabase.auth.getSession(); // gets the session key for the logged in admin account

const response = await fetch(
  "https://kvsyknteyxhyjbogbaya.supabase.co/functions/v1/create-user",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.data.session?.access_token}`,
    },
    body: JSON.stringify({
      email: formData.loginEmail,
      password: formData.password,
      full_name: `${formData.f_name} ${formData.l_name}`,
    }),
  }
);
  const result = await response.json();
  console.log("User Created: ", result.user)
  await supabase.inviteUserByEmail(formData.loginEm);
  if (result.error) throw new Error(result.error);
  
  const authUser = result.user; // contains Supabase Auth user info

  // --- 2. Insert into "members" table, linking login_id = authUser.id ---
  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert([{ ...payload.member, login_id: authUser.id }])
    .select()
    .single();

  if (memberError) {
    throw new Error(`Failed to insert member: ${memberError.message}`);
  }
  if (!member?.member_id) {
    throw new Error("Member insertion returned no member_id.");
  }

  // --- 3. Insert into "initial_payments" table ---
  const { error: paymentError } = await supabase
    .from("initial_payments")
    .insert([{ ...payload.payment, member_id: member.member_id }]);

  if (paymentError) {
    throw new Error(`Failed to insert payment: ${paymentError.message}`);
  }

  // --- Final success ---
  return member;
};

/**
 * Custom hook: useAddMember
 */
export const useAddMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertMember,
    onSuccess: (member) => {
      console.log("New member created:", member);
      queryClient.invalidateQueries(["members"]); // refreshes UI
    },
    onError: (error) => {
      console.error("Add member failed:", error.message);
    },
  });
};
