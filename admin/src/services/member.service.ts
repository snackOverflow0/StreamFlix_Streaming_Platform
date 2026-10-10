import { apiRequest } from "./api-client";

export type Member = {
  member_id: number;
  subscription_id: number;
  user_id: number;
  relationship: string;
  date_added: string;
};

export function getMembersBySubscription(subscriptionId: number) {
  return apiRequest<Member[]>(`/members/subscription/${subscriptionId}`);
}

export function getMember(memberId: number) {
  return apiRequest<Member>(`/members/${memberId}`);
}

export function createMember(subscriptionId: number, data: Pick<Member, "user_id" | "relationship">) {
  return apiRequest<Member>(`/members/subscription/${subscriptionId}`, { method: "POST", body: JSON.stringify(data) });
}

export function deleteMember(memberId: number) {
  return apiRequest<void>(`/members/${memberId}`, { method: "DELETE" });
}
