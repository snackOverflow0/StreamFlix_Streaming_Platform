# StreamFlix functional upgrade report — 9 October 2026

This revision updates the original integrated client/admin/backend for local Windows operation against Supabase project qlpyjglxifzwvcxrkaqo. Runtime sample-login/admin bypasses remain disabled. Playback and hover previews remain trailer-only.

## Google sign-in and membership checkout correction

- Client/admin Google sign-in requests `prompt=select_account`. The OAuth URL options and production builds passed; no real Google account login was performed in this environment.
- After successful client bootstrap, the OAuth callback URL is replaced with the home URL. Accounts with an active subscription restore their profile/app; an old plan choice no longer forces unsubscribed Google accounts into checkout.
- Use a different account now signs out the Supabase session instead of only changing screens. The membership checkout also provides this action.
- Checkout availability distinguishes connection failures from an unavailable payment provider, supports retry and refresh on focus, and remains disabled until the backend reports card configuration is available. No payment credentials are exposed by the configuration endpoint.
- Failed checkout creation does not leave a pending payment. Successful checkout state records its owner and returned session ID. Returning to plan selection clears the old choice.
- Client/backend production builds, isolated browser flow checks and the payment configuration HTTP checks passed. The browser checks used intercepted services and created no live accounts or payments.
- Real card payments still require the owner's private Stripe API key and webhook signing secret in backend/.env, plus a working signed webhook delivery path. Google authentication does not itself grant a paid subscription.

## Latest recommendations, category artwork and merchandise corrections

- Because You Watched now includes matching movies and series from all watched genres, prioritizing the most recently watched genre, excluding watched titles and duplicates, with a maximum of 12. Sparse genres remain limited by actual catalog availability; unrelated titles are not presented as matches.
- Movies/Shows feature artwork uses a dedicated complete-image frame beside details on desktop and above details on mobile. Images and videos use contain rather than cropping faces; hover cards and trailer playback remain functional.
- Fixed a merchandise API contract error: listProducts previously returned only stock while the client expected stock_quantity, making stocked products appear unavailable. The backend now returns both canonical stock_quantity and legacy stock, and the client supports both. Availability labels honor listing status. Removed hardcoded product-name presentation fallbacks so merchandise imagery comes from the database.
- Added catalog-change broadcasts for merchandise transaction mutations. Existing admin product mutations already broadcast catalog changes; an isolated HTTP/SSE regression check verified admin stock/price updates produce public updated values and a catalog notification.
- Live read-only verification found eight active products with 6–25 units, one intentionally sold-out product, and one removed product. No live inventory/order mutations were made in this revision. Backend/client production builds, API stock/status tests, genre recommendation tests and desktop/mobile visual captures passed.

## Client and admin

- Replaced the Halloween theme with the logo’s electric blue, cyan and violet colors on deep navy. Removed seasonal text and cobwebs. Refined cinematic hero sizing, typography, glass navigation, card spacing, genre discovery, merchandise surfaces and mobile controls. Featured-title selection now respects admin featuring instead of forcing horror titles. Saved progress and all existing actions remain available.
- Kept favorites, watchlist, Continue Watching, genre recommendations, trailer-only player, profiles, subscriptions, merch checkout, notifications and original admin workspaces.
- Catalog now has All Content, Movies and TV Series tabs. Genres/Licensing moved from the Catalog navigation group to Administration; their records and playback/license checks remain intact.
- Reviews/Feedback now have newest-first inboxes, search, sorting, rating/status filters, full-message details, review removal and feedback resolution. Moderated review changes now invalidate catalog rating caches and notify connected clients.
- New Email Delivery workspace shows provider configuration status and the latest 100 receipt records, with failed/uncertain-send review and guarded retries.
- Admin media saves normalize same-project signed/public/authenticated URLs into stable storage:// references, preventing expiring tokens from being stored after editing. Private files are signed when read.

Netflix's private administrator interface was not inspected. These changes use public content-management principles and the supplied StreamFlix screenshots, without claiming to reproduce proprietary internal tooling.

## Applied live Supabase changes

