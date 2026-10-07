# StreamFlix v28 — Playback & Hover Action Fixes

## Fixed

- Fixed hover-card Play, Watchlist, Favorite and More Info buttons being interrupted by portal re-renders during pointer interaction.
- Hover preview position is no longer recalculated on every pointer move or pointer-down.
- Added stable portal reference and card/panel related-target checks so the hover panel remains interactive when the pointer moves between the card and its expanded preview.
- Preserved the existing backend-derived optimistic Favorite and Watchlist actions.
- Preserved the custom StreamFlix player shell and custom fullscreen implementation.

## Verification

- Reviewed the hover event flow and removed the state update that could replace the portal button between pointerdown and click.
- ZIP integrity checked after packaging.
