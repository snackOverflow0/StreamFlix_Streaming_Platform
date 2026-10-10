export type Content = {
  weeklyViews?: number;
  isFeatured?: boolean;
  id: number;
  title: string;
  type: "Movie" | "Series";
  year: number;
  rating: number;
  reviewCount: number;
  genre: string;
  poster: string;
  preview?: string;
  hero?: string;
  description: string;
  synopsis: string;
  cast?: string[];
  progress?: number;
  maturity: string;
  kidsApproved?: boolean;
  duration: string;
  license: string;
  licenseExpiration?: string | null;
  director?: string | null;
  trailerUrl?: string;
};

export type MerchProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  stockStatus?: "low" | "sold-out";
  stockLabel?: string;
  stockQuantity: number;
};

export type Transaction = {
  userId: number;
  profileId: number | null;
  id: string;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  total: number;
  createdAt: string;
  paymentMethod: string;
  deliveryMethod: string;
  status: "Pending" | "Processing" | "Shipped" | "Completed" | "Cancelled";
};

export type AppNotification = {
  id: string;
  backendId: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: string;
};

export type SubscriptionReceipt = {
  id: string;
  planId: string;
  amount: number;
  paymentMethod: "GCash" | "Card";
  createdAt: string;
  status: "Completed";
};

export type View = "home" | "shows" | "movies" | "new-releases" | "my-list" | "store";
export type FooterPanel = "devices" | "help" | "accessibility" | "legal" | null;
export type AuthStage = "login" | "register" | "plans" | "subscription-payment" | "profiles" | "app";

export type ViewerProfile = {
  id: string;
  backendId: number;
  name: string;
  image: string;
  colors: string;
  initials: string;
  addedAt: string;
  deviceType: string;
  deviceName: string;
  isKids?: boolean;
};

export type RegisteredAccount = {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
};

export type BackendPlan = {
  id: string;
  backendId: number;
  name: string;
  price: number;
  maxMembers: number;
  memberText: string;
  quality: string;
};