- Added transactional_email_outbox with RLS enabled, no browser grants, unique event keys, claim leases and private service-only functions. Added checkout-fulfillment and order-status triggers. No historical receipt backfill.
- Added card-checkout stock reservations, expiration tracking and private reserve/release functions. Stock is locked in consistent product-ID order. One account can have at most three reserved checkouts. Fulfillment consumes reservations once and honors the stored checkout price. Expired stock is released only after server-side Stripe confirmation of expired/unpaid status; paid or ambiguous sessions retain protection.
- Six active zero-stock products, IDs 1/3/4/5/7/8, were replenished to 25 units each. Product 2 remains 7, product 9 remains 6, product 6 remains sold_out with 32 and product 10 remains removed with 0. Automatic review rejected a broader update that would also reactivate sold-out listings; the narrower six-product update succeeded.
- Four previously hidden titles with existing uploaded trailers and unexpired licenses were enabled: Project Hail Mary, Spider-Man: Brand New Day, The Odyssey, Toy Story 5. Their trailer links are stable Trailers bucket references. The live catalog now has 26 active, unarchived titles.
- Prior Bridgerton and Interstellar media-reference repairs remain. The Godfather has no matching file in Storage and needs its correct trailer supplied. All 62 database-linked artwork references matched objects in the prior Storage audit.
- No new video bytes were uploaded here. Automatic mapped-file imports on backend startup and Admin uploads are implemented; they require local files and the owner's backend server key.

Read-only live verification: database readiness true; reservation/release functions exist; anonymous email reading and authenticated claim/reserve execution denied; two email triggers installed. Email queue and reserved-checkout counts were zero, confirming that verification inserted no live purchases, pending reservations or outgoing receipts.

## Brevo behavior and configuration

Verified subscription/card-payment fulfillment atomically queues a receipt alongside database updates. COD creates an unpaid order confirmation; later admin fulfillment/payment changes create updates. Card carts have one aggregate receipt; COD currently creates one receipt per product transaction line. This is transactional messaging, not bulk marketing.

The backend uses Brevo's transactional email endpoint with a stable UUID idempotency key, escaped HTML and plain text. Missing credentials leave jobs queued. A worker claims five jobs at a time, avoids concurrent duplicate processing, retries transient failures, records accepted sends, and puts interrupted/aged ambiguous deliveries into review rather than resending indefinitely. Manual uncertain-send retry requires checking provider logs. Provider acceptance does not certify delivery to an inbox.

Required private backend configuration: BREVO_API_KEY, BREVO_SENDER_EMAIL (verified sender), optional BREVO_SENDER_NAME. Stripe needs STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET and signed webhook forwarding to /api/payments/webhook while the local backend runs. Brevo does not collect payments or replace Stripe. Supabase recovery/login email delivery and Google OAuth require their separate provider settings.

Neither the owner's private Supabase server key nor Brevo/Stripe credentials were available in this environment. No live charges, emails, user registrations or authenticated end-to-end orders/uploads were executed. Claims below distinguish isolated verification from live metadata checks.

## Logo-based UI revision verification

Client production compilation passed. Desktop and mobile browser checks passed for hover trailers, viewport containment, favorites/watchlist, saved Continue Watching, COD checkout, title details and authorized playback, with zero page errors. Mobile 390px and 320px layouts had no horizontal page overflow. Screenshots use isolated catalog fixtures, not authenticated live customer sessions. This UI revision makes no additional live database changes.

## Verification completed

- Client/admin/backend production compilation passed.
- Client browser flows with isolated fixture data passed: hover-video decoding, preview containment, favorites/watchlist mutations, saved Continue Watching, COD pickup checkout, title details, authorized playback requests, desktop/mobile no horizontal overflow and zero page errors.
- All 20 admin workspaces render. Catalog tabs, newest/oldest community sorting, full-message display, feedback resolution persistence, email setup state and guarded order edits passed browser checks.
- Backend integration/security/payment checks passed: anonymous/non-admin denial, ownership validation, invalid resource/body rejection, webhook raw signature/tamper/age verification, duplicate fulfillment protection, amount mismatch rejection, retry after failure, restricted subscription activation, COD transitions and card status protection.
- Isolated Postgres checks passed: rerunnable migrations, atomic multi-item rollback, receipt queueing/deduplication, aggregate card receipts, claim leases, aged-send protection, restricted ACLs, reservation oversell rejection, stored paid prices, no double stock decrement, paid-stock release protection and idempotent expired release.
- Brevo/reconciliation checks with intercepted services passed: escaped content, unpaid COD wording, recipient mapping, stable UUID key, disabled-provider behavior, worker coalescing, transient/permanent/ambiguous outcomes, and releasing only verified expired/unpaid Stripe sessions. No external sends/writes occurred in these checks.
- Security advisor showed INFO for intentionally server-only RLS tables and WARN for disabled leaked-password protection. No permissive policies were added. Enable password protection in Supabase Auth if available for the plan.

