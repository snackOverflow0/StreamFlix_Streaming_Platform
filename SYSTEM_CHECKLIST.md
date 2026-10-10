# StreamFlix full system checklist

Use this as a release acceptance checklist. Unchecked items require testing in your running app; an implemented feature is not automatically a passed test. Record tester, date, environment and evidence beside each result.

Release: __________  Tester: __________  Date: __________
Client URL: __________  Admin URL: __________  Backend URL: __________

## Changes included

- [x] Mobile admin outer frame changed from fixed-height/clipped overflow to document scrolling.
- [x] Sidebar and dialogs retain their own touch scrolling.
- [x] Previous Kids, design, trailer request and security updates retained in this package.

## Admin access and navigation

- [ ] Admin sign-in succeeds with an authorized account.
- [ ] Anonymous users cannot access admin APIs.
- [ ] Signed-in non-admin users cannot access admin APIs.
- [ ] Sidebar groups expand/collapse and every page opens.
- [ ] Mobile menu opens/closes; dismiss overlay does not block the closed page.
- [ ] Logout ends admin access; browser Back does not expose protected data.
- [ ] Loading, empty, error and retry states are usable.

## Admin catalog

- [ ] Movies can be created, searched, filtered, edited and activated/deactivated.
- [ ] Required fields reject missing/invalid data without losing the form.
- [ ] Posters, previews, hero images and trailer_url are saved and displayed.
- [ ] Trailer playback uses trailer_url; no video_url dependency is introduced.
- [ ] Catalog pagination and details show correct records.
- [ ] Archive and restore work without accidentally deleting related records.
- [ ] Genres can be created, edited and linked to titles.
- [ ] Licenses can be created/edited; expired or missing licenses block playback.
- [ ] Series, seasons and episodes retain correct parent relationships.
- [ ] Episode numbering, dates, duration and trailer references save correctly.
- [ ] Kids approval checkbox persists after reload.
- [ ] Unapproved PG, teen, adult and unknown-rated titles stay out of Kids browsing.

## Admin audience, commerce and community

- [ ] User search, filters, account status changes and details work.
- [ ] User subscription history and plan details match the database.
- [ ] Plan price, quality, member limit and activation settings save correctly.
- [ ] Membership/profile limits are enforced server-side.
- [ ] Products, price, stock, variants and listing status save correctly.
- [ ] Product image uploads and replacements render after reload.
- [ ] Order details include correct items, amounts, delivery details and profile.
- [ ] Payment/order transitions reject invalid combinations.
- [ ] Reviews, star ratings and moderation reflect real records.
- [ ] Feedback inbox, details and resolution status persist.
- [ ] Analytics, most-viewed titles and visitor totals use real data.
- [ ] Notifications refresh after relevant changes.
- [ ] Settings/branding save; settings export downloads usable JSON.
- [ ] Asset uploads, storage picker and failed-upload feedback work.
- [ ] Email delivery queue, status and retry controls work.

## Admin mobile and accessibility

Test 320, 375, 390, 768 and 800 px widths, portrait/landscape, Chrome Android and Safari iOS if available.

- [ ] Every long page scrolls to its final row and footer.
- [ ] Sidebar scroll reaches every section and Logout.
- [ ] Menu overlay is removed when the menu closes.
- [ ] All buttons, switches, filters and pagination controls remain visible.
- [ ] Wide tables scroll horizontally without preventing vertical page scrolling.
- [ ] Editors scroll to Save/Cancel; keyboard does not hide the final fields.
- [ ] Headers/toolbars wrap without overlap or cut text.
- [ ] Touch targets are usable and do not require hovering.
- [ ] Focus indicators, labels, keyboard navigation and switch state are accessible.
- [ ] Reduced-motion mode works; no orange accent/halo remains.
- [ ] Desktop scrolling and layout still work above 800 px.

## Client authentication and profiles

- [ ] Email registration, validation, sign-in and sign-out work.
- [ ] Google sign-in and configured redirect URLs work.
- [ ] Password reset email and recovery flow work.
- [ ] Subscription selection/renewal reaches the correct checkout.
- [ ] Profile creation, edit, delete, avatar choice and limits work.
- [ ] Add-profile Kids switch stores profiles.is_kids.
- [ ] Edit-profile Kids switch persists and reloads accurately.
- [ ] Renaming a Kids profile does not disable Kids mode.
- [ ] A normal profile whose name contains “kid” is not automatically restricted.
- [ ] Existing migrated Kids profiles retain Kids mode.
- [ ] Switching profile clears prior playback and refreshes personal data.

## Client browsing and playback

- [ ] Home, movies, TV shows, search and genre filters display licensed active content.
- [ ] Title details include cast, synopsis, rating, license and episode information.
- [ ] Top 10 shows at most ten entries with aligned numbers/posters.
- [ ] Hover previews stop when leaving the card or scrolling away.
- [ ] Mobile interactions work without hover.
- [ ] Movie/episode Play sends the selected owned profile_id.
- [ ] Playback receives a usable fresh trailer_url and loads the media.
- [ ] Relative media paths resolve to the backend origin.
- [ ] Pause, resume, seek, mute, fullscreen and close work.
- [ ] Progress updates persist for the selected profile only.
- [ ] Resume selects the correct movie/episode position.
- [ ] Expired subscriptions, licenses and missing files show clear errors.
- [ ] Kids browsing, search, favorites, watchlist and recommendations contain suitable titles only.
- [ ] Direct playback of unsuitable content is rejected for Kids profiles.
- [ ] Approved Toy Story 5 and Minions and Monsters appear when active/licensed.

