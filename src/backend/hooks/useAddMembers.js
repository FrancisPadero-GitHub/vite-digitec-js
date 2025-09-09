import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";

/**
 *  !! MAJOR PROBLEM !! IT NEEDS ADMIN AUTH FOR MEMBER MANAGEMENT 
 * 
 * Insert a new member with:
 * 1. Supabase Auth account (login credentials)
 * 2. Member profile in "members" table
 * 3. Initial payment in "initial_payments" table
 */
const insertMember = async (formData) => {
  /**  --- Build structured payload ---
   * This is to double check the data that will be sent kay wala man ta ga typescript kay yawa mn ang typescript :>
   */
  const payload = {
    // auth: {
    //   email: formData.loginEmail,
    //   password: formData.password,
    //   full_name: `${formData.f_name} ${formData.m_name} ${formData.l_name}`,
    // },
    member: {
      login_id: null,
      f_name: formData.f_name || null,
      m_name: formData.m_name || null,
      l_name: formData.l_name || null,
      account_type: formData.account_type || null,
      account_status: formData.account_status || null,
      address: formData.address || null,
      application_date: formData.application_date || null,
      description: formData.description || null,
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

  // --- 1. Create Supabase Auth user ---
  // Temporarily Disabled due to it needs to have a authentication admin for it to add new users without logging out the current use logged in
  // const {
  //   data: { user },
  //   error: registerError,
  // } = await supabase.auth.signUp({
  //   email: payload.auth.email,
  //   password: payload.auth.password,
  //   options: { data: { full_name: payload.auth.full_name } },
  // });

  // if (registerError) {
  //   throw new Error(`Auth signup failed: ${registerError.message}`);
  // }
  // if (!user?.id) {
  //   throw new Error(
  //     "Auth signup succeeded but no user ID returned. Email confirmation may be required in Supabase settings."
  //   );
  // }
  // const authID = user.id;

  // --- 2. Insert into "members" table ---
  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert([{ ...payload.member }])
    .select() // After you insert, also return the inserted row(s) for the onSuccess to work
    .single(); // Expecting only a single row to return its gonna return an error if it returns a multiple rows

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
  return member ; //authID
};

/**
 * Custom hook: useAddMember
 * Handles mutation for adding a new member with auth + DB inserts.
 */
export const useAddMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertMember,
    onSuccess: (member) => {
      console.log("Member data that is being returned from :  ", member)
      // Invalidate members query so UI refreshes with new data
      queryClient.invalidateQueries(["members"]); // no specific ID cause queries for all data 
    },
    onError: (error) => {
      // Optional: Log or send to error monitoring service
      console.error("Add member failed:", error.message);
    },
  });
};
