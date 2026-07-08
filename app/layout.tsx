import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthNav from "@/components/AuthNav";
import { getCurrentAppUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "HierLah",
  description: "Discover who else is visiting your city and arrange private meet-ups.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentAppUser();

  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen">
        <nav className="bg-slate-950 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="text-xl font-extrabold text-white tracking-tight">HierLah</a>
            <div className="flex items-center gap-4">
              <a href="/inbox" className="text-sm text-slate-300 hover:text-teal-400 transition-colors">Inbox</a>
              <AuthNav userName={currentUser?.name ?? null} />
            </div>
          </div>
        </nav>
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
