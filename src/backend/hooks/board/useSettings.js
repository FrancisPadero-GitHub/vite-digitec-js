import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSettingsByCategory,
  fetchSetting,
  insertSetting,
  updateSetting,
} from "./useSettingsApi";

/* Fetch all settings of a category */
export function useSettingsCategory(category) {
  return useQuery({
    queryKey: ["settings", category],
    queryFn: () => fetchSettingsByCategory(category),
    enabled: !!category
  });
}
/* Fetch a single setting */
export function useSetting(category, key) {
  return useQuery({
    queryKey: ["setting", category, key],
    queryFn: () => fetchSetting(category, key),
    enabled: !!category && !!key
  });
}

// Insert a new setting
export function useInsertSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ category, key, value }) => insertSetting(category, key, value),
    onSuccess: (_, { category }) => {
      queryClient.invalidateQueries(["settings", category]);
    },
  });
}

// Update an existing setting by id
export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, category, key, value }) => 
      updateSetting(id, category, key, value),
    onSuccess: (_, { category }) => {
      queryClient.invalidateQueries(["settings", category]);
    },
  });
}
