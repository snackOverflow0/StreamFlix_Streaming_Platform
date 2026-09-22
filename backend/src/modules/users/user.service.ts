import { supabase } from "../../config/supabase.js";

export async function getUserById(userId: number) {
  const { data, error } = await supabase
    .from("users")
    .select(
      "user_id, full_name, email, phone_number, date_of_birth, account_status, created_at, updated_at"
    )
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateUser(
  userId: number,
  updates: {
    full_name?: string;
    phone_number?: string;
    date_of_birth?: string;
  }
) {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .select(
      "user_id, full_name, email, phone_number, date_of_birth, account_status, created_at, updated_at"
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}