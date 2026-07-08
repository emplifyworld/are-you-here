import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAppUser } from "@/lib/auth";

export async function GET() {
  const currentUser = await getCurrentAppUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("connection_requests")
    .select("*, sender:users!sender_id(id, name, bio, linkedin_url, activity_preferences), recipient:users!recipient_id(id, name, bio, linkedin_url, activity_preferences)")
    .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentAppUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = await createClient();
  const body = await req.json();
  const { recipient_id, message } = body;
  const sender_id = currentUser.id;

  if (!recipient_id) {
    return NextResponse.json({ error: "recipient_id required" }, { status: 400 });
  }
  if (sender_id === recipient_id) {
    return NextResponse.json({ error: "Cannot connect with yourself" }, { status: 400 });
  }

  // Check for duplicate
  const { data: existing } = await supabase
    .from("connection_requests")
    .select("id")
    .eq("sender_id", sender_id)
    .eq("recipient_id", recipient_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Request already sent" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("connection_requests")
    .insert({ sender_id, recipient_id, message: message ?? null, status: "pending" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log activity
  await supabase.from("activity_logs").insert({
    user_id: sender_id,
    action: "connection_sent",
    details: { recipient_id, status: "pending" },
  });

  return NextResponse.json(data, { status: 201 });
}
