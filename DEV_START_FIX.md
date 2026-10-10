# Fix for missing /assets/index-*.js in Vite

This error occurs when development loads cached production HTML or a dist/index.html copied over the source entry. Source index.html must load /src/main.tsx; built HTML belongs inside dist.

## Windows

1. Stop every StreamFlix terminal with Ctrl+C. Extract this ZIP into a NEW folder; do not merge it into the old running folder.
2. Copy your working backend/.env, client/.env and admin/.env into their matching folders. Secret keys belong only in backend/.env.
3. From each folder (backend, client and admin), run npm ci.
4. Start backend with npm run dev; start client and admin with npm run dev in separate terminals.
5. Client: http://localhost:5173/ — Admin: http://localhost:5174/. Press Ctrl+Shift+R once on each page to replace old cached HTML.

For the packaged compiled version, run setup-windows.bat then start-windows.bat from the root instead of npm run dev. Do not run both modes on the same ports.

Changes: source-entry recovery before dev starts, development CSP compatibility with React Refresh, development cache headers, separate untouched production CSP and rebuilt dist assets. Production hardening, Kids filtering and trailer_url playback remain included.

Vite messages about .env/config changes, optimized dependencies and server restarts are normal during edits. A build does not verify live credentials or payments.
