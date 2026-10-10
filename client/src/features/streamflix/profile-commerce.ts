export type ProfileCart = Record<string, number>;
export const cartKey = (userId: number, profileId: number) => `streamflix-merch-cart:${userId}:${profileId}`;
export function readCart(key: string): ProfileCart {
  try { const value=JSON.parse(localStorage.getItem(key) || "{}");
    if (!value || typeof value!=="object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([id,qty])=>/^\d+$/.test(id) && typeof qty==="number" && Number.isSafeInteger(qty) && qty>0)) as ProfileCart;
  } catch { return {}; }
}
export function writeCart(key: string, value: ProfileCart) { try { localStorage.setItem(key,JSON.stringify(value)); } catch { /* Browser storage may be unavailable. */ } }
export function subtractPurchased(cart: ProfileCart, items: Array<{product_id:number;quantity:number}>): ProfileCart {
 const next={...cart}; for(const item of items) {const id=String(item.product_id);const qty=(next[id]||0)-item.quantity;if(qty>0)next[id]=qty;else delete next[id];}return next;
}
