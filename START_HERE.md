# StreamFlix — local production startup

This package contains compiled client, admin and backend applications connected to your existing Supabase project `qlpyjglxifzwvcxrkaqo`. The required database migrations have already been applied to that project. Do not rerun SQL simply to start this download.

## Windows setup

1. Extract into a new folder. Keep your old installation as a backup.
2. Copy your working **backend/.env** into this package’s backend folder. The supplied file contains a placeholder server key. Keep the real server key only in the backend; never put it in client/admin files or share it in chat.
3. Install Node.js 22.12+ or 24 if needed.
4. Close the old backend/client/admin development terminals to release ports 4000, 5173 and 5174.
5. In **File Explorer**, double-click **setup-windows.bat** once (do not use VS Code’s Run Code button). It installs the backend runtime dependencies. Internet access is required.
6. Double-click **start-windows.bat**. Keep this window open while using StreamFlix. Ctrl+C stops it.

| Application | Address |
|---|---|
| Client | http://localhost:5173 |
| Admin | http://localhost:5174 |
| Backend readiness | http://localhost:4000/api/ready |

An existing administrator account is required for admin login. Client and admin login sessions are separate. The startup script checks database readiness before serving the apps. If it fails, read its message: check your backend environment, internet connection and occupied ports. This application binds to the local computer; it is not a public deployment.

The compiled frontend already uses your current project and local API address. Copying different client/admin environment values does not alter a compiled build. Run **rebuild-windows.bat** after frontend configuration or source changes. Backend environment changes take effect on the next startup. Normal use needs neither Vite development servers nor PowerShell execution-policy changes.

## This revision

Because You Watched now combines matching movies and series across your watched genres. Category banners show complete artwork. Merch Hub now reads the correct database stock field; replace both client and backend using this package, copy your existing backend/.env, and restart. Admin stock/price changes notify connected clients; edits made directly in Supabase refresh on focus or within 60 seconds.


The client now uses the logo’s blue, cyan and violet colors with cinematic artwork, soft fades and glass navigation, accessible favorite/watchlist card buttons, visible Continue Watching, current genre recommendations and clearer merchandise controls. The original admin/client features remain integrated. No sample account or admin bypass is enabled.

Admin media forms now offer **Choose from Supabase** as well as upload and paste controls. MP4 trailers use the private Trailers bucket; artwork uses images and merchandise uses products. Save the record after choosing an existing file. Content visibility, archive/restore, licensing, products/stock and account/subscription updates flow through authenticated APIs and update connected clients.

Bridgerton and Interstellar’s broken Storage references were fixed in your live database. **The Godfather trailer file is missing from the bucket.** Upload a valid trailer in Admin → Movies → Edit The Godfather → Trailer → Browse files → Save Changes. All 62 database-linked artwork/product images matched existing Storage objects. A missing media file cannot play until it is supplied.

## New catalog, community, and commerce upgrade

The client keeps the charcoal/plum and warm orange palette, with a quieter navigation bar, a smaller genre discovery strip, tighter content shelves and clear trailer progress. Favorites, watchlist, hover previews and Continue Watching remain connected to your account.

Catalog tabs are now **All Content / Movies / TV Series**. Genre and license management moved out of the Catalog navigation group into Administration; their records remain required for catalog organization and rights enforcement. Reviews and Feedback use a readable newest-first inbox with sorting, search, rating/status filters, full-message details and feedback resolution actions. Admin → Commerce → Email Delivery shows the latest 100 queued/sent/failed/uncertain receipts.

Live database changes: six active zero-stock products (IDs 1, 3, 4, 5, 7, 8) received 25 units each. Other product stocks and listing statuses were preserved. Project Hail Mary, Spider-Man: Brand New Day, The Odyssey and Toy Story 5 now appear in the client, using their existing uploaded trailers and unexpired licenses. No new trailer files were uploaded from this environment.

## Enable Brevo payment and order emails

Add these to your **backend/.env**, then restart start-windows.bat:

```dotenv
BREVO_API_KEY=YOUR_PRIVATE_BREVO_API_KEY
BREVO_SENDER_EMAIL=YOUR_VERIFIED_SENDER_EMAIL
BREVO_SENDER_NAME=StreamFlix
```

Use a Brevo API key, not an SMTP password. Verify the sender/domain in Brevo. These values must never go into client/admin environment files or chat messages. See https://developers.brevo.com/docs/send-a-transactional-email .

