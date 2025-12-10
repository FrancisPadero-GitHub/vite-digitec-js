import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../supabase";

/**
 * Check if a member already exists based on:
 * 1. Exact name match (f_name, m_name, l_name) + birthday
 * 2. Email match
 * 3. Contact number match
 */
const checkDuplicateMember = async ({
  f_name,
  m_name,
  l_name,
  birthday,
  email,
  contact_number,
}) => {
  // Check for exact name + birthday match (all three names and birthday)
  const { data: nameMatches, error: nameError } = await supabase
    .from("members")
    .select(
      "member_id, f_name, m_name, l_name, birthday, email, contact_number"
    )
    .eq("f_name", f_name)
    .eq("l_name", l_name)
    .eq("m_name", m_name || "")
    .eq("birthday", birthday);

  if (nameError) {
    throw new Error(`Failed to check name: ${nameError.message}`);
  }

  // Check for email match
  const { data: emailMatches, error: emailError } = await supabase
    .from("members")
    .select("member_id, f_name, m_name, l_name, email")
    .eq("email", email);

  if (emailError) {
    throw new Error(`Failed to check email: ${emailError.message}`);
  }

  // Check for contact number match
  const { data: contactMatches, error: contactError } = await supabase
    .from("members")
    .select("member_id, f_name, m_name, l_name, contact_number")
    .eq("contact_number", contact_number);

  if (contactError) {
    throw new Error(`Failed to check contact number: ${contactError.message}`);
  }

  // Compile results
  const duplicates = {
    hasNameMatch: nameMatches && nameMatches.length > 0,
    hasEmailMatch: emailMatches && emailMatches.length > 0,
    hasContactMatch: contactMatches && contactMatches.length > 0,
    nameMatches: nameMatches || [],
    emailMatches: emailMatches || [],
    contactMatches: contactMatches || [],
  };

  return duplicates;
};

/**
 * Custom hook: useCheckDuplicateMember
 */
export const useCheckDuplicateMember = () => {
  return useMutation({
    mutationFn: checkDuplicateMember,
    onError: (error) => {
      console.error("Duplicate check failed:", error.message);
    },
  });
};