## Practical limits

This is a local application, not a public deployment. Keep the backend running for webhook fulfillment, queue delivery and reservation reconciliation; work resumes after restart. External database edits use focus/60-second refresh. Performance depends on hardware/network/video size/provider availability; client main JavaScript is approximately 210 KB gzip and still produces a chunk-size warning.

Subscriptions are one-time 30-day purchases; recurring billing, GCash, refunds/cancellations with restock, courier tracking, parental PINs and a complete household-invitation workflow are not implemented. Merchandise variants are listing metadata. Favorites, Watchlist, notifications, viewing history and merchandise orders are profile-scoped; subscriptions remain shared by the account. Legacy pending card sessions created without reservations may need manual review. Feedback status changes do not email a reply. Missing or unsupported media cannot be repaired by UI styling.

Fresh-project SQL order: integration.sql → functional-hardening.sql → catalog-aggregates.sql → local-production.sql → transactional-email.sql → checkout-reservations.sql → profile-history.sql → profile-commerce.sql → profile-personalization.sql. These are already applied to the current connected project; no SQL rerun is required just to start the ZIP.

See START_HERE.md for Windows startup, private provider setup and automatic trailer imports.

## Independent profile history verification — 2026-10-09

- Applied profile_history migration to the connected Supabase project. Added profile ownership foreign key and indexed profile history; new progress function is callable only by service_role.
- Preserved existing account history under the first profile. Live checks found zero unassigned history records and zero profile/account ownership mismatches.
- A live database verification saved distinct progress for two existing profiles, updated one independently, and rejected another account's profile. Verification writes were rolled back.
- An isolated browser check passed separate Continue Watching shelves (37% vs 81%), a new profile with empty history, profile-scoped recommendation requests, correct owner on playback progress writes, and restoring the original history after switching back. No browser runtime errors occurred.
- Browser checks used isolated API fixtures; they did not sign into real customer accounts. Backend and client builds succeeded.

- Local API integration checks passed authenticated profile ownership, missing-profile rejection, foreign-profile rejection on both progress and recommendations, and correct profile ID forwarded to the progress function.
- Updated frontend assets include matching gzip versions; archive verification checks compressed and original build files match.

## Independent profile merchandise verification — 2026-10-09

- Applied profile-commerce.sql to the connected project. Merchandise transactions and checkout reservations retain the owning profile ID and purchasing-name snapshot. Ownership checks reject a profile from another account; RPCs remain server-only.
- Backfilled old orders/checkouts to each account's lowest-ID profile. Live verification found zero order/profile owner mismatches and zero unattributed old orders.
- Live transactional checks passed separate COD attribution for two profiles, paid checkout attribution to its original profile, idempotent fulfillment, exact stock deduction, and foreign-profile rejection. All test order, stock and email-queue changes were rolled back.
- Browser checks with isolated API fixtures passed: separate saved bags, ignoring the unidentified legacy bag, profile-scoped COD checkout quantities and histories, reset delivery form when switching, empty bag/history for a new profile, and Stripe return removing only purchased quantities from the original profile while another is selected. Zero JavaScript page errors. The card-return check also covers React StrictMode duplicate-updater behavior.
- Client/admin/backend production builds passed. API profile-commerce, integration, webhook/order protection, receipt/reconciliation and admin-to-client stock sync checks passed using intercepted services. No Stripe charges or Brevo emails were sent by these checks.
- Browser bags remain local to the browser; confirmed orders and stock are stored in Supabase. Subscriptions and receipt-recipient account emails remain account-scoped. Profile deletion retains the financial purchase-name snapshot.

## Client library fixes verified — 2026-10-09

