# Admin and client now match the prototypes

## Admin
- **Stylesheet:** the admin now uses the prototype's own stylesheet, unchanged (`admin-proto.css`), scoped to the admin so nothing else affects it.
- **The button padding bug is fixed:** the old `admin.css` set `.sf-admin button{padding:0}`, which removed the padding from every new button and row. That is why the "Needs your attention" arrows touched the card edge. The old stylesheets are no longer loaded.
- **Same markup and icons:** every page is rebuilt with the prototype's markup and its icon set:
  - sidebar, top bar and the per-page action button
  - Dashboard, Analytics, Catalog, Movies and TV Series
  - Seasons, Episodes, Media Assets and Archived
  - Subscribers, Subscriptions and Plans
  - Feedback and Reviews
  - Merchandise, Orders and Email Delivery
  - Settings, Genres, Licensing and Design System
- **Dialogs in the prototype style:** add/edit forms, the title preview drawer and the delete/archive confirmations. They replace the browser's `confirm()` boxes.
- **Data:** every number comes from Supabase. Saves use the same API calls as before.

## Client
- **Cards:** hovering a card shows the preview card, with a muted trailer, Play, My List, Favorite and More info.
- **Menus:** the profile button opens the prototype's menu: switch profile, Account, Subscription, Send feedback and Sign out. The bell opens the notifications menu.
- **Title details:** "Rate it" sits in the details column, and Reviews sit below it.
- **Fonts:** both apps now load the prototype's fonts. The client uses Archivo and Manrope; the admin uses Plus Jakarta Sans and JetBrains Mono. Both `index.html` files allow Google Fonts in their security policy.

## Files you can delete (no longer used)
- `admin/src/features/admin/admin.css`
- `admin/src/features/admin/admin-premium.css`
- `admin/src/features/admin/admin-v2.css`
- `admin/src/features/admin/WorkspaceVisuals.tsx`
- `admin/src/features/admin/MostViewed.tsx`
- `admin/src/features/admin/UserSubscriptions.tsx`

They are harmless if you keep them.
