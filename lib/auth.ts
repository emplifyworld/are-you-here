import { createClient } from "@/lib/supabase/server";

export interface AppUser {
  id: string;
  user_id: string;
  name: string;
  bio: string | null;
  linkedin_url: string;
  activity_preferences: string[];
  payment_status: string;
}

/**
 * Resolves the signed-in Supabase auth user to their `users` row.
 * Returns null if not signed in, or if signed in but no users row exists yet
 * (shouldn't normally happen — the auth callback creates one on first login).
 */
export async function getCurrentAppUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: appUser } = await supabase
    .from("users")
    .select("id, user_id, name, bio, linkedin_url, activity_preferences, payment_status")
    .eq("user_id", user.id)
    .single();

  return appUser ?? null;
}
