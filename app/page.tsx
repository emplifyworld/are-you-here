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
    <>
      <div className="bg-slate-950 px-4 py-10">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Unlock real connections.</h1>
          <p className="text-teal-300 font-medium">Meet someone during your trip.</p>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-2 text-sm text-slate-300">
            <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Find who&apos;s in the same city</li>
            <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Find the common interest</li>
            <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Send a private request</li>
            <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Meet up in person!</li>
          </ul>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

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
    </>
  );
}
