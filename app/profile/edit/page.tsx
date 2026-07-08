import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/lib/auth";
import ProfileEditForm from "@/components/ProfileEditForm";

interface Props {
  searchParams: Promise<{ welcome?: string }>;
}

export default async function ProfileEditPage({ searchParams }: Props) {
  const currentUser = await getCurrentAppUser();
  if (!currentUser) redirect("/login");

  const { welcome } = await searchParams;

  return (
    <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div>
        <a href="/" className="text-sm text-indigo-600 hover:underline">← Home</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Edit your profile</h1>
      </div>
      <ProfileEditForm user={currentUser} welcome={welcome === "1"} />
    </main>
  );
}
