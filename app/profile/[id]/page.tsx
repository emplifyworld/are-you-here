import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAppUser } from "@/lib/auth";

const ACTIVITY_COLORS: Record<string, string> = {
  coffee: "bg-amber-100 text-amber-700",
  hiking: "bg-green-100 text-green-700",
  meal: "bg-orange-100 text-orange-700",
  movie: "bg-purple-100 text-purple-700",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const currentUser = await getCurrentAppUser();

  const { data: user } = await supabase
    .from("users")
    .select("id, name, bio, linkedin_url, activity_preferences, payment_status")
    .eq("id", id)
    .single();

  if (!user) notFound();

  const isOwnProfile = currentUser?.id === user.id;
  const linkedinUrl = user.linkedin_url.startsWith("pending-") ? null : user.linkedin_url;

  return (
    <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <a href="/" className="text-sm text-indigo-600 hover:underline">← Home</a>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            {user.payment_status === "paid" && (
              <span className="inline-block mt-1 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">Pro</span>
            )}
          </div>
          {isOwnProfile && (
            <a href="/profile/edit" className="text-sm text-indigo-600 hover:underline whitespace-nowrap">
              Edit profile
            </a>
          )}
        </div>

        {user.bio && <p className="text-sm text-gray-600">{user.bio}</p>}

        {(user.activity_preferences ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {user.activity_preferences.map((a: string) => (
              <span key={a} className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTIVITY_COLORS[a] ?? "bg-gray-100 text-gray-600"}`}>
                {a}
              </span>
            ))}
          </div>
        )}

        {linkedinUrl ? (
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline inline-block">
            LinkedIn ↗
          </a>
        ) : (
          isOwnProfile && <p className="text-xs text-gray-400">Add your LinkedIn URL from Edit profile.</p>
        )}
      </div>
    </main>
  );
}