## Client personal features and merchandise

- [ ] Favorites and watchlist save/remove without accidental card preview opening.
- [ ] Identical titles can be saved independently by different profiles.
- [ ] Continue Watching and Recently Watched show the selected profile's actual history.
- [ ] “Because You Watched” uses the latest watched title and relevant recommendations.
- [ ] Notifications and read/read-all status stay profile-specific.
- [ ] Reviews validate stars/comments and persist after reload.
- [ ] Merchandise catalog, cart, quantity and total calculations are correct.
- [ ] Out-of-stock items cannot be purchased; stale stock cannot oversell.
- [ ] Delivery/pickup details validate and persist.
- [ ] COD ordering, card checkout and receipts work.
- [ ] Any displayed GCash option is verified against the configured provider; do not assume support from the label.
- [ ] Purchase history, receipts and order status remain profile-specific.

## Backend API and security

- [ ] backend/.env contains valid server-only credentials; no secrets are in client/admin bundles.
- [ ] Authentication verifies bearer tokens and ownership on personal operations.
- [ ] Admin permissions are checked server-side on every management method.
- [ ] Inputs, IDs, JSON bodies and body-size limits reject invalid requests.
- [ ] API errors do not expose database internals or tokens.
- [ ] CORS allows only intended frontend origins.
- [ ] Rate limiting returns 429 and Retry-After under excessive requests.
- [ ] Trusted proxy settings match the actual deployment topology.
- [ ] Sensitive responses use no-store and are not cached by a CDN.
- [ ] Request IDs/logs allow errors to be traced without exposing personal/payment data.
- [ ] Liveness/readiness endpoints reflect process/database health.
- [ ] HTTP timeouts and graceful shutdown behave correctly.
- [ ] Change-event streams reconnect and respect user/admin scope.
- [ ] Checkout and email workers recover from failure without duplicate work.
- [ ] Automated admin, Kids, library/profile, receipt and commerce checks pass.

## Supabase database, Auth and Storage

- [ ] Required migration/RPC functions exist and schema cache is refreshed.
- [ ] profiles.is_kids and content.is_kids_suitable exist in every environment.
- [ ] Profile/content flag values survive database readback.
- [ ] RLS and table grants restrict browser roles appropriately.
- [ ] Service-only tables remain inaccessible to browser clients.
- [ ] Role claims cannot be assigned through user-editable metadata.
- [ ] Auth redirects, password policy, rate limits and leaked-password protection are configured.
- [ ] Storage buckets/paths match saved references; signed URLs refresh correctly.
- [ ] Missing Godfather trailer is uploaded or relinked to an actual file.
- [ ] Every catalog and episode trailer object exists and plays.
- [ ] Index/policy advisor findings are reviewed in staging.
- [ ] Backup/PITR plan is configured and restoration is rehearsed in a separate project.

## Stripe and payment acceptance

Use Stripe test mode for acceptance; do not mark these passed based on a build.

- [ ] Secret key and webhook signing secret belong to the same intended account/mode.
- [ ] Checkout return/cancel URLs use the intended client origin.
- [ ] Checkout prices/totals are calculated server-side.
- [ ] Unauthenticated/foreign-user checkout requests fail.
- [ ] Successful subscription payment activates the correct account/plan.
- [ ] Successful merchandise payment creates the correct order and stock change.
- [ ] Declined, cancelled and abandoned payments do not grant access or mark orders paid.
- [ ] Invalid webhook signatures fail; verified events are accepted.
- [ ] Duplicate webhook delivery does not duplicate activation, stock deduction or receipts.
- [ ] Delayed/out-of-order events and provider outages recover safely.
- [ ] Expired checkout reservations release stock.
- [ ] Renewal/expiry/cancellation follow the implemented subscription rules.
- [ ] Receipts and transactional emails arrive with correct details.
- [ ] Refund/dispute handling is explicitly defined and tested if offered.
- [ ] Live-mode cutover is checked separately after test-mode acceptance.

## Build, deployment and operations

- [ ] npm ci succeeds using committed lockfiles in backend/client/admin.
- [ ] All three builds pass; source HTML uses /src/main.tsx and dist HTML references existing assets.
- [ ] Dev mode and packaged mode start independently without port conflicts.
- [ ] HTTPS, CSP response headers, HSTS and reverse proxy settings are configured.
- [ ] Hashed assets use immutable caching; HTML refreshes correctly after release.
- [ ] Gzip and video range requests work through hosting/CDN.
- [ ] Real browser acceptance tests pass on desktop and mobile.
- [ ] Staging load tests meet written latency/error/concurrency targets.
- [ ] Alerts cover failed readiness, 5xx, latency, worker failures and email backlog.
- [ ] Rollback, backup restore and recovery ownership are documented.
- [ ] Shared rate limiting/event fanout are added before multiple backend replicas.
- [ ] Commit excludes .env, node_modules and secrets; source, lockfiles and SQL are retained.

## Sign-off

Open issues: __________
Evidence / screenshots / logs: __________
Approved by: __________  Date: __________
