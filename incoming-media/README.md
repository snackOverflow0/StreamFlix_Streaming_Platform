# Automatic trailer import
Put trailer files here and add mappings to ../media-imports.json:

```json
[{"content_id":21,"file":"incoming-media/godfather-trailer.mp4","replace_existing":true}]
```
Restart start-windows.bat. The backend uploads to Supabase Storage using its private
server key, then attaches the file to the specified existing title. It skips
identical uploaded files and preserves existing remote trailers unless replacement
is explicitly requested. Automatic imports accept files up to 64 MB; use Admin
for larger files. It does not invent films or publish unlicensed content.
The packaged Mean Girls fallback imports only if its remote trailer is absent.
The Godfather trailer is not included: add its correct file to repair playback.
