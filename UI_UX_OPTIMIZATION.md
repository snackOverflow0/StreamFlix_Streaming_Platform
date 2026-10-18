# StreamFlix client — UI/UX optimization (design system v3)

## Files changed
- client/src/design-system.css (NEW) — shared tokens (color, type, spacing 4/8px, radii, elevation, motion, focus) + auth, plan picker, profile gate, My List tabs, mobile fixes, reduced-motion.
- client/src/features/streamflix/StreamFlixApp.tsx — loads design-system.css after client-v2.css.
- client/src/features/streamflix/components/AuthFlow.tsx — redesigned Log in, Create account (field-level validation, PH mobile, age ≥13, password strength, confirm), Plan picker (cards + one primary CTA → existing Stripe checkout), Who's watching (Manage Profiles mode). All existing handlers (onLogin, onRegister, onSelectPlan, onAddProfile, onEditProfile, onDeleteProfile, Google, password reset) are unchanged.
- client/src/features/streamflix/v2/Pages.tsx — My List: Watchlist and Favorites are separate tabs.

## Payments & email
Unchanged and already wired: plan selection → /payments/subscription-checkout (Stripe Checkout) → Stripe webhook activates the subscription → Brevo sends "Your StreamFlix subscription is active".
Requires backend/.env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, BREVO_API_KEY, BREVO_SENDER_EMAIL.

## Checks
- Rendered Log in, Create account, Plan picker, Who's watching, Home, My List, Merch, Detail at 1440×900 and 390×844 in a static harness; no horizontal overflow; one mobile overlap (detail sheet) found and fixed.
- NOT run: `npm run build`, eslint, real tsc, axe — packages could not be installed (no network in this environment). Run `npm run build` in client/ before deploying.

## Round 2 (everything else)
- client/src/features/streamflix/v2/Extra.tsx (NEW): AccountPage (Profile, Sign-in & security, Plan & billing, Playback & language, Notifications), HistoryPage (All time / Today / 7 / 30 days / Pick a date, grouped by day, from real view_history rows), SearchDropdown (recent + trending + live results, Enter opens first), NotificationsPanel (All/Unread, Mark all read, type icons, click routes to cart/feedback/account), ProductWindow (size for apparel, quantity limited by stock, Add to cart / Buy now).
- Shell.tsx: search opens the dropdown; bell uses the new panel with an unread count; profile menu → Account page + Viewing history.
- Pages.tsx: merch cards open the product window; cart shows chosen size; chosen sizes are added to the order's delivery note so staff can see them.
- StreamFlixApp.tsx / types.ts / useStreamFlix.ts: new "account" and "history" views; controller exposes historyRows.
- admin/src/features/admin/admin-soft.css (NEW) + AdminApp.tsx import: admin uses the same navy / Swan White tokens.
Limitations: playback/notification preferences save per device (no DB columns yet); size is stored in the order note, not a dedicated column.

## Archive fix
- backend/src/modules/admin/admin.routes.ts: DELETE /admin/content/:id now archives (sets deleted_at) instead of returning 400.
- backend/src/modules/admin/management.ts: archived list includes poster_url; restore only acts on archived titles.
