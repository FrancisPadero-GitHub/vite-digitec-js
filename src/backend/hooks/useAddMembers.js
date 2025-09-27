import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";

/**
 * Insert a new member with:
 * 1. Supabase Auth account (via Edge Function, admin auth)
 * 2. Member profile in "members" table
 * 3. Initial payment in "initial_payments" table
 * 
 * ISSUE: Email can't be confirmed therefore it can't be used to login
 * 
 */
const insertMember = async (formData) => {
  // --- Build structured payload ---
// 1. Destructure all fields from formData with null fallbacks
const {
  // members
  f_name = null,
  m_name = null,
  l_name = null,
  account_type = null,
  account_status = null,
  address = null,
  application_date = null,
  email = null,
  sex = null,
  contact_number = null,
  employment_status = null,
  birthday = null,
  // Initial
  membership_fee = null,
  initial_share_capital = null,
  fee_status = null,
  payment_method = null,
  payment_date = null,
  remarks = null,
} = formData;

// 2. Build the nested payload using the destructured variables
const payload = {
  member: {
    // Note: login_id remains null as it doesn't come from formData
    login_id: null,
    f_name,
    m_name,
    l_name,
    account_type,
    account_status,
    address,
    application_date,
    email,
    sex,
    contact_number,
    employment_status,
    birthday,
  },
  payment: {
    membership_fee,
    initial_share_capital,
    fee_status,
    payment_method,
    payment_date,
    remarks,
  },
  // So I just took some of the formData in the payment and pass it through clubFunds since identical ramn sila
  clubFunds: {
    amount: membership_fee,
    category: "Monthly Dues",
    payment_date: payment_date,
    period_start: payment_date,
    period_end: payment_date,
    payment_method: payment_method,
    remarks: "Membership Initial"
  },

  coop: {
    source: "member contribution",
    amount: initial_share_capital,
    category: "Initial",
    contribution_date: payment_date,
    remarks: "Membership Initial"
  }

};

// --- 1. Create Auth user via Edge Function ---
/**
 * 
 * ISSUE: Email can't be confirmed therefore it can't be used to login
 * 
 */
// const session = await supabase.auth.getSession(); // gets the session key for the logged in admin account

// const response = await fetch(
//   "https://kvsyknteyxhyjbogbaya.supabase.co/functions/v1/create-user",
//   {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${session.data.session?.access_token}`,
//     },
//     body: JSON.stringify({
//       email: formData.loginEmail,
//       password: formData.password,
//       full_name: `${formData.f_name} ${formData.l_name}`,
//     }),
//   }
// );
//   const result = await response.json();
//   console.log("User Created: ", result.user)
//   await supabase.inviteUserByEmail(formData.loginEm); // so far this is not working 
//   if (result.error) throw new Error(result.error);
  
//   const authUser = result.user; // contains Supabase Auth user info

  // --- 2. Insert into "members" table, linking login_id = authUser.id ---
  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert([{ ...payload.member }]) //  login_id: authUser.id
    .select()
    .single();

  if (memberError) {
    throw new Error(`Failed to insert member: ${memberError.message}`);
  }
  if (!member?.member_id) {
    throw new Error("Member insertion returned no member_id.");
  }

  // --- 3. Insert into "initial_payments" table ---
  const { data: initPayments, error: paymentError } = await supabase
    .from("initial_payments")
    .insert([{ ...payload.payment, member_id: member.member_id }])
    .select()
    .single();

  if (paymentError) {
    throw new Error(`Failed to insert payment: ${paymentError.message}`);
  }

  // 4. Insert into "club funds" tabl for the initial payments
  const {data: clubFundsContri, error: clubFundsError} = await supabase
  .from("club_funds_contributions")
  .insert([{...payload.clubFunds, member_id: member.member_id}])
  .select()
  .single();

    if (clubFundsError) {
      throw new Error(`Failed to insert club funds: ${clubFundsError.message}`); // Let React Query handle it
    }

  const {data: coopContri, error: coopError } = await supabase
    .from("coop_cbu_contributions")
    .insert([{...payload.coop, member_id: member.member_id}])
    .select()
    .single();

  if (coopError) {
    throw new Error(coopError.message);
  }
  
  // --- Final success ---
  return { member, initPayments, clubFundsContri, coopContri}; // returns all data in one single array
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
      queryClient.invalidateQueries(["members", "active"]); // refreshes UI
      queryClient.invalidateQueries(["initial_payments", "active"]);
      queryClient.invalidateQueries(["club_funds_contributions", "active"]);
      queryClient.invalidateQueries(["coop_cbu_contributions", "active"]);
    },
    onError: (error) => {
      console.error("Something went wrong:", error.message);
    },
  });
};
