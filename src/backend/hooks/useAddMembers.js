// src/hooks/useAddMember.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";

const insertMember = async (formData) => {
  // 1. Register login credentials first (Supabase Auth)
  const {
    data: { user },
    error: registerError,
  } = await supabase.auth.signUp({
    email: formData.loginEmail,
    password: formData.password,
    options: {
      data: {
        full_name: `${formData.f_name} ${formData.m_name} ${formData.l_name}`,
      },
    },
  });

  if (registerError) throw new Error(registerError.message);
  let authID = user.id;
  console.log(user);

  if (!authID) {
    throw new Error(
      "User ID not available yet. Check if email confirmation is required in Supabase Auth settings."
    );
  }
  console.log(authID);
  console.log("Data that will be sent over", formData);
  // 2. Insert into members with the auth user ID
  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert([
      {
        login_id: user.id, // FK from Supabase Auth
        // f_name: formData.f_name,
        // m_name: formData.m_name,
        // l_name: formData.l_name,
        // account_type: formData.account_type,
        // account_status: formData.account_status,
        // address: formData.address,
        // application_date: formData.application_date,
        // description: formData.description,
        // email: formData.loginEmail,
        // sex: formData.sex,
        // contact_number: formData.contact_number,
        // // employment_date: formData.employment_date,
        // birthday: formData.birthday,
        // avatar: formData.avatar,
      },
    ])
    .select()
    .single();
  console.log("members data", member)
  const memberID = member.member_id;
  if (!memberID)
    throw new Error("Failed to retrieve member ID from member table");
  if (memberError) throw new Error(memberError.message);

  // 3. Insert into initial_payments linked to this member
  const { error: paymentError } = await supabase
    .from("initial_payments")
    .insert([
      {
        member_id: memberID, // assumes member has PK `id`
        // membership_fee: formData.membership_fee,
        // initial_share_capital: formData.initial_share_capital,
        // fee_status: formData.fee_status,
        // //payment_date: formData.payment_date,
        // remarks: formData.remarks,
      },
    ]);

  if (paymentError) throw new Error(paymentError.message);

  return { member, authID };
};

export const useAddMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertMember,
    onSuccess: () => {
      queryClient.invalidateQueries(["members"]);
    },
  });
};
