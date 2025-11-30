import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { useAddActivityLog } from "../shared/useAddActivityLog";

/**
 * Helper: Pick only relevant keys from formData
 */
const pick = (source, keys) =>
  keys.reduce((acc, key) => {
    if (key in source) acc[key] = source[key];
    return acc;
  }, {});

/**
 * Helper: Upload avatar file
 */
const uploadAvatar = async (file, memberId) => {
  const ext = file.name.split(".").pop();
  const path = `${memberId}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("profile_pic")
    .upload(path, file, { upsert: true });
  if (uploadError)
    throw new Error(`Avatar upload failed: ${uploadError.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from("profile_pic").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("members")
    .update({ avatar_url: publicUrl })
    .eq("member_id", memberId);

  if (updateError)
    throw new Error(`Failed to update member avatar: ${updateError.message}`);

  return publicUrl;
};

/**
 * Helper: Insert into Supabase table with error handling
 */
const insertTable = async (table, data) => {
  const { data: result, error } = await supabase
    .from(table)
    .insert([data])
    .select()
    .single();
  if (error)
    throw new Error(`Failed to insert into ${table}: ${error.message}`);
  return result;
};

/**
 * Main function: Insert a new member with all related tables
 */
const insertMember = async (formData) => {
  // --- 1. Build member and payment objects dynamically ---
  const memberFields = [
    "f_name",
    "m_name",
    "l_name",
    "civil_status",
    "birthday",
    "place_of_birth",
    "block_no",
    "barangay",
    "city_municipality",
    "province",
    "zip_code",
    "email",
    "contact_number",
    "spouse_name",
    "number_of_children",
    "office_name",
    "title_and_position",
    "office_address",
    "office_contact_number",
    "account_role",
    "account_status",
    "application_date",
    "joined_date",
  ];

  const paymentFields = [
    "membership_fee",
    "membership_fee_status",
    "membership_payment_method",
    "membership_payment_date",
    "membership_remarks",
    "initial_share_capital",
    "share_capital_payment_method",
    "share_capital_payment_date",
    "share_capital_remarks",
  ];

  const member = pick(formData, memberFields);
  const payment = pick(formData, paymentFields);

  // --- 2. Insert member ---
  const newMember = await insertTable("members", member);

  // --- 3. Handle avatar upload if exists ---
  if (formData.avatarFile) {
    await uploadAvatar(formData.avatarFile, newMember.member_id);
  }

  // --- 4. Insert club funds contribution (only if amount > 0) ---
  let newClubFunds = null;
  if (payment.membership_fee && parseFloat(payment.membership_fee) > 0) {
    const clubFunds = {
      amount: payment.membership_fee,
      category: "Monthly Dues",
      payment_date: payment.membership_payment_date,
      period_start: payment.membership_payment_date,
      period_end: payment.membership_payment_date,
      payment_method: payment.membership_payment_method,
      remarks: payment.membership_remarks || "Membership Initial",
    };
    newClubFunds = await insertTable("club_funds_contributions", {
      ...clubFunds,
      account_number: newMember.account_number,
    });
  }

  // --- 5. Insert coop contribution (only if amount > 0) ---
  let newCoop = null;
  if (
    payment.initial_share_capital &&
    parseFloat(payment.initial_share_capital) > 0
  ) {
    const coop = {
      source: "Member Contribution",
      amount: payment.initial_share_capital,
      category: "Initial",
      payment_method: payment.share_capital_payment_method,
      contribution_date: payment.share_capital_payment_date,
      remarks: payment.share_capital_remarks || "Membership Initial",
    };
    newCoop = await insertTable("coop_cbu_contributions", {
      ...coop,
      account_number: newMember.account_number,
    });
  }

  return {
    member: newMember,
    clubFunds: newClubFunds,
    coop: newCoop,
  };
};

/**
 * Custom hook: useAddMember
 */
export const useAddMember = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: logActivity } = useAddActivityLog(); // log activity after member is added successfully

  return useMutation({
    mutationFn: insertMember,
    onSuccess: async (data) => {
      console.log("New member created:", data);
      queryClient.invalidateQueries({ queryKey: ["members"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["club_funds_contributions"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["coop_cbu_contributions"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["get_funds_summary"],
        exact: false,
      });

      // log activities
      try {
        await logActivity({
          action: `Created new member: ${data.member.f_name} ${data.member.l_name} (${data.member.account_role})`,
          type: "CREATE",
        });

        // log club funds if included
        if (data.clubFunds) {
          await logActivity({
            action: `Created club fund contribution for ${data.member.f_name} ${data.member.l_name} (${data.member.account_number}): ₱${Number(data.clubFunds.amount).toLocaleString()} - ${data.clubFunds.category}`,
            type: "CREATE",
          });
        }

        // log share capital if included
        if (data.coop) {
          await logActivity({
            action: `Created coop share capital contribution for ${data.member.f_name} ${data.member.l_name} (${data.member.account_number}): ₱${Number(data.coop.amount).toLocaleString()} - ${data.coop.category}`,
            type: "CREATE",
          });
        }
      } catch (err) {
        console.warn("Failed to log activity:", err.message);
      }
    },
    onError: (error) => {
      console.error("Something went wrong:", error.message);
    },
  });
};
