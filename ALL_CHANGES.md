# Complete StreamFlix update

Includes Kids add/edit toggles stored in Supabase, approved Kids catalog and playback protection, client-to-admin design matching, cool admin colors, mobile admin control layout, Vite fixes, production hardening and client trailer playback repair.

Playback requests now include selected owned profile_id and use backendAsset for relative URLs. Uses trailer_url only. Final source and compiled entry references were checked in the archive.

Toy Story 5 and Minions and Monsters are approved Kids titles. The Godfather trailer file is missing from Supabase Storage: upload the actual file or relink that title in admin. Other titles still require valid licenses and active subscriptions.

Builds and mocked playback/authorization/profile-isolation checks passed. Live browser playback and mobile visual acceptance remain pending.

Stop terminals, extract into a fresh folder, copy working .env files, run npm ci then npm run dev in backend, client and admin. Press Ctrl+Shift+R once. Client localhost:5173, admin localhost:5174.
