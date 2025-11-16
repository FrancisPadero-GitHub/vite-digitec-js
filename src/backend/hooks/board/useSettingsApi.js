import { supabase } from "../../supabase";

/* Fetch all settings for a category */
export async function fetchSettingsByCategory(category) {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("category", category)
    .order("id", { ascending: true });

  if (error) throw error;
  return data;
}

/* Fetch a single setting */
export async function fetchSetting(category, key) {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("category", category)
    .eq("key", key)
    .single();

  if (error) throw error;
  return data.value;
}

/* Insert a new setting */
export async function insertSetting(category, key, value) {
  const { data, error } = await supabase
    .from("settings")
    .insert({ category, key, value })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* Update an existing setting by id */
export async function updateSetting(id, category, key, value) {
  const { data, error } = await supabase
    .from("settings")
    .update({ category, key, value })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