- Continue Watching uses the full available row width and left gutter; one-card shelves do not shrink into the center. Desktop and fresh mobile viewport checks passed, with no horizontal page overflow.
- Fixed the API contract mismatch: the client calls POST /favorites, GET /favorites/me, POST /watch-list, and GET /watch-list/me. Those routes now resolve the verified account on the server, while existing user routes remain compatible. Duplicate saves return the stored row; ownership checks remain enforced.
- A delayed bootstrap cannot overwrite Favorites/Watchlist state changed while that request was in flight. Button mutation errors still roll back and show an error toast.
- Because You Watched uses the latest positive-progress history entry, sorted by timestamp rather than array position, and always names that title. Server and client recommendation candidates match its genre. The server returns the source title ID/name so stale recommendations cannot be presented under a different source title.
- API contract checks passed the real Express routes, list save/read/remove and duplicate-save behavior, authenticated ownership, switching latest source after replay, multiple matching movie/series candidates, and profile ownership. Supabase checks passed generated IDs and save/read/remove on the real favorites/watch_list tables inside a rolled-back verification transaction.
- Browser checks forwarded Favorites/Watchlist requests through the real Express routes with an isolated database adapter. Hover buttons, My List readback, reload persistence/removal, latest-title heading after replay, zero-progress exclusion, genre recommendations, left alignment and mobile no-overflow passed with zero JavaScript page errors.
- Backend/client production builds and existing integration checks passed. No new database migration is required. The backend must be restarted to load the corrected routes.

## Collection spotlight design verification — 2026-10-09

Movies and Shows use the same category-specific cinematic frame, preserving the 4.5% desktop and 22px mobile outer gutters. Artwork uses contain, with feathering rather than an abrupt split. The home hero retains its existing layout. Browser checks with local artwork/API fixtures passed both pages, More Info and trailer playback, original board gutters, and no horizontal overflow or clipped action groups at 390px and 320px. No runtime page errors occurred. Client production build passed; database/API behavior is unchanged in this design revision.

## Profile personalization and preview visibility — 2026-10-09

- Applied profile-personalization.sql to the connected Supabase database. Favorites and Watchlist now use unique (profile_id, content_id) keys and composite profile/account ownership constraints. Existing personal rows stay with the first profile; unattributed legacy rows for accounts without a profile are preserved until their first profile exists.
- Personal list API routes require an explicit owned profile. Saving the same title in two profiles creates distinct records; reads, updates and deletes remain scoped. The client filters all personal rows by account/profile, snapshots mutation ownership, and rolls back only the original profile on errors. Late bootstrap responses cannot overwrite pending mutations.
- Each profile has its own notification inbox and read state. New general account/content notices fan out to existing profiles. Merchandise payment notices target only the purchasing profile; deleted purchasing profiles do not cause a broadcast. Subscription notices remain account notices with independent inbox copies. Bootstrap caps notification retrieval per profile, so one busy profile cannot displace another profile’s inbox.
- Live database checks passed same-title independent saving, isolated removal, cross-account foreign-key rejection, notification fanout, isolated unread state and targeted notices. Verification writes were rolled back. Actual Express-route checks passed explicit/foreign profile validation and notification read/read-all isolation.
- Hero previews pause/unmount below the viewport visibility threshold; scrolling dismisses fixed hover previews. Pending hero start timers are cancelled by other previews, explicit playback and background tab visibility changes.
- Browser checks using real Express list/notification routes with an isolated database adapter passed independent profile libraries, same-title saving in both profiles, switching/reload persistence, isolated removal and inbox visibility/read-all, and failed pending mutation rollback after a profile switch. Home/Movies/Shows preview visibility, hover dismissal and explicit playback also passed with zero JavaScript page errors. A separate preview test confirmed delayed hero timers cannot steal hover playback.
- Backend and client production builds passed; integration and profile-commerce regressions passed. Existing account/user indexes and new profile/recent indexes cover the personal lookup filters.

## Client card text and direct save controls — 2026-10-09

- Landscape title cards with viewing progress now reserve sufficient height for the full progress caption; the text no longer gets clipped at the card or shelf edge.
- Favorites and Watchlist controls stay visible beside each card title, have larger touch targets, and can be activated by pointer or keyboard without opening/aiming through the hover preview. Activating either control cancels any pending preview timer so a preview cannot intercept the click.
- Headless browser checks verified the progress caption stays inside the card, both direct controls save through the authenticated Express routes, and controls/text remain visible without page overflow at 390px and 320px. Client production build passed.
