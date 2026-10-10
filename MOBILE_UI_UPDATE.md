# StreamFlix Mobile UI Update — 10 October 2026

## Admin
- Stronger contrast, 44 x 44 px tap targets and visible borders for mobile catalog action buttons.
- More legible previous/next pagination buttons with clear disabled states.
- Preserve horizontally scrollable tables so the rightmost action buttons remain reachable.

## Client
- Restored normal vertical page scrolling in mobile layouts.
- Enabled native touch swipe and momentum scrolling for movie rows, Top 10, and genre lists.
- Enabled drag-to-scroll using a mouse on horizontal carousels.
- Dragging across a title doesn't accidentally open it.

## Testing
- Open Client and Admin at 375px and 390px viewport widths.
- Verify Client vertical page scroll, horizontal swipe on each carousel, and mouse dragging.
- Verify Admin action buttons can be reached by horizontal table scrolling and pagination remains visible.
- Test login, playback, favorites and Supabase flows after deployment.
- Source modifications were inspected; npm dependencies are not bundled, so production builds and browser testing were not run here.
