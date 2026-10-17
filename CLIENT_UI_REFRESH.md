# StreamFlix client v2: matches the client prototype

All data comes from your backend and Supabase (bootstrap, reviews, feedback, merchandise, orders). No sample data is used.

## What changed
| Area | Now |
|---|---|
| Navigation | Floating glass bar: Home · Movies · TV Shows · My List · Merch, plus Search, Cart (with count), Notifications and Profile. Mobile has a bottom bar. |
| Home | Cinematic carousel of featured titles (`is_featured`, else top-ranked), auto-advancing every 7s and pausing on hover. Continue watching, recommendations, Top 10, New releases and genre rows. |
| Movies / TV / New releases | Poster grid with genre chips |
| Search | Its own page, with a Movies/TV filter |
| Title details | Trailer, Play, My List, Favorite, facts, episodes by season, **star rating + written review** (POST/PATCH `/reviews`), community reviews (GET `/reviews/content/:id`) and More like this |
| Merch hub | Product cards with stock labels; "Add to cart" shows the count in the cart |
| **Cart (new page)** | Quantity +/-, remove, total, checkout (Card via Stripe or Cash on Delivery, same `checkout()` as before), order history |
| **Feedback (new page)** | Topic, subject and message (POST `/feedback`), plus your past feedback with its status (GET `/feedback/user/:id`) |

## Files
- New: `src/client-v2.css`, `src/features/streamflix/v2/{Shell,Pages,Detail,ui}.tsx`
- Changed:
  - `src/features/streamflix/StreamFlixApp.tsx`
  - `src/features/streamflix/components/AppOverlays.tsx`
  - `src/features/streamflix/types.ts` (new views: search, cart, feedback)
  - `src/features/streamflix/hooks/useStreamFlix.ts` (`submitFeedback` accepts a topic)
  - `src/services/feedback.service.ts` (`getMyFeedback`)
  - `src/app/router.ts`
- The old `AppHeader`, `MainContent`, `TitleDetails` and `CartDrawer` are no longer used. They were left in place, so nothing else breaks.

The login, profiles, video player, plans, account menu and Stripe return flow are unchanged.
