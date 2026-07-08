import InboxClient from "@/components/InboxClient";
import { getCurrentAppUser } from "@/lib/auth";

export const revalidate = 0;

export default async function InboxPage() {
  const currentUser = await getCurrentAppUser();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <a href="/" className="text-sm text-indigo-600 hover:underline">← Home</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Connection Requests</h1>
      </div>
      <InboxClient currentUserId={currentUser?.id ?? null} />
    </main>
  );
}
