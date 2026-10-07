StreamFlix video_url removal — replacement files

Replace the existing files in your current project with the matching files here.

Changed backend files:
- backend/src/modules/admin/admin.routes.ts
- backend/src/modules/admin/management.ts
- backend/src/modules/admin/uploads.ts

Changed frontend files:
- frontend/src/features/admin/AdminApp.tsx
- frontend/src/features/admin/ManagementWorkspace.tsx
- frontend/src/features/admin/MediaUpload.tsx
- frontend/src/features/admin/WorkspaceVisuals.tsx

Changed database migrations:
- supabase/migrations/20261007210000_streamflix_admin_workspace.sql
- supabase/migrations/20261007220000_remove_video_url.sql

What this fixes:
- Removes content.video_url from admin SELECTs and writable fields.
- Removes episodes.video_url from admin management and UI.
- Removes the admin playback-upload path that depended on video_url.
- Keeps normal media asset uploads (including video assets) in streamflix-media.
- Cleanup migration safely drops legacy content.video_url / episodes.video_url if they exist.

After replacing the files:
1. Restart backend.
2. Apply the cleanup migration in Supabase if your migration system has not already applied it.
3. Verify /api/admin/bootstrap no longer requests content.video_url.