Subscription activation and card purchases queue receipts only after verified payment fulfillment. COD purchases queue order confirmations that clearly state payment is still due. Admin order/payment status changes queue updates. COD carts currently have one transaction per product line, so they generate one confirmation per line; card carts receive one aggregate receipt.

The durable queue is already installed in your Supabase project. Missing credentials leave receipts pending without undoing successful payments/orders. The backend processes receipts while running and recovers pending work after restart. Delivery failures can be reviewed/retried in Admin → Email Delivery. For an **uncertain** send, check Brevo logs before retrying to avoid a duplicate. “Accepted by Brevo” means provider acceptance, not a guarantee of inbox delivery. No historical receipts were backfilled and no real emails were sent during this upgrade.

## Automatic trailer uploads on startup

For new files, place the trailer in **incoming-media** and add an explicit existing content ID/file mapping to **media-imports.json**. See incoming-media/README.md. Restarting uploads the mapped files to Supabase and connects the title to a stable bucket reference. Existing remote trailer selections win unless replace_existing is explicitly true. This uses your working backend server key; it does not download or invent videos. The packaged Mean Girls fallback is only imported when its remote trailer is absent. The missing Godfather file still needs to be supplied. Automatic imports support files up to 64 MB; use Admin uploads for larger files.

## Database-backed behavior

Authenticated API writes persist in Supabase. Successful app mutations notify connected client/admin sessions to refresh relevant data. Notifications contain only change topics and account events are scoped to their owner. Focus and 60-second refreshes also pick up external database edits and recover missed notifications. Background refresh keeps the current interface visible. Refreshes are not a guarantee of instantaneous synchronization under every network condition.

Admin platform name, custom accent colors and support email reflect in the client. The logo-based blue, cyan and violet palette replaces all seasonal styling. Catalog queries use short caching, parallel reads and database aggregates; private account and authorization data are not cached. Compiled frontend assets use gzip and browser caching. Trailer signing is reused within its validity period. Play and hover remain **trailer-only**, as required.

The connected database now has atomic progress saving, profile/member capacity enforcement, private-table browser access restrictions and service-only checkout/progress/statistics functions. See FUNCTIONAL_AUDIT.md for the exact verification and product limits.

For a different fresh Supabase project, apply database scripts in order: integration.sql → functional-hardening.sql → catalog-aggregates.sql → local-production.sql → transactional-email.sql → checkout-reservations.sql → profile-history.sql → profile-commerce.sql → profile-personalization.sql, then update environment files and rebuild. These scripts are already applied to your current project.

## External provider configuration

Password recovery is implemented for both apps. Configure Supabase Auth redirect URLs for http://localhost:5173/** and http://localhost:5174/**, and configure working email delivery. Google sign-in requires its provider configuration. No recovery emails or new accounts were generated during this upgrade.

For card checkout, set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in backend/.env. A signed Stripe event must reach /api/payments/webhook for checkout.session.completed and checkout.session.async_payment_succeeded. With a local-only backend, use Stripe CLI forwarding to localhost:4000/api/payments/webhook while accepting payments; its signing secret differs from a dashboard endpoint secret. Live payment processing requires the appropriate live credentials and delivery setup. See https://docs.stripe.com/stripe-cli for forwarding configuration.

Card controls stay disabled when provider credentials are absent. COD orders work without Stripe. Subscriptions are one-time payments for 30 days. Recurring billing, GCash and refund/courier workflows are not implemented. Card merchandise checkout now reserves inventory before providing the payment link; paid orders honor the checkout price. The backend reconciles expired sessions with Stripe before returning reserved stock. Keep the backend running or restart it to reconcile reservations after downtime. Legacy checkouts without reservations can still require manual review; do not charge the customer again.

Enable Supabase leaked-password protection if supported by your plan: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . The final security advisor reported it disabled.

The package is for real local operation, with no sample admin bypass. Builds and live schema/readiness checks passed. Your private backend credentials were unavailable here, so authenticated end-to-end actions, uploads and real provider delivery were not executed from this environment. Performance still depends on your computer, network, media size and provider availability; no honest implementation can promise zero lag or zero failures.

## Google sign-in returns to a disabled membership checkout

Google sign-in creates/restores your account; paid access comes from the active subscription in Supabase. An active subscriber proceeds to their profile/app. An account without an active subscription chooses a plan. Continue with Google always requests account selection, and Use a different account signs out the current local session.

