# Client design and Kids catalog update

The client now follows the admin violet glass surfaces, blue-violet buttons, rounded controls, navigation highlights, typography and dialogs. Browsing structure, poster sizes and category board padding are retained.

Profiles whose name contains "kid" use the same Kids identification rule as the existing project. The catalog includes only G, TV-Y, TV-Y7, TV-Y7-FV, TV-G, U, ALL, 0+, 6+ and 7+ ratings. PG, PG-13, teen/adult, unknown and unrated titles are excluded. Genres such as Animation are not treated as proof of age suitability. Set each title's accurate age_rating through the admin editor.

Filtering covers Home, Movies, TV Shows, search, favorites, watchlist, continue watching, recently watched and recommendation cards. Playback requires an owned profile_id and rejects unsuitable Kids titles. Movies and series use the same rating rule. This is catalog filtering, not a PIN-protected parental-control system; the current app still allows profile switching and profile renaming.

No database migration is needed. Start this full project with start-windows.bat using your existing environment files. Built client/backend output is included. External playback clients must now send profile_id in the playback request.

Backend/client builds and Kids playback regression tests passed. Browser visual verification could not run because this environment lacks a browser executable. Live authenticated Supabase playback was not tested.
