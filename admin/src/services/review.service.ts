import { apiRequest } from "./api-client";
export type Review = { rev_id: number; user_id: number; content_id: number; rating_value: number; review_comment: string | null; review_date: string };
export type RatingSummary = { content_id: number; average_rating: number; review_count: number };
export function getRatingSummaries() { return apiRequest<RatingSummary[]>("/reviews/ratings"); }
export function getReviewsByContent(contentId: number) { return apiRequest<Review[]>(`/reviews/content/${contentId}`); }
export function createReview(contentId: number, ratingValue: number, reviewComment: string) { return apiRequest<Review>("/reviews", { method: "POST", body: JSON.stringify({ content_id: contentId, rating_value: ratingValue, review_comment: reviewComment }) }); }
export function updateReview(reviewId: number, ratingValue: number, reviewComment: string) { return apiRequest<Review>(`/reviews/${reviewId}`, { method: "PATCH", body: JSON.stringify({ rating_value: ratingValue, review_comment: reviewComment }) }); }
