import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.redirect(`${origin}/`);
  }

  const defaultName = (user.email ?? "New user").split("@")[0];
  const { error: insertError } = await supabase.from("users").insert({
    user_id: user.id,
    linkedin_url: `pending-${user.id}`,
    name: defaultName,
    activity_preferences: [],
    payment_status: "free",
  });

  if (insertError) {
    return NextResponse.redirect(`${origin}/login`);
  }

  return NextResponse.redirect(`${origin}/profile/edit?welcome=1`);
}
