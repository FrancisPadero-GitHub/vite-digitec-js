import { supabase } from "../../supabase.js";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemberId } from "../shared/useFetchMemberId";

const updateProfile = async (formData) => {
  const {
    // Personal
    member_id,
    f_name = null,
    m_name = null,
    l_name = null,
    civil_status = null,
    birthday = null,
    place_of_birth = null,

    // Address
    block_no = null,
    barangay = null,
    city_municipality = null,
    province = null,
    zip_code = null,

    contact_number = null,
    email = null,
    spouse_name = null,
    number_of_children = null,
    avatarFile = null,

    // Employment
    office_name = null,
    title_and_position = null,
    office_address = null,
    office_contact_number = null,
  } = formData;

  if (!member_id) {
   throw new Error( "Missing member_id for update.");
  }
  
  const payload = {
    f_name,
    m_name,
    l_name,
    civil_status,
    birthday,
    place_of_birth,
    
    block_no,
    barangay,
    city_municipality,
    province,
    zip_code,

    email,
    contact_number,
    spouse_name,
    number_of_children,
    office_name,
    title_and_position,
    office_address,
    office_contact_number,
  };

  // 1. Update member information
  const { data: updatedMember, error: updateError } = await supabase
    .from("members")
    .update(payload)
    .eq("member_id", member_id)
    .select()
    .single();

  if (updateError)
    throw new Error(`Failed to update profile: ${updateError.message}`);

  let avatarUrl = updatedMember.avatar_url;

  // 2. Handle profile picture upload
  if (avatarFile) {
    const fileExt = avatarFile.name.split(".").pop();
    // ✅ Use timestamp for uniqueness
    const uniqueSuffix = Date.now();
    const filePath = `${member_id}/avatar-${uniqueSuffix}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("profile_pic")
      .upload(filePath, avatarFile, { upsert: false }); // no overwrite, keep history if needed

    if (uploadError)
      throw new Error(`Avatar upload failed: ${uploadError.message}`);

    const { data: publicUrlData } = supabase.storage
      .from("profile_pic")
      .getPublicUrl(filePath);

    avatarUrl = publicUrlData.publicUrl;

    // ✅ Always update avatar_url in member row
    const { error: avatarUpdateError } = await supabase
      .from("members")
      .update({ avatar_url: avatarUrl })
      .eq("member_id", member_id);

    if (avatarUpdateError)
      throw new Error(
        `Failed to update avatar URL: ${avatarUpdateError.message}`
      );
  }

  return { ...updatedMember, avatar_url: avatarUrl };
};

export function useUpdateProfile() {
  const { data: memberId, isLoading: memberLoading } = useMemberId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => updateProfile({ ...formData, member_id: memberId }),
    enabled: !!memberId && !memberLoading,
    onSuccess: (updatedMember) => {
      queryClient.setQueryData(
        ["member_profile", updatedMember.member_id],
        updatedMember
      );
      queryClient.invalidateQueries(["members"]);
      console.log("Profile updated successfully:", updatedMember);
    },
    onError: (error) => {
      console.error("Failed to update profile:", error.message);
    },
  });
}
