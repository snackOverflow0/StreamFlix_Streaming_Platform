# Admin UI v2 — prototype design moved into the real admin

Your API calls, Supabase auth, Stripe logic and database schema are unchanged.
Every Add/Edit/Delete/Archive/Restore and status update still goes through the same `apiRequest` calls as before.

## New files
- `admin/src/features/admin/Dashboard.tsx`: the new dashboard.
  - Uses only the data the admin already loads: content, licenses, subscriptions, orders and feedback.
  - No made-up numbers.
  - Shows "Needs your attention", a 12-month chart of new subscriptions and titles added, recently added posters, and subscription status.
- `admin/src/features/admin/DesignSystem.tsx`: a reference page with four tabs.
  - Colors (60–30–10), type and spacing, Gestalt principles, and Sonner toast demos.
  - The color swatches read the live CSS tokens, so they always match the real theme.
- `admin/src/features/admin/admin-v2.css`: the design tokens and the new layout. Loaded last, so it applies across every page.

## Changed files
- `AdminApp.tsx`
  - New page shell:
    - Sidebar sections fold up; only Workspace and the current section start open.
    - New Collapse button.
    - Top bar shows the breadcrumb, page title and the page's main action.
  - The big page headings were removed, so pages fit one screen.
  - Saves and errors now show as Sonner toasts.
  - Routes for Dashboard and Design System.
- `ContentWorkspace.tsx`: the Catalog, Movies and TV Series pages.
  - Poster grid (10 per page) or table (8 per page).
  - Status filter chips: Visible, Hidden, License expired, Missing license, No poster.
  - Sort control and a details panel with the visibility switch, Preview, Edit and More actions.
  - Same toggle, edit and view handlers as before.

## Test checklist (run on your computer)
1. `cd admin && npm install && npm run build`. It should finish with no errors.
2. `npm run dev`, sign in as admin and open the Dashboard. Check the numbers match your data.
3. Catalog:
   - Switch between grid and table, use each filter chip, and page through.
   - Select a title and flip "Visible to users". It should save, show a toast, and the client app should update.
4. Add a title and edit a title. The form opens, saves, and a toast appears.
5. Click through every sidebar page. Each should still load its records.
6. Click Collapse. The sidebar should shrink to icons and expand again.
7. On a phone-width window, the menu button should open the sidebar.

## v2 full port (every page matches the prototype)
All pages now use the prototype layouts. Every number, list and chart comes from your Supabase data. No sample data is used. CRUD, API calls and Stripe logic are unchanged.
- Dashboard: Needs your attention, 12-month trend, recently added, subscription status
- Catalog: poster grid/table, status chips, detail panel with visibility switch
- Users, Subscriptions (period bar + Stripe box), Plans (cards with active switch), Orders (Mark paid + status), Merchandise
- Seasons/Episodes: series list with season accordion
- Feedback inbox, Reviews with rating summary
- Genres, Licensing timeline, Media Assets library, Archived (Restore)
- Email Delivery, Analytics, Settings tabs, Design System page, Sonner toasts
New files: Dashboard.tsx, DesignSystem.tsx, AnalyticsPage.tsx, admin-v2.css
