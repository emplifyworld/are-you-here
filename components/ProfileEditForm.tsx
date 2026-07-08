"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { AppUser } from "@/lib/auth";

const ACTIVITY_OPTIONS = ["coffee", "hiking", "meal", "movie"];
const ACTIVITY_ICONS: Record<string, string> = { coffee: "☕", hiking: "🥾", meal: "🍽️", movie: "🎬" };

export default function ProfileEditForm({ user, welcome }: { user: AppUser; welcome: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(
    user.linkedin_url.startsWith("pending-") ? "" : user.linkedin_url,
  );
  const [activities, setActivities] = useState<string[]>(user.activity_preferences ?? []);
  const [loading, setLoading] = useState(false);

  function toggleActivity(a: string) {
    setActivities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    if (!linkedinUrl.trim()) { toast.error("Please enter your LinkedIn URL"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim() || null,
          linkedin_url: linkedinUrl.trim(),
          activity_preferences: activities,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save profile");
      toast.success("Profile saved!");
      router.push(`/profile/${user.id}`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {welcome && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-sm text-teal-700">
          Welcome! Complete your profile to start finding matches.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
          <input
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/you"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="A short intro for your profile..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Activity preferences</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_OPTIONS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleActivity(a)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  activities.includes(a)
                    ? "bg-teal-500 border-teal-500 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-600 hover:border-teal-300"
                }`}
              >
                {ACTIVITY_ICONS[a]} {a}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-teal-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}
