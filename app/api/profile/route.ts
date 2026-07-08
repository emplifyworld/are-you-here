import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAppUser } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const currentUser = await getCurrentAppUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = await createClient();
  const body = await req.json();
  const { name, bio, linkedin_url, activity_preferences } = body;

  if (!name || !linkedin_url) {
    return NextResponse.json({ error: "name and linkedin_url are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      name,
      bio: bio ?? null,
      linkedin_url,
      activity_preferences: activity_preferences ?? [],
    })
    .eq("id", currentUser.id)
    .select()
    .single();

  if (error) {
    const message = error.code === "23505" ? "That LinkedIn URL is already in use" : error.message;
    return NextResponse.json({ error: message }, { status: error.code === "23505" ? 409 : 500 });
  }

  return NextResponse.json(data);
}
