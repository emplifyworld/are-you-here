"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthNav({ userName }: { userName: string | null }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!userName) {
    return (
      <a href="/login" className="text-sm font-medium text-teal-400 hover:text-teal-300">
        Log in
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <a href="/profile/edit" className="text-sm text-slate-300 hover:text-teal-400 transition-colors">
        {userName}
      </a>
      <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
        Log out
      </button>
    </div>
  );
}
