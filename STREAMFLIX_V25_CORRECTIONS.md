# StreamFlix v25 — UI/Functionality Corrections

Additional corrections applied on top of the v24 redesign:

- Fullscreen now fullscreen-requests the custom player shell instead of the `<video>` element, preserving the custom Netflix-style controls and overlays.
- Movie cards now have reliable click-to-details behavior while Play, Watchlist, Favorite, and More Info remain independent actions.
- Hover previews use a fixed portal overlay with delayed open/close, viewport-aware positioning, pointer tracking, and no layout shift.
- Homepage order is Continue Watching → Because You Watched → Recommended For You → Top 10 → genre rows.
- Top 10 is a fixed 10-title grid with no carousel arrows.
- Genre rows render only when real catalog content exists and remain horizontally navigable.
- Search input and backend query handling are capped at 55 characters.
- Profile avatar URLs are normalized to HTTP(S), nullable when absent, and real avatar uploads are supported through a dedicated Supabase Storage bucket with authenticated ownership policies.
- Avatar uploads validate image type, size, and dimensions before upload.

Verification performed:
- Frontend TypeScript project check: passed in the current environment.
- Changed TS/TSX syntax check: passed.
- Empty/fake click handlers search: no matches found.
- Backend full type-check remains dependency-limited in this environment because backend node_modules are not installed.