If card payment is unavailable, copy your working backend/.env and confirm STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are populated. Restart the backend after editing .env, then click Check availability again on checkout. For localhost, keep signed Stripe webhook forwarding running to http://localhost:4000/api/payments/webhook. The webhook secret must match the forwarding listener or deployed endpoint. Never paste private keys into the client or admin environment files.

A connection error on checkout is shown separately and can be retried. No subscription is activated merely by signing in or selecting a plan.

## Independent profile viewing history

Continue Watching, Recently Watched, resume position, watched labels, and viewing recommendations now belong to the selected profile. Newly created profiles start with empty history. The backend validates profile ownership before saving progress; the database also enforces ownership. Progress saved while closing a player stays with the profile that started playback.

The profile-history migration is already applied to the existing project. Previous viewing records had no profile identifier, so they were retained under each account's first profile (oldest creation date, then profile ID). They were not duplicated across profiles. For a fresh project, apply database/profile-history.sql after the previous database scripts.

Replace both backend and client with this revision, copy your working backend/.env, and restart. The frontend archive includes regenerated compressed files so the browser receives the updated build.

## Independent profile merchandise purchases

Each profile now has its own merchandise bag, checkout form, and order history. Bags are saved separately on this browser using the account and profile IDs. Switching profiles resets the delivery form so another viewer's recipient details are not copied. The old unscoped browser bag is left untouched and is not assigned to a profile because its owner is unknown.

COD orders and Stripe checkouts save the purchasing profile in Supabase. Returning from a paid card checkout removes only the purchased quantities from the original profile's bag, even if a different profile is now selected. Admin Orders shows the purchasing profile; stock, receipts to the account email, and the account subscription remain shared account/store services. Deleting a profile preserves financial records and its recorded purchase name.

The profile-commerce migration is already applied to your current project. Existing merchandise orders are preserved under the account's lowest-ID profile. For a fresh project, apply database/profile-commerce.sql after profile-history.sql and checkout-reservations.sql. Do not rerun SQL just to start this package.

## Client library corrections

Continue Watching now uses the full shelf width and the same left gutter as other rows, including when only one or two titles are present. Favorites and Watchlist now have authenticated backend routes matching the client's requests. They save to the existing Supabase tables, survive reloads, and can be removed from cards or My List. Duplicate saves return the existing record rather than creating a second entry. Delayed bootstrap responses cannot overwrite an in-flight list change.

Because You Watched always names this profile's latest title with saved progress greater than zero. Replay updates are sorted by watch date even when the record already existed. The row contains unseen titles from that title's genre, including movies and shows when available; zero-progress records and hover previews do not determine the heading.

This revision requires restarting the backend as well as using the updated client, because the list routes were corrected in the backend. Extract a fresh copy, retain your configured backend/.env, and run the included setup/start scripts. No additional SQL migration is needed for these three corrections.

## Movies and Shows collection design

Both collection pages now share a cinematic spotlight within the original padded board. Complete artwork remains contained, with feathered edges and a soft blurred backdrop. The collection header includes its actual title count and genre filter; feature typography, metadata, glass controls and the small collection signature follow the logo colors. Mobile artwork appears above the copy and all three action buttons stay on one row. Existing trailer playback, details, save controls and catalog data continue to use the same integrations.

## Independent personal libraries and notification inboxes

Favorites and Watchlist are saved by both account and selected profile. A new profile starts with its own empty library; switching profiles or reloading restores only that profile’s items. Each profile also has its own notification inbox and read state. General account/content announcements are delivered separately to every existing profile; merchandise payment notices target the purchasing profile. Account subscriptions and receipt emails remain account-level.

Legacy Favorites, Watchlist and notifications were retained under the account’s lowest-ID profile. Old saved items for accounts without a profile remain preserved and are assigned when their first profile is created. They are not copied into new profiles. The profile-personalization migration is already applied to your connected Supabase project. Start with this updated client AND backend; older clients do not send the required profile identifier.

Automatic hero previews stop when the artwork leaves the viewport. Scrolling dismisses expanded hover previews, including horizontal shelf scrolling. Returning to visible artwork can start a muted preview; explicit Play still opens the trailer player.

Title cards keep the progress caption inside the card. Favorites and Watchlist actions stay visible and can be clicked or focused directly without opening the hover preview first.
