import { createClient } from "@/lib/supabase/server";
import CityGrid from "@/components/CityGrid";
import AddVisitForm from "@/components/AddVisitForm";
import { getCurrentAppUser } from "@/lib/auth";

export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();
  const currentUser = await getCurrentAppUser();

  const { data: visits } = await supabase
    .from("visits")
    .select("id, city, start_date, end_date, activities, users(id, name, bio, linkedin_url, activity_preferences, payment_status)")
    .gte("end_date", new Date().toISOString().split("T")[0])
    .order("start_date", { ascending: true });

  // Group visits by city
  const citiesMap: Record<string, { city: string; slug: string; count: number; nextDate: string }> = {};
  for (const v of visits ?? []) {
    if (!citiesMap[v.city]) {
      citiesMap[v.city] = {
        city: v.city,
        slug: encodeURIComponent(v.city),
        count: 0,
        nextDate: v.start_date,
      };
    }
    citiesMap[v.city].count++;
  }
  const cities = Object.values(citiesMap).sort((a, b) => b.count - a.count);

  const hasOwnVisit = !!currentUser && (visits ?? []).some((v) => v.users?.id === currentUser.id);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Who else is visiting?</h1>
        <p className="text-gray-500">Add your trip and privately connect with others in the same city.</p>
      </div>

      {currentUser && !hasOwnVisit && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-700 text-center">
          👋 Add your first visit to get started!
        </div>
      )}

      <AddVisitForm currentUserId={currentUser?.id ?? null} />

      {cities.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No upcoming visits yet.</p>
          <p className="text-sm mt-1">Add yours above to get started!</p>
        </div>
      ) : (
        <CityGrid cities={cities} />
      )}
    </main>
  );
}
