import { supabase } from "@/lib/supabase";

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_DIMENSION = 2048;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadProfileAvatar(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) throw new Error("Choose a JPG, PNG, or WebP image.");
  if (file.size > MAX_BYTES) throw new Error("Avatar images must be 2 MB or smaller.");

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error("The selected avatar could not be read as an image.");
  const { width, height } = bitmap;
  bitmap.close();
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) throw new Error("Avatar dimensions must be 2048×2048 or smaller.");

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Your session has expired. Please sign in again.");

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("profile-avatars").upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error("Avatar upload failed. Please try again.");

  return supabase.storage.from("profile-avatars").getPublicUrl(path).data.publicUrl;
}
