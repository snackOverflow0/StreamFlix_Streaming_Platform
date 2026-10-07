# StreamFlix Cookie Preferences

Added a first-party cookie consent experience to the frontend.

## Cookies

- `streamflix_cookie_consent` — stores the user's consent choice for 180 days.
- `streamflix_cookie_preferences` — stores functional/analytics preference selections for 180 days.

The app defaults to essential cookies only until the visitor makes a choice. A persistent **Cookie Settings** button lets the visitor reopen the preferences later.

Cookies are set with `SameSite=Lax`, a `/` path, and `Secure` automatically when StreamFlix is served over HTTPS.

No third-party analytics service is enabled by this change; the analytics toggle only stores the user's preference.
