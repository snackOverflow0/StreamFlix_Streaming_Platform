STREAMFLIX PATCH — 2026-10-12

Apply: Extract this ZIP into C:\Users\Christopher\Desktop\StreamFlix_Integrated, merging files. Back up first.

IMPLEMENTED (source-level; not device-tested):
- Client mobile login fits short screens; profile cards stop hover movement; editing dialogs scroll within viewport; login logo uses bundled local path.
- Admin merchandise Add Product mobile grid reflows to one column.
- Admin media uploader validates supported video/image formats and file size and reports large-upload errors clearly. Original resumable TUS uploader is preserved.

NOT CLAIMED FIXED:
- Large media uploads remain subject to Supabase bucket/object-size settings and TUS endpoint compatibility. Test upload on your project.
- APK images (logo and avatars) require client/public/streamflix assets and network accessibility; source-only ZIP contains NO static public assets. Copy existing client/public/streamflix assets into mobile build.
- Google OAuth / Stripe mobile return and missing profiles require compatible current auth/deep-link integration and real-device testing. This source collector contains an older Google OAuth implementation than the previously supplied fix. DO NOT overwrite useStreamFlix.ts from earlier fix with the version in this archive. No auth/backend checkout source is replaced here.

BUILD:
cd client
npm run build:mobile
cd ..\admin
npm run build
Then assemble Android debug APK in Android Studio. Ensure .env.mobile backend IP points to current PC IP, and phone browser can open /api/ready.

Large upload troubleshooting: Supabase Dashboard > Storage > bucket file size limit. Test a small MP4, then a large MP4. A 512-MB allowance in your API does not override Supabase project/bucket limits.

Stripe: current backend/src/payments.routes.ts constructs checkout success_url with CLIENT_URL, so an APK external browser cannot reach localhost. Needs a publicly accessible HTTPS callback / Android App Link or a network-reachable redirect bridge and Stripe webhook-based verification. A compile-only patch cannot attest payment works.
