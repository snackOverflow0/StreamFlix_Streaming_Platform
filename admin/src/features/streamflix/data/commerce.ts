import type { MerchProduct } from "../types";

export const MERCH: MerchProduct[] = [
  {
    id: "m1",
    name: "Monopoly: House of the Dragon Edition",
    category: "Games & Collectibles",
    price: 1499,
    image: "/streamflix/merch/monopoly.jpg",
  },
  {
    id: "m2",
    name: "Stranger Things x Miniso Tumbler",
    category: "Drinkware",
    price: 649,
    image: "/streamflix/merch/stranger-things-tumbler.webp",
  },
  {
    id: "m3",
    name: "Funko POP Marvel: Deadpool Playtime - Deadpool in Robe",
    category: "Figures & Collectibles",
    price: 499,
    image: "/streamflix/merch/deadpool-funko.jpg",
  },
  {
    id: "m4",
    name: "Iron Man - Mark VII Replica Helmet Marvel Museum Collection",
    category: "Figures & Collectibles",
    price: 6999,
    image: "/streamflix/merch/iron-man-helmet.webp",
    stockStatus: "low",
    stockLabel: "Low stock · 2 left",
  },
  {
    id: "m5",
    name: "Minion Monsters Blind Box Figures",
    category: "Figures & Collectibles",
    price: 1299,
    image: "/streamflix/merch/minion-monsters-blind-box.webp",
    stockStatus: "low",
    stockLabel: "Low stock · 5 left",
  },
  {
    id: "m6",
    name: "Funko POP Marvel: Spiderman",
    category: "Figures & Collectibles",
    price: 1099,
    image: "/streamflix/merch/spiderman-funko.webp",
    stockStatus: "sold-out",
    stockLabel: "Sold out",
  },
];

export const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 149,
    memberText: "1 simultaneous member",
    quality: "720p",
  },
  {
    id: "standard-1080p",
    name: "Standard",
    price: 399,
    memberText: "2 simultaneous members",
    quality: "1080p",
  },
  {
    id: "premium",
    name: "Premium",
    price: 549,
    memberText: "4-6 simultaneous users",
    quality: "4K + HDR",
  },
];
