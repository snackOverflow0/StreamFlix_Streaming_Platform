import { apiRequest } from "./api-client";

export type User = {
  user_id: number;
  full_name: string;
  email: string;
  phone_number: string | null;
  date_of_birth: string | null;
  account_status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export function getUser(userId: number) {
  return apiRequest<User>(`/users/${userId}`);
}

export function updateUser(userId: number, data: Partial<Pick<User, "full_name" | "phone_number" | "date_of_birth" | "account_status">>) {
  return apiRequest<User>(`/users/${userId}`, { method: "PATCH", body: JSON.stringify(data) });
}
